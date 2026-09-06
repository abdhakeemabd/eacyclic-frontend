import React from 'react'
import About1 from "../assets/images/img/1.webp"

function AboutUs() {
  return (
    <>
    <section className="about_us_sec py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-19">

          <div className="md:col-span-6">
            <img className="rounded-lg w-full" src={About1} alt="About us" />
          </div>

          <div className="md:col-span-6">
            <h2 className="text-3xl font-bold mb-4">About Us</h2>
            <h3 className='text-2xl font-bold mb-2'>Eacyclic - Your Gateway to Easy Local Shopping</h3>
            <p className="text-gray-700 leading-relaxed">
              At Eacyclic, we believe that shopping should be as easy as a single click. Based in Edavannappara, Malappuram, we are dedicated to bringing you the best products from near you and across India. 
              Our mission is to introduce innovative products to the people of Kerala and beyond, ensuring a seamless and user-friendly purchase experience.
            </p>
            <button className='bg-amber-900 text-white py-3 px-4 mt-4 rounded-lg'>Explore more</button>
          </div>

        </div>
      </div>
    </section>
    <section className='why_choose_sec'>
        <div className="container">
            <div className='text-lg text-center font-bold'>Why Choose Eacyclic?</div>
            <div className='text-black text-center text-2xl my-3 font-bold'>The Best E-commerce Platform for Local & National Shopping</div>
            <div className="sub-card bg-[#f9f9f9] shadow-amber-50 p-5 flex justify-between mt-4 rounded-md">
                <div className='text-center'>
                    <div className='text-2xl font-bold text-lime-700'>27 k</div>
                    <div className='text-[17px] font-medium text-[#323232]'>Listings added</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-lime-700'>500 +</div>
                    <div className='text-[17px] font-medium text-[#323232]'>Daily searches</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-lime-700'>10 +</div>
                    <div className='text-[17px] font-medium text-[#323232]'>Registered users</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-lime-700'>2 +</div>
                    <div className='text-[17px] font-medium text-[#323232]'>Quality awards</div>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}

export default AboutUs
