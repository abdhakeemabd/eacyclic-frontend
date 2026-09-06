import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaQuestionCircle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <section className="flex items-center justify-center min-h-[75vh] px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 translate-x-1/2 translate-y-1/2" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8 py-10">
        {/* Animated Visual Number */}
        <div className="relative inline-block select-none animate-float">
          <h1 className="text-[120px] sm:text-[150px] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-orange-600">
            404
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur opacity-15 -z-10" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Lost in the Marketplace?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The page you are looking for has been moved, deleted, or never existed in the Eacyclic catalog. Let's get you back on track!
          </p>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] text-sm uppercase tracking-wider"
          >
            <FaHome className="text-base" />
            Go Home
          </Link>
          
          <Link
            to="/product"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-800 font-semibold rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform active:scale-[0.98] text-sm uppercase tracking-wider"
          >
            <FaShoppingBag className="text-base text-orange-500" />
            Shop Catalog
          </Link>

          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-800 font-semibold rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform active:scale-[0.98] text-sm uppercase tracking-wider"
          >
            <FaQuestionCircle className="text-base text-blue-500" />
            Get Help
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
