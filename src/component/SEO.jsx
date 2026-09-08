import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Eacyclic';
const SITE_URL = 'https://eacyclic.com';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.webp`;

/**
 * Professional SEO component — supports:
 * - Dynamic title / description / keywords
 * - Open Graph (Facebook / WhatsApp shares)
 * - Twitter Card
 * - Canonical URL (prevents duplicate content penalty)
 * - JSON-LD Structured Data:
 *    • WebSite (SearchAction) — for home
 *    • Product — for individual product pages (enables Google Shopping snippets)
 *    • BreadcrumbList — for product pages
 *    • ItemList — for listing / category pages
 */
const SEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  ogType = 'website',
  canonical,
  // Product-specific props for rich snippets
  product,
  // Breadcrumb props
  breadcrumbs,
  // Item list props (for category / listing pages)
  itemList,
  noIndex = false,
}) => {
  const pageUrl = canonical || ogUrl || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const pageImage = ogImage || DEFAULT_IMAGE;
  const fullTitle = title?.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // Build Product JSON-LD (enables Google Shopping rich snippets)
  const buildProductSchema = (p) => {
    if (!p) return null;
    const name = p.name || p.title;
    const price = p.price || p.offerPrice || 0;
    const image = p.image_url || p.image || (p.gallery && p.gallery[0]) || DEFAULT_IMAGE;
    const desc = p.description || p.content || `Buy ${name} online at Eacyclic`;

    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name,
      description: desc,
      image: [image, ...(p.gallery || [])].filter(Boolean),
      sku: `EACY-${p.id}`,
      brand: {
        '@type': 'Brand',
        name: SITE_NAME,
      },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/product-view/${p.id}`,
        priceCurrency: 'INR',
        price: Number(price).toFixed(2),
        availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: p.freeShipping ? '0' : '49',
            currency: 'INR',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
          },
        },
      },
      ...(p.oldPrice && {
        aggregateRating: undefined,
      }),
    };
  };

  // Build BreadcrumbList JSON-LD
  const buildBreadcrumbSchema = (crumbs) => {
    if (!crumbs || crumbs.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path}`,
      })),
    };
  };

  // Build ItemList JSON-LD (for category / search listing pages)
  const buildItemListSchema = (items) => {
    if (!items || items.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      numberOfItems: items.length,
      itemListElement: items.slice(0, 20).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/product-view/${item.id}`,
        name: item.name || item.title,
      })),
    };
  };

  // Build WebSite SearchAction JSON-LD (Google Sitelinks Search Box)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/product?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const productSchema = buildProductSchema(product);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
  const itemListSchema = buildItemListSchema(itemList);

  return (
    <Helmet>
      {/* ── Core ────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <link rel="canonical" href={pageUrl} />

      {/* ── Open Graph (Facebook / WhatsApp) ────── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={product ? 'product' : ogType} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      {product && <meta property="product:price:amount" content={product.price || product.offerPrice} />}
      {product && <meta property="product:price:currency" content="INR" />}

      {/* ── Twitter Card ─────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={pageImage} />

      {/* ── Structured Data (JSON-LD) ────────────── */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      {productSchema && (
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {itemListSchema && (
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
