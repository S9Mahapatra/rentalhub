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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 bg-dark-800 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-dark-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-dark-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Profile unavailable</h2>
        <p className="text-dark-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Info</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Profile image URL</label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="text-xs text-dark-400">
              Default address: {defaultAddress ? `${defaultAddress.label} · ${defaultAddress.city}` : 'None selected'}
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Addresses</h2>
          <div className="space-y-3 mb-4">
            {addresses.length === 0 ? (
              <p className="text-dark-400 text-sm">No addresses added yet</p>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="p-3 bg-dark-900/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-white text-sm font-medium">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded ml-2">Default</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          disabled={saving}
                          className="text-xs px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors"
                        >
                          Make default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAddress(addr.id)}
                        disabled={saving}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-dark-400 text-xs mt-1">
                    {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <h3 className="text-sm font-medium text-white mb-3">Add New Address</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Label (e.g. Home, Office)"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
              <input
                type="text"
                placeholder="ZIP Code"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all"
              />
              <input
                type="text"
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all"
              />
              <label className="flex items-center gap-2 text-sm text-dark-300">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="accent-brand-500"
                />
                Make this the default address
              </label>
              <button
                onClick={handleAddAddress}
                disabled={saving}
                className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all w-full"
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
