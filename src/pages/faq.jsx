import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ShieldCheck, Truck, RotateCcw, Mail, ArrowRight } from 'lucide-react';
import SEO from '../component/SEO';

const FAQS = [
  {
    q: 'How do I place an order on Eacyclic?',
    a: 'Browse any product, choose your size/finish if available, and click "Buy Now (COD)" or "Add to bag". Fill in your delivery address and click "Place Order (Cash on Delivery)". No advance payment is required.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'All orders support Cash on Delivery (pay with cash or UPI scan right at your doorstep when your parcel arrives). There is zero advance payment required.'
  },
  {
    q: 'How long does delivery take across Kerala and India?',
    a: 'Orders across Kerala typically arrive within 2–4 business days, and across the rest of India within 3–5 business days. You receive an instant tracking ID and order confirmation email upon checkout.'
  },
  {
    q: 'Will I receive an order confirmation and tracking link?',
    a: 'Yes! When you enter your email address at checkout, Eacyclic sends an order confirmation receipt with your Order ID, tracking number, and live status link, plus updates when your order ships or is delivered.'
  },
  {
    q: 'How can I track or reorder a past purchase?',
    a: 'Open "Your Orders" from your profile menu (or click the link in your confirmation email) to track live delivery steps or click "Buy Again / Order Again" to reorder the exact items in 1 click.'
  },
  {
    q: 'What is your return & replacement policy?',
    a: 'We offer a 7-day easy replacement or return guarantee on eligible items if a product arrives damaged, defective, or different from what you ordered. Reach out via our Contact page or email eacyclic@gmail.com.'
  }
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <main className="bg-[#fbf9f6] min-h-screen">
      <SEO
        title="Frequently Asked Questions (FAQ) | Eacyclic"
        description="Answers about Cash on Delivery, free shipping across Kerala & India, order tracking, 1-click reorders, and 7-day returns at Eacyclic."
        keywords="Eacyclic FAQ, cash on delivery Kerala, shipping time, order tracking, returns"
      />

      {/* Header */}
      <section className="border-b border-gray-100 py-12 sm:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16 text-center max-w-3xl">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#5c6e61] mb-2">
            HELP CENTER
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#14261c] tracking-tight font-serif mb-3">
            Questions, answered.
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
            Everything you need to know about ordering on Eacyclic, Cash on Delivery, shipping, and easy returns.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-3xl space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-[#134e35]/40 bg-[#f6f9f7]'
                    : 'border-gray-200/80 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-[#14261c]">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#134e35] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}

          {/* Trust Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="p-4 rounded-2xl bg-[#fbf9f6] border border-gray-100 flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#134e35] shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-gray-900">Cash on Delivery</p>
                <p className="text-gray-500">Pay at your doorstep</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#fbf9f6] border border-gray-100 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-[#134e35] shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-gray-900">7-Day Returns</p>
                <p className="text-gray-500">Hassle-free replacement</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#fbf9f6] border border-gray-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#134e35] shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-gray-900">Verified Quality</p>
                <p className="text-gray-500">Inspected before dispatch</p>
              </div>
            </div>
          </div>

          {/* Support CTA */}
          <div className="mt-8 p-6 rounded-2xl bg-[#134e35] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-emerald-200 shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Still have a question?</h3>
                <p className="text-xs text-emerald-100">Our support team replies quickly to every message.</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-[#134e35] text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
