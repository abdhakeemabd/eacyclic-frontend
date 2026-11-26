import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = '919846007257';
  const defaultMessage = 'Hi Eacyclic! I have an enquiry about your products.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center gap-3">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 group relative"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
      </a>

      {/* Slide-out pill label on desktop or on hover */}
      <div 
        className={`hidden sm:flex items-center bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md border border-gray-100 text-xs font-semibold text-gray-800 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-80 translate-x-0'
        }`}
      >
        <span>Chat with us on WhatsApp</span>
      </div>
    </div>
  );
}
