'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
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
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
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
        setName(profile?.name || session.user?.name || '');
        setEmail(profile?.email || session.user?.email || '');
        setPhone(profile?.phone || '');
        setProfileImage(profile?.image || session.user?.image || '');
        setAddresses(profile?.addresses || []);
        setDefaultAddressId(profile?.defaultAddressId || '');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [session, router]);

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.id === defaultAddressId || address.isDefault),
    [addresses, defaultAddressId]
  );

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
          profileImage,
          defaultAddressId: defaultAddressId || null,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update profile');

      await update({
        user: {
          name,
          email,
          image: profileImage || undefined,
          role: session?.user?.role,
        },
      });

      setAddresses(payload.profile?.addresses || []);
      setDefaultAddressId(payload.profile?.defaultAddressId || '');
      toast.success('Profile updated');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Fill all address fields');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAddress,
        }),
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

  if (!session) return null;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="h-8 bg-neutral-200/60 rounded-xl w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-neutral-100/60 rounded-[32px] animate-pulse" />
          <div className="h-80 bg-neutral-100/60 rounded-[32px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-black text-neutral-950 mb-2 tracking-tight">Profile unavailable</h2>
        <p className="text-neutral-500 font-medium mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-3xl font-black text-neutral-950 mb-8 tracking-tight">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-neutral-200/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950 mb-6">Personal Info</h2>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Profile Image URL</label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="text-[11px] font-medium text-neutral-500 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              Default address: {defaultAddress ? <span className="font-bold text-neutral-950">{defaultAddress.label} · {defaultAddress.city}</span> : 'None selected'}
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>

        <div className="bg-[#F7F7F9] border border-neutral-200/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950 mb-6">Addresses</h2>
          <div className="space-y-3 mb-6">
            {addresses.length === 0 ? (
              <p className="text-neutral-500 text-sm font-medium">No addresses added yet.</p>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="p-5 bg-white rounded-[24px] border border-neutral-200/80 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <span className="text-neutral-950 text-sm font-black">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full ml-3">Default</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          disabled={saving}
                          className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                        >
                          Make default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAddress(addr.id)}
                        disabled={saving}
                        className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-neutral-500 text-xs font-medium leading-relaxed">
                    {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-neutral-200/80 pt-6 mt-6">
            <h3 className="text-sm font-black text-neutral-950 mb-4">Add New Address</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Label (e.g. Home, Office)"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="w-full bg-white border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all shadow-sm"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="w-full bg-white border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all shadow-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="w-full bg-white border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all shadow-sm"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="w-full bg-white border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              <input
                type="text"
                placeholder="ZIP Code"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                className="w-full bg-white border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all shadow-sm"
              />
              <input
                type="text"
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                className="w-full bg-white border border-neutral-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all shadow-sm"
              />
              <label className="flex items-center gap-3 text-sm font-semibold text-neutral-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="w-5 h-5 accent-neutral-950 rounded"
                />
                Make this the default address
              </label>
              <button
                onClick={handleAddAddress}
                disabled={saving}
                className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mt-4"
              >
                ADD ADDRESS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
