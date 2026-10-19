import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import bannerImg from '../assets/images/banner/banner.png';

export default function HomeBanner() {
  const trustFeatures = [
    {
      id: 1,
      icon: <Truck className="w-5 h-5 text-gray-700" />,
      title: 'Delivered to your door',
      desc: 'Across Kerala & India'
    },
    {
      id: 2,
      icon: <ShieldCheck className="w-5 h-5 text-gray-700" />,
      title: 'Shop with confidence',
      desc: 'Carefully selected products'
    },
    {
      id: 3,
      icon: <CheckCircle2 className="w-5 h-5 text-gray-700" />,
      title: 'Quality, thoughtfully picked',
      desc: 'Good things. Great value'
    },
    {
      id: 4,
      icon: <RotateCcw className="w-5 h-5 text-gray-700" />,
      title: 'Easy returns',
      desc: '7-day return guarantee'
    }
  ];

  return (
    <div className="w-full bg-[#fbf9f6]">
      {/* Hero Visual Section */}
      <section className="relative min-h-[580px] md:min-h-[660px] lg:min-h-[720px] flex items-center overflow-hidden">
        {/* Background Graphic / Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImg}
            alt="Eacyclic banner"
            className="w-full h-full object-cover object-[center_right] md:object-right"
          />
          {/* Subtle gradient overlay to keep text ultra-readable on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf9f6] via-[#fbf9f6]/85 to-transparent md:w-3/5 w-full pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10 py-16 md:py-24">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase text-[#5c6e61] mb-5">
              LOCAL DISCOVERIES. EVERYDAY FAVOURITES.
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#16211a] leading-[1.05] mb-2 font-serif">
              Eacyclic.
            </h1>

            {/* Subheading */}
            <div className="text-3xl sm:text-4xl md:text-5xl font-light text-[#29362e] tracking-tight leading-snug mb-5">
              A little better. <br className="hidden sm:inline" />
              Every day.
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md font-normal">
              Thoughtful finds for your home and your life. <br />
              From your neighbourhood to your doorstep.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/product"
                className="inline-flex items-center justify-center gap-2 bg-[#134e35] hover:bg-[#0e3a27] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 group"
              >
                <span>Explore products</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/product?category=Home%20Decor"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#134e35] hover:text-[#0b2b1d] px-4 py-3.5 transition-colors group"
              >
                <span>Discover home</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip (Screenshot 1) */}
      <section className="bg-white border-t border-b border-gray-100 py-6">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trustFeatures.map((feat) => (
              <div key={feat.id} className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#f4f6f4] flex items-center justify-center shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-tight">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}