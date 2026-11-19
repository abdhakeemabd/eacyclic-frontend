import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react'
import About1 from "../assets/images/img/1.webp"

function AboutUs() {
  return (
    <>
    <section className="about_us_sec py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">

          <div className="md:col-span-6">
            <img className="rounded-2xl shadow-sm w-full object-cover max-h-[420px]" src={About1} alt="About Eacyclic" />
          </div>

          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#134e35]">Our Story</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif leading-tight">Smart Finds for Everyday Living</h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Based in Edavannappara, Malappuram, Eacyclic was founded to make thoughtful, problem-solving products accessible to households across Kerala and India with the ease of a single click.
            </p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              From smart home organizers and kitchen essentials to lifestyle picks, every item on our store is tested, curated, and backed with Cash on Delivery and hassle-free returns.
            </p>
            <div className="pt-2">
              <Link 
                to="/product" 
                className="inline-flex items-center gap-2 bg-[#134e35] hover:bg-[#0e3a27] text-white py-3 px-6 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <span>Explore Products</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
    
    <section className='why_choose_sec py-12 bg-[#fbf9f6] border-t border-gray-100'>
        <div className="container mx-auto px-4 max-w-5xl">
            <div className='text-xs font-bold text-center text-[#5c6e61] uppercase tracking-wider'>Why Choose Eacyclic?</div>
            <div className='text-gray-900 text-center text-2xl sm:text-3xl my-2 font-bold font-serif'>Built on Quality, Trust & Fast Delivery</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className='text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs'>
                    <div className='w-10 h-10 mx-auto rounded-full bg-emerald-50 text-[#134e35] flex items-center justify-center mb-2'>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className='text-xl sm:text-2xl font-black text-gray-900'>100%</div>
                    <div className='text-xs font-medium text-gray-500 mt-0.5'>Quality Inspected</div>
                </div>
                <div className='text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs'>
                    <div className='w-10 h-10 mx-auto rounded-full bg-emerald-50 text-[#134e35] flex items-center justify-center mb-2'>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className='text-xl sm:text-2xl font-black text-gray-900'>Kerala & India</div>
                    <div className='text-xs font-medium text-gray-500 mt-0.5'>Doorstep Delivery (COD)</div>
                </div>
                <div className='text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs'>
                    <div className='w-10 h-10 mx-auto rounded-full bg-emerald-50 text-[#134e35] flex items-center justify-center mb-2'>
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div className='text-xl sm:text-2xl font-black text-gray-900'>7 Days</div>
                    <div className='text-xs font-medium text-gray-500 mt-0.5'>Replacement Guarantee</div>
                </div>
                <div className='text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs'>
                    <div className='w-10 h-10 mx-auto rounded-full bg-emerald-50 text-[#134e35] flex items-center justify-center mb-2'>
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div className='text-xl sm:text-2xl font-black text-gray-900'>WhatsApp</div>
                    <div className='text-xs font-medium text-gray-500 mt-0.5'>Direct Support</div>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}

export default AboutUs
