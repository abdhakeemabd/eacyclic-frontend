import React from 'react'
import Products from '../component/products'
import ProductBanner from '../component/product-banner'
import SEO from '../component/SEO'
import { useProducts } from '../context/ProductContext'
import { useLocation } from 'react-router-dom'

function Prodcut() {
  const { products } = useProducts();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryParam = params.get('category');
  const searchParam = params.get('search');

  const pageTitle = categoryParam
    ? `Buy ${categoryParam} Online – Best Price | Eacyclic`
    : searchParam
    ? `Search results for "${searchParam}" | Eacyclic`
    : 'Shop All Products Online – Best Price in Kerala & India | Eacyclic';

  const pageDescription = categoryParam
    ? `Shop the best ${categoryParam} products online at Eacyclic. Lowest prices, fast delivery across Kerala and India.`
    : searchParam
    ? `Find "${searchParam}" on Eacyclic. Shop the best products at the lowest prices with fast delivery in Kerala.`
    : 'Browse all products on Eacyclic. Best deals on electronics, fashion, home & more. Fast delivery across Kerala & India.';

  const pageKeywords = categoryParam
    ? `buy ${categoryParam} online, ${categoryParam} price, ${categoryParam} Kerala, Eacyclic ${categoryParam}`
    : 'eacyclic products, buy online Kerala, online shopping India, best price';

  // ItemList schema — tells Google exactly what products are on this page
  const filteredProducts = categoryParam
    ? products.filter(p => p.category === categoryParam)
    : products;

  return (
    <main>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/product' },
          ...(categoryParam ? [{ name: categoryParam, path: `/product?category=${encodeURIComponent(categoryParam)}` }] : []),
        ]}
        itemList={filteredProducts}
        noIndex={!!searchParam} // Don't index search result pages (industry standard)
      />
      <ProductBanner />
      <Products />
    </main>
  )
}

export default Prodcut