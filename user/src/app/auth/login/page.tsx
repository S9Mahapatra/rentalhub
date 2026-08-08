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
        // Retrieve callbackUrl from the query parameters, if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl');
        router.push(callbackUrl || '/');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-neutral-950 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-neutral-500 font-medium">Sign in to your RentalHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200/80 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-neutral-200/50 space-y-6">
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
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-2 pl-1">Password</label>
            <input 
              type="password" 
              required 
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
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center text-neutral-500 font-medium text-sm mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-neutral-950 font-black hover:underline underline-offset-4 decoration-2 decoration-emerald-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
