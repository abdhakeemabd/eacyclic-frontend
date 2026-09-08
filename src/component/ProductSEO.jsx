import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import SEO from './SEO';

const SITE_URL = 'https://eacyclic.com';

/**
 * ProductSEO — reads the same product data as ProductDetails
 * and injects professional meta tags + JSON-LD structured data.
 * This is what allows Google to show your products in search results.
 */
function ProductSEO() {
  const { id } = useParams();
  const location = useLocation();
  const { products, getProductById } = useProducts();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const passedProduct = location.state?.product;
    const globalProduct = getProductById(id);
    setProduct(globalProduct || passedProduct || null);
  }, [id, location.state, products, getProductById]);

  if (!product) return null;

  const name = product.name || product.title || 'Product';
  const description = product.description || product.content ||
    `Buy ${name} online at Eacyclic. Best price in Kerala & India. Fast delivery, easy returns.`;
  const price = product.price || product.offerPrice || 0;
  const image = product.image_url || product.image || (product.gallery && product.gallery[0]);
  const pageUrl = `${SITE_URL}/product-view/${product.id}`;

  // SEO title follows Amazon/Flipkart pattern: "Product Name - Buy Online at Best Price | Store"
  const seoTitle = `${name} - Buy Online at Best Price in India`;

  // Keywords: product name + category + location — targets local searches
  const keywords = [
    name,
    product.category,
    `buy ${name} online`,
    `${name} price`,
    `${name} in Kerala`,
    `${product.category || ''} online shopping`,
    'Eacyclic',
    'online shopping Kerala',
  ].filter(Boolean).join(', ');

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/product' },
    ...(product.category ? [{ name: product.category, path: `/product?category=${encodeURIComponent(product.category)}` }] : []),
    { name, path: `/product-view/${product.id}` },
  ];

  return (
    <SEO
      title={seoTitle}
      description={description}
      keywords={keywords}
      ogImage={image}
      ogUrl={pageUrl}
      canonical={pageUrl}
      product={product}
      breadcrumbs={breadcrumbs}
    />
  );
}

export default ProductSEO;
