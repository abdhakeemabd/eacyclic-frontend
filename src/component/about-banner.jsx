import React from 'react';

function AboutBanner() {
  return (
    <section className="bg-[#fbf9f6] border-b border-gray-100 py-12 sm:py-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 text-center max-w-3xl">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#5c6e61] mb-2">
          OUR STORY
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#14261c] tracking-tight font-serif mb-3">
          About Eacyclic.
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
          From Edavannappara, Kerala to homes across India — bringing thoughtful everyday essentials right to your doorstep.
        </p>
      </div>
    </section>
  );
}

export default AboutBanner;
