'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { sanitizeCallbackUrl } from '@/lib/safe-redirect';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl');
  const destination = sanitizeCallbackUrl(callbackUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The mobile number is half of the sign-in credential, so a typo here
    // locks the account out. Check it before the account is ever created.
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      const result = await signIn('credentials', { email, phone, redirect: false });
      if (!result?.ok || result.error) {
        throw new Error('Account created, but sign-in failed. Please sign in.');
      }

      // Let the session settle before navigating, otherwise the destination
      // page mounts without one and redirects back to login.
      await getSession();

      toast.success('Account created successfully!');
      router.replace(destination);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-2 shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Join RentalHub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight uppercase">
            Create Account
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Rent top-tier gear or start earning with your equipment
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[28px] p-6 sm:p-8 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-[10px] text-neutral-400 font-black uppercase tracking-widest block mb-1.5 pl-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-white border border-neutral-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 transition-all shadow-2xs" 
                  placeholder="John Doe" 
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[10px] text-neutral-400 font-black uppercase tracking-widest block mb-1.5 pl-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-white border border-neutral-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 transition-all shadow-2xs" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>

            {/* Mobile Number — required, this is how you sign back in */}
            <div>
              <label className="text-[10px] text-neutral-400 font-black uppercase tracking-widest block mb-1.5 pl-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                  className="w-full bg-white border border-neutral-200/80 rounded-2xl pl-[4.75rem] pr-4 py-3 text-xs font-semibold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 transition-all shadow-2xs"
                  placeholder="98765 43210"
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-medium mt-1.5 pl-1">
                You&apos;ll sign in with your email and this number — no password.
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-60 text-white font-black text-xs uppercase tracking-wider rounded-full transition-all shadow-2xs flex items-center justify-center gap-2 mt-4 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-neutral-500 font-medium text-xs mt-6">
          Already have an account?{' '}
          <Link 
            href={`/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} 
            className="text-neutral-950 font-black hover:underline underline-offset-4 decoration-2 decoration-emerald-500"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}