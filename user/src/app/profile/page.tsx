'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// 🔑 GEOAPIFY API KEY
const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || 'a330c251723c4cc595016702886e8ba6';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddressId, setDefaultAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false,
  });

  // Geoapify Auto-complete & Geolocation states
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------------------------------------------
  // INITIAL FETCH: Load user profile
  // -------------------------------------------------------------
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent('/profile')}`);
      return;
    }

    setLoading(true);
    setError('');

    fetch('/api/users/profile')
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error || 'Failed to load profile');
        return payload;
      })
      .then(({ profile }) => {
        setName(profile?.name || session?.user?.name || '');
        setEmail(profile?.email || session?.user?.email || '');
        setPhone(profile?.phone || '');
        setAddresses(profile?.addresses || []);
        setDefaultAddressId(profile?.defaultAddressId || '');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  // -------------------------------------------------------------
  // ⚡ DEBOUNCED SEARCH: Auto-fetches suggestions
  // -------------------------------------------------------------
  useEffect(() => {
    if (addressSearchQuery.trim().length < 3) {
      setAddressSuggestions([]);
      setIsSearchingAddress(false);
      return;
    }

    setIsSearchingAddress(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(addressSearchQuery)}&apiKey=${GEOAPIFY_KEY}`
        );
        const data = await res.json();
        setAddressSuggestions(data.features || []);
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [addressSearchQuery]);

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.id === defaultAddressId || address.isDefault),
    [addresses, defaultAddressId]
  );

  const getInitials = (userName: string) => {
    if (!userName) return 'U';
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // -------------------------------------------------------------
  // 📍 1. USE CURRENT LOCATION (REVERSE GEOCODING)
  // -------------------------------------------------------------
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_KEY}`
          );
          const data = await res.json();

          if (data && data.features && data.features.length > 0) {
            const props = data.features[0].properties;

            const streetName =
              [props.housenumber, props.street || props.name].filter(Boolean).join(' ') ||
              props.address_line1 ||
              '';

            const cityName =
              props.city || props.town || props.village || props.suburb || props.county || props.district || '';

            setNewAddress((prev) => ({
              ...prev,
              street: streetName,
              city: cityName,
              state: props.state || props.region || '',
              zipCode: props.postcode || '',
              country: props.country || 'India',
            }));

            toast.success('Current location detected!');
          } else {
            toast.error('Could not determine exact address');
          }
        } catch (err) {
          toast.error('Failed to retrieve location details');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        toast.error('Location access denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // -------------------------------------------------------------
  // 🔍 2. SELECT AUTOCOMPLETE SUGGESTION (FIXED & ROBUST)
  // -------------------------------------------------------------
  const handleSelectSuggestion = (feature: any) => {
    if (!feature || !feature.properties) return;
    const props = feature.properties;

    // Extract street or primary address line
    let streetName = '';
    if (props.housenumber && (props.street || props.name)) {
      streetName = `${props.housenumber} ${props.street || props.name}`;
    } else if (props.street) {
      streetName = props.street;
    } else if (props.name && props.result_type !== 'city') {
      streetName = props.name;
    } else {
      streetName = props.address_line1 || '';
    }

    // Extract city with all common Geoapify fallbacks
    const cityName =
      props.city ||
      props.town ||
      props.village ||
      props.suburb ||
      props.municipality ||
      props.county ||
      props.district ||
      props.state_district ||
      '';

    // Extract state
    const stateName = props.state || props.region || '';

    // Extract postal code & country
    const zip = props.postcode || '';
    const countryName = props.country || 'India';

    // Set updated state
    setNewAddress((prev) => ({
      ...prev,
      street: streetName,
      city: cityName,
      state: stateName,
      zipCode: zip,
      country: countryName,
    }));

    setAddressSearchQuery('');
    setAddressSuggestions([]);
    toast.success('Address auto-filled!');
  };

  // -------------------------------------------------------------
  // PROFILE & ADDRESS API HANDLERS
  // -------------------------------------------------------------
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          defaultAddressId: defaultAddressId || null,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update profile');

      await update({
        user: {
          name,
          email,
          role: session?.user?.role,
        },
      });

      setAddresses(payload.profile?.addresses || []);
      setDefaultAddressId(payload.profile?.defaultAddressId || '');
      toast.success('Profile updated successfully');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to add address');

      setAddresses(payload.profile?.addresses || []);
      setDefaultAddressId(payload.profile?.defaultAddressId || '');
      setNewAddress({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false,
      });
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('Address added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-default', addressId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update default address');
      setAddresses(payload.profile?.addresses || []);
      setDefaultAddressId(payload.profile?.defaultAddressId || '');
      toast.success('Default address updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update default address');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to remove address');
      setAddresses(payload.profile?.addresses || []);
      setDefaultAddressId(payload.profile?.defaultAddressId || '');
      toast.success('Address removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove address');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="h-44 bg-neutral-200 rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-96 bg-neutral-100 rounded-3xl" />
          <div className="lg:col-span-7 h-96 bg-neutral-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Profile Unavailable</h2>
        <p className="text-neutral-500 font-medium mb-6 max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3.5 bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-neutral-800 transition-all shadow-xl active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-950 to-zinc-900 rounded-[18px] p-5 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-58 h-58 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-zinc-950 font-black text-3xl sm:text-4xl shadow-xl ring-4 ring-white/10">
              {getInitials(name || session?.user?.name || '')}
            </div>
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-zinc-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-2 border-neutral-900 shadow-xl">
              Active
            </span>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{name || 'User Profile'}</h1>
              {session?.user?.role && (
                <span className="self-center sm:self-auto px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-widest text-zinc-300 border border-white/10">
                  {session.user.role}
                </span>
              )}
            </div>
            <p className="text-neutral-400 text-sm font-medium">{email}</p>

            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-neutral-300 font-medium">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {addresses.length} {addresses.length === 1 ? 'Saved Address' : 'Saved Addresses'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Information */}
        <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-[20px] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-950">Personal Details</h2>
              <p className="text-xs text-neutral-500 font-medium">Manage your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block mb-2 pl-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5 pl-11 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
                  placeholder="John Doe"
                />
                <svg className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block mb-2 pl-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5 pl-11 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
                  placeholder="name@example.com"
                />
                <svg className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block mb-2 pl-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3.5 pl-11 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
                  placeholder="+91 98765 43210"
                />
                <svg className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-3">
              <svg className="w-5 h-5 text-neutral-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-neutral-900 block">Default Shipping Address</span>
                <p className="text-neutral-500 font-medium">
                  {defaultAddress ? `${defaultAddress.label} · ${defaultAddress.city}, ${defaultAddress.state}` : 'No default address selected'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
            >
              {saving ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <span>Save Changes</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Address Management */}
        <div className="lg:col-span-7 space-y-8">
          {/* Saved Addresses List */}
          <div className="bg-white border border-neutral-200/80 rounded-[20px] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-100 rounded-xl text-neutral-900">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-950">Saved Addresses</h2>
                  <p className="text-xs text-neutral-500 font-medium">Manage delivery destinations</p>
                </div>
              </div>
              <span className="text-xs font-bold text-neutral-400">{addresses.length} Total</span>
            </div>

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl">
                  <p className="text-neutral-400 text-sm font-medium">No saved addresses found.</p>
                </div>
              ) : (
                addresses.map((addr, idx) => (
                  <div
                    key={addr.id || idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      addr.isDefault || addr.id === defaultAddressId
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                        : 'bg-neutral-50/50 hover:bg-neutral-50 text-neutral-900 border-neutral-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black">{addr.label}</span>
                        {(addr.isDefault || addr.id === defaultAddressId) && (
                          <span className="text-[9px] font-black tracking-widest uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!addr.isDefault && addr.id !== defaultAddressId && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            disabled={saving}
                            className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveAddress(addr.id)}
                          disabled={saving}
                          className={`p-1.5 rounded-xl transition-colors ${
                            addr.isDefault || addr.id === defaultAddressId
                              ? 'text-neutral-400 hover:text-red-400 hover:bg-white/10'
                              : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="Remove Address"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p
                      className={`text-xs font-medium leading-relaxed ${
                        addr.isDefault || addr.id === defaultAddressId ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}, {addr.country}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Address Form */}
          <div className="bg-white border border-neutral-200/80 rounded-[20px] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add New Address
              </h3>

              {/* 📍 USE CURRENT LOCATION BUTTON */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isDetectingLocation ? 'Detecting...' : 'Use Current Location'}
              </button>
            </div>

            <div className="space-y-3">
              {/* 🔍 GEOAPIFY SEARCH AUTOCOMPLETE */}
              <div className="relative">
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-1 pl-1">
                  Global Search Address (Auto-fill)
                </label>
                <input
                  type="text"
                  placeholder="Type any address, city or landmark worldwide..."
                  value={addressSearchQuery}
                  onChange={(e) => setAddressSearchQuery(e.target.value)}
                  className="w-full bg-amber-50/40 border border-amber-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />

                {isSearchingAddress && (
                  <span className="absolute right-3.5 top-8 text-xs font-bold text-amber-600 animate-pulse">
                    Searching...
                  </span>
                )}

                {/* Suggestions Dropdown (using onMouseDown to prevent blur interrupts) */}
                {addressSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden divide-y divide-neutral-100 max-h-60 overflow-y-auto">
                    {addressSuggestions.map((item, idx) => {
                      const p = item.properties;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(item);
                          }}
                          className="w-full text-left p-3 hover:bg-amber-50/50 transition-colors flex flex-col"
                        >
                          <span className="text-xs font-bold text-neutral-900">{p.address_line1 || p.name}</span>
                          <span className="text-[11px] text-neutral-500">{p.address_line2 || p.formatted || p.country}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <hr className="border-neutral-100 my-2" />

              <input
                type="text"
                placeholder="Label (e.g. Home, Office, Studio)"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
              />

              <input
                type="text"
                placeholder="Street Address"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="ZIP / Postal Code"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all"
                />
              </div>

              <label className="flex items-center gap-3 text-xs font-bold text-neutral-700 cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-neutral-950 rounded border-neutral-300 focus:ring-neutral-950"
                />
                Set as primary default address
              </label>

              <button
                onClick={handleAddAddress}
                disabled={saving}
                className="text-white w-full py-4 bg-black hover:scale-[1.01] disabled:opacity-50 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-[0.98] mt-2"
              >
                {saving ? 'Adding Address...' : '+ Add Address'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}