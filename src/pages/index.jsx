import React from 'react';
import HomeBanner from '../component/home-banner';
import HomeProduct from '../component/home-product';
import SEO from '../component/SEO';

export default function Home() {
  return (
    <main className="w-full bg-white">
      <SEO 
        title="Eacyclic – A little better. Every day. | Thoughtful Home & Lifestyle" 
        description="Eacyclic is your neighbourhood online shopping store for thoughtful home finds, utilities, plants, and everyday essentials. Free delivery across Kerala & India." 
        keywords="Eacyclic, online shopping, home decor, utilities, appliances, Kerala, India"
      />

      {/* Hero Banner + Trust Features Strip (Screenshot 1) */}
      <HomeBanner />

      {/* Category Discovery + Curated Product Showcase (Screenshot 2 & 4) */}
      <HomeProduct />
    </main>
  );
}