'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return; }
    setName(session.user?.name || '');
    fetch('/api/users/profile').then((r) => r.json()).then(({ data }) => setAddresses(data || [])).catch(() => {});
  }, [session, router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        toast.success('Profile updated');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch { toast.error('Failed to update'); }
    setSaving(false);
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
        body: JSON.stringify({ addAddress: true, ...newAddress, isDefault: addresses.length === 0 }),
      });
      const { data } = await res.json();
      setAddresses((prev) => [...prev, data]);
      setNewAddress({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: 'India' });
      toast.success('Address added');
    } catch { toast.error('Failed to add address'); }
    setSaving(false);
  };

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-800/40 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Info</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all" />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Email</label>
              <input type="email" value={session.user?.email || ''} disabled className="w-full bg-dark-900/30 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-dark-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-dark-400 mb-1 block">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all" placeholder="9876543210" />
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
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
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{addr.label}</span>
                    {addr.isDefault && <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">Default</span>}
                  </div>
                  <p className="text-dark-400 text-xs mt-1">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <h3 className="text-sm font-medium text-white mb-3">Add New Address</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Label (e.g. Home, Office)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all" />
              <input type="text" placeholder="Street Address" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all" />
                <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all" />
              </div>
              <input type="text" placeholder="ZIP Code" value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-all" />
              <button onClick={handleAddAddress} disabled={saving} className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all w-full">
                Add Address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
