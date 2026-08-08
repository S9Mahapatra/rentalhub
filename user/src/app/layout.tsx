import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/providers/SessionProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AeroRent - Premium Rental Marketplace',
  description: 'Rent premium cameras, camping kits, and tech on demand.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Set light background bg-white or bg-[#F4F4F6] */}
      <body className={`bg-white text-neutral-900 antialiased ${inter.className}`}>
        <SessionProvider>
          {/* 1. Navbar enabled */}
          <Navbar />

          {/* 2. Main wrapper (no top padding needed because Navbar is sticky) */}
          <main className="min-h-screen">{children}</main>

          {/* 3. Footer */}
          <Footer />

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#171717',
                color: '#ffffff',
                borderRadius: '9999px',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}