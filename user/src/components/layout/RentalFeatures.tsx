'use client';

import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  FileText, 
  Calculator, 
  UserCheck 
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: '100% Refundable Security Deposit',
    description: 'Security deposits are safely held during your booking and refunded in full upon timely product return[cite: 12].',
  },
  {
    icon: Truck,
    title: 'Doorstep Shipping or Store Pickup',
    description: 'Choose to have items delivered directly to your address or collect them in person from nearby stores[cite: 12].',
  },
  {
    icon: Clock,
    title: 'Flexible Rental Periods',
    description: 'Select exact start and end dates with dynamic daily or period pricing calculated automatically[cite: 12].',
  },
  {
    icon: FileText,
    title: 'Instant Invoice Downloads',
    description: 'Download official tax and payment invoices directly from your portal dashboard right after checkout[cite: 12].',
  },
  {
    icon: Calculator,
    title: 'Automated Late Return Handling',
    description: 'Transparent penalty rules automatically calculate late fees deducted from held deposits if returned past deadline[cite: 12].',
  },
  {
    icon: UserCheck,
    title: 'Complete Rental Portal',
    description: 'Access and manage all active rental orders, shipping addresses, profile details, and deposit statuses in one place[cite: 12].',
  },
];

export default function RentalFeatures() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 py-8">
      <div className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[32px] p-8 sm:p-12 shadow-2xs">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[11px] font-extrabold tracking-widest text-slate-700 bg-gray-100 px-3 py-1 rounded-full uppercase border border-slate-200/60">
            TRANSPARENT RENTAL WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 mt-3 tracking-tight">
            How Our Rental Platform Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Built for seamless rental tracking, instant fulfillment, and clear deposit management.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-[24px] p-6 border border-neutral-200/70 flex flex-col items-start text-left shadow-2xs hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F4F4F6] border border-neutral-200/80 flex items-center justify-center text-neutral-950 mb-5 shrink-0">
                  <Icon className="w-5 h-5 text-neutral-900" />
                </div>

                <h3 className="font-bold text-neutral-950 text-base mb-2">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}