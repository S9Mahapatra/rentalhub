'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error('Login failed after registration');

      toast.success('Account created!');
      router.push(callbackUrl || '/');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-neutral-950 mb-3 tracking-tight">Create Account</h1>
          <p className="text-neutral-500 font-medium">Join RentalHub today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-neutral-200/50 space-y-6">
          <div>
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Phone (Optional)</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all" 
              placeholder="9876543210" 
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Password</label>
            <input 
              type="password" 
              required 
              minLength={6} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-neutral-50/50 border border-neutral-200/80 rounded-2xl px-5 py-4 text-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-black text-sm rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="text-center text-neutral-500 font-medium text-sm mt-8">
          Already have an account?{' '}
          <Link href={`/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-neutral-950 font-black hover:underline underline-offset-4 decoration-2 decoration-emerald-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
