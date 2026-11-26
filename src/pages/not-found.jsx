import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <section className="flex items-center justify-center min-h-[75vh] px-6 bg-[#fbf9f6]">
      <div className="max-w-lg w-full text-center space-y-6 py-12 bg-white rounded-3xl border border-gray-100 shadow-xs p-8 sm:p-12">
        <div className="text-7xl sm:text-8xl font-black text-[#134e35] font-serif leading-none">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14261c] font-serif">
            Page not found
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            The page you are looking for has moved or no longer exists. Explore our latest products below.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#134e35] hover:bg-[#0e3a27] text-white font-bold rounded-full text-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          <Link
            to="/product"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#f6f9f7] border border-[#134e35]/20 text-[#134e35] font-bold rounded-full text-xs hover:bg-[#eaf4ee] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Products</span>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full text-xs hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Get Help</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
