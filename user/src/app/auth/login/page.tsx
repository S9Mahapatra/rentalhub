'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });

      if (result?.error) {
        toast.error('Invalid credentials');
      } else {
        toast.success('Welcome back!');
        router.push('/');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-dark-400">Sign in to your RentalHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800/40 border border-white/5 rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-sm text-dark-300 mb-1.5 block font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 transition-all" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-1.5 block font-medium">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/25 transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-dark-400 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
