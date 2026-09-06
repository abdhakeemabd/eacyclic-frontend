import React from 'react'
import { Link } from 'react-router-dom'
import HomeBanner from '../component/home-banner'
import HomeProduct from '../component/home-product'
import HomeFeatures from '../component/home-features'
import SEO from '../component/SEO'

const Home = () => {

  return (
    <main>
      <SEO 
        title="Eacyclic – Buy Products Online in Kerala | Best Shopping Website in India" 
        description="Shop online with Eacyclic. Find the best products around you in Kerala and across India. Easy shopping, fast delivery. Buy products online today!" 
        keywords="Eacyclic, online shopping, Kerala, India, buy products online, e-commerce"
      />
      <HomeBanner />
      
     <section className="py-12 bg-orange-600 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-orange-600">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base">Fast Delivery</h4>
              <p className="text-xs text-white mt-1">Across Kerala & India</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base">Secure Payments</h4>
              <p className="text-xs text-white mt-1">100% Protected</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base">Quality Assured</h4>
              <p className="text-xs text-white mt-1">Best Local Products</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-10.6 8.5 8.5 0 013 0c1.4.3 2.6 1 3.6 2s1.7 2.2 2 3.8z"/><path d="M21 3v8h-8"/></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base">Easy Returns</h4>
              <p className="text-xs text-white mt-1">7-Day Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      <HomeProduct />
      <HomeFeatures />
      
    </main>
  )
}

export default Home