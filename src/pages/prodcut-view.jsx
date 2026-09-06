import React from 'react'
import ProductBanner from '../component/product-banner'
import ProductDetails from '../component/product-details'
import RelatedProduct from '../component/related-product'


function ProdcutView() {
  return (
    <main>
      <ProductBanner />
      <ProductDetails />
      <RelatedProduct />
    </main>
  )
}

export default ProdcutView