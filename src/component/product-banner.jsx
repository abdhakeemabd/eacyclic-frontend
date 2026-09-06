import React from 'react'

function ProductBanner() {
  return (
    <section className='product-banner page-banner'>
        <div className="container mx-auto">
            <div className="flex justify-center">
                <div className="w-full px-2">
                    <div className="content text-center relative z-10">
                        <div className='text-center text-4xl md:text-5xl poppins-bold text-white leading-tight drop-shadow-lg'>Our Products</div>
                        <p className='text-white text-lg mt-2 drop-shadow-md'>Discover premium quality items curated just for you</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default ProductBanner