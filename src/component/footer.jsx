import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/logo/logo.png';

export default function Footer() {
  return (
    <footer className="w-full">
      {/* 1. "Closer to You" Banner (Screenshot 3) */}
      <section className="bg-[#eaf4ee] py-14 sm:py-20 border-t border-b border-[#dde9e2]">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-4xl text-left sm:text-left">
          <div className="text-[11px] font-bold text-[#3d5a49] tracking-[0.2em] uppercase mb-2">
            CLOSER TO YOU
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#14261c] tracking-tight mb-3">
            Local roots. Endless possibilities.
          </h2>
          <p className="text-xs sm:text-sm text-[#486354] leading-relaxed max-w-xl">
            Discover the best of local and national products, delivered wherever you call home.
          </p>
        </div>
      </section>

      {/* 2. Main Footer Body (Screenshot 3) */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            
            {/* Left Brand Column */}
            <div className="md:col-span-6 space-y-4">
              <Link to="/" className="inline-block" aria-label="Eacyclic">
                <img src={Logo} alt="Eacyclic" className="h-7 sm:h-9 object-contain max-w-[140px]" />
              </Link>
              <div className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed">
                <p className="font-medium text-gray-700">Thoughtfully chosen. Easily delivered.</p>
                <p className="mt-1">Good things for your everyday, from closer to home.</p>
              </div>
            </div>

            {/* Explore Column */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 tracking-wider uppercase">
                Explore
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link to="/product" className="hover:text-[#134e35] transition-colors">
                    All products
                  </Link>
                </li>
                <li>
                  <Link to="/product?category=Home%20Decor" className="hover:text-[#134e35] transition-colors">
                    Home decor
                  </Link>
                </li>
                <li>
                  <Link to="/product?category=Home%20Utilities" className="hover:text-[#134e35] transition-colors">
                    Home utilities
                  </Link>
                </li>
              </ul>
            </div>

            {/* Let's talk Column */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 tracking-wider uppercase">
                Let's talk
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link to="/contact" className="hover:text-[#134e35] transition-colors">
                    Contact us
                  </Link>
                </li>
                <li>
                  <a href="tel:+919846007257" className="hover:text-[#134e35] transition-colors">
                    +91 98460 07257
                  </a>
                </li>
                <li>
                  <a href="mailto:eacyclic@gmail.com" className="hover:text-[#134e35] transition-colors">
                    eacyclic@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Line */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <p>© 2026 Eacyclic. All rights reserved.</p>
          </div>
        </div>
      </section>
    </footer>
  );
}