import React from 'react'
import Products from '../component/products'
import ProductBanner from '../component/product-banner'
import SEO from '../component/SEO'

function Prodcut() {
  return (
    <main>
      <SEO 
        title="Shop Products" 
        description="Browse the best products near you on Eacyclic. Shop categories like furniture, electronics, and apparel." 
        keywords="eacyclic products, buy furniture online, shop electronics Kerala"
      />
      <ProductBanner />
      <Products />
    </main>
  )
}

export default Prodcut