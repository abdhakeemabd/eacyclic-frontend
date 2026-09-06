import React from 'react'
import bgImage from '../assets/images/img/3.webp';

function AboutBanner() {
  return (
    <section className="product-banner page-banner bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="container mx-auto">
            <div className="flex justify-center">
                <div className="w-full px-2">
                    <div className="content text-center">
                        <div className='text-center text-4xl poppins-bold text-white leading-5'>About Us</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default AboutBanner