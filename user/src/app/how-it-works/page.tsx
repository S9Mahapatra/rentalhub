'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Calendar, 
  Truck, 
  Store, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Select Gear & Rental Duration',
    subtitle: 'Choose your dates',
    icon: Calendar,
    description: 'Browse our catalog for camera kits, drones, tents, or workstations. Pick your exact rental start and return dates to calculate dynamic daily rates.',
    highlights: ['Flexible daily or weekly rates', 'Live inventory availability', 'Variant selection (Size, Color, Brand)'],
  },
  {
    number: '02',
    title: 'Choose Delivery or Store Pickup',
    subtitle: 'Flexible fulfillment',
    icon: Truck,
    description: 'Select whether you want the equipment delivered directly to your doorstep or collected in-person from one of our fulfillment stores.',
    highlights: ['Doorstep delivery & pickup', 'Store collection locations', 'Tracked dispatches'],
  },
  {
    number: '03',
    title: 'Pay & Instant Invoice Download',
    subtitle: 'Transparent pricing',
    icon: CreditCard,
    description: 'Complete checkout by paying the rental fee along with a refundable security deposit. Download your official tax invoice directly from your portal dashboard.',
    highlights: ['Separated deposit line item', 'Instant portal tax invoice', 'Encrypted payment security'],
  },
  {
    number: '04',
    title: 'Return Gear & Deposit Refund',
    subtitle: '100% Deposit Guarantee',
    icon: RotateCcw,
    description: 'Return items on time to receive a 100% security deposit refund. If returned late, penalty fees are automatically calculated and deducted.',
    highlights: ['100% refund on timely return', 'Automated late fee deductions', 'Condition inspection checklist'],
  },
];

const faqs = [
  {
    question: 'How is the security deposit managed and refunded?',
    answer: 'The security deposit is held safely in your order account upon checkout. Once you return the equipment at the end of your booking period and our store team verifies its condition and return time, the full deposit is refunded to your original payment method.',
  },
  {
    question: 'What happens if I return the equipment late?',
    answer: 'If gear is returned past the specified return window, the system automatically marks it as a Late Return. Applicable penalty fees will be calculated based on the delay duration and deducted from your security deposit, with the remaining balance refunded to you.',
  },
  {
    question: 'Can I choose between Store Pickup and Home Delivery?',
    answer: 'Yes! During checkout, you can select either Doorstep Delivery (we deliver and collect from your address) or Store Collection (you collect and return the item directly at our physical pickup store).',
  },
  {
    question: 'Where can I download my rental invoices?',
    answer: 'All tax and booking invoices are generated instantly post-payment and can be downloaded anytime from your "My Rentals" portal dashboard under the specific order details.',
  },
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-white text-neutral-900 min-h-screen pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="w-full max-w-[1400px] mx-auto px-4 pt-8 pb-12">
        <div className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[36px] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xs">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-neutral-800 text-xs font-semibold shadow-2xs border border-neutral-200/80 mb-6 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>TRANSPARENT RENTAL WORKFLOW</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-950 uppercase tracking-tight max-w-4xl mx-auto leading-tight">
            How Renting Works <br className="hidden sm:block" />
            <span className="text-neutral-500 font-bold">Simple, Safe & Transparent.</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto mt-4 leading-relaxed">
            Reserve premium gear on daily rates, choose your preferred delivery or store pickup method, and receive 100% of your security deposit back upon timely return.
          </p>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 text-xs font-bold text-neutral-700">
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-neutral-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Refundable Deposit</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-neutral-200/80 shadow-2xs">
              <Store className="w-4 h-4 text-neutral-700" />
              <span>Store Pickup & Doorstep Shipping</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-neutral-200/80 shadow-2xs">
              <FileText className="w-4 h-4 text-neutral-700" />
              <span>Instant Portal Invoices</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STEP-BY-STEP LIFECYCLE GRID */}
      <section className="w-full max-w-[1400px] mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-200/60">
            END-TO-END PROCESS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 mt-3 tracking-tight">
            The 4-Step Rental Lifecycle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-[#F4F4F6] rounded-[28px] p-6 border border-neutral-200/80 flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black bg-neutral-950 text-white px-3 py-1 rounded-full tracking-wider">
                      STEP {step.number}
                    </span>
                    <div className="p-2.5 bg-white rounded-2xl border border-neutral-200/80 text-neutral-900 shadow-2xs">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                    {step.subtitle}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-950 leading-snug mb-3">
                    {step.title}
                  </h3>

                  <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-200/80 space-y-2">
                  {step.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DEPOSIT & RETURN POLICY COMPARISON */}
      <section className="w-full max-w-[1400px] mx-auto px-4 py-12">
        <div className="bg-neutral-950 text-white rounded-[36px] p-8 sm:p-12 border border-neutral-800 shadow-xl">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">
              DEPOSIT & PENALTY WORKFLOW
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Understanding Security Deposit Returns
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
              We hold security deposits safely during your rental term. Our return rules are automated to ensure fairness and zero hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ON-TIME RETURN CARD */}
            <div className="bg-neutral-900/90 border border-emerald-500/30 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                    TIMELY RETURN
                  </span>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>

                <h3 className="text-xl font-black text-white mb-2">100% Full Deposit Refund</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  Return the product to our store or via doorstep pickup on or before the agreed return time. Following a quick equipment inspection, your deposit is released in full.
                </p>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Deduction Amount:</span>
                <span className="text-base font-black text-emerald-400">₹0 (Zero Fees)</span>
              </div>
            </div>

            {/* LATE RETURN CARD */}
            <div className="bg-neutral-900/90 border border-amber-500/30 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                    LATE RETURN
                  </span>
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>

                <h3 className="text-xl font-black text-white mb-2">Automated Penalty Deduction</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                  If the product is returned past the scheduled return deadline, late penalty fees are calculated based on overdue time and deducted directly from your security deposit.
                </p>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>Refund Formula:</span>
                <span className="text-xs font-bold text-white">Deposit - Late Penalty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="w-full max-w-[1000px] mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
            GOT QUESTIONS?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[22px] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-neutral-950 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-500 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 border-t border-neutral-200/60 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. READY TO RENT CTA BANNER */}
      <section className="w-full max-w-[1400px] mx-auto px-4 pt-12">
        <div className="bg-[#F4F4F6] border border-neutral-200/80 rounded-[32px] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight">
              Ready To Book Your Rental Gear?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Explore cameras, drones, camping kits, and laptops with flexible rates and deposit holds.
            </p>
          </div>

          <Link
            href="/products"
            className="px-8 py-4 bg-neutral-950 hover:bg-neutral-850 text-white font-bold rounded-full text-xs transition-all shadow-md flex items-center gap-2 shrink-0 hover:scale-[1.02]"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </section>

    </div>
  );
}