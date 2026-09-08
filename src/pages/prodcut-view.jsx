import React from 'react'
import ProductBanner from '../component/product-banner'
import ProductDetails from '../component/product-details'
import RelatedProduct from '../component/related-product'
import ProductSEO from '../component/ProductSEO'

function ProdcutView() {
  return (
    <main>
      <ProductSEO />
      <ProductBanner />
      <ProductDetails />
      <RelatedProduct />
    </main>
  )
}

export default ProdcutView