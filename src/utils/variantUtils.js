// Flipkart & Amazon style Variant Utilities

export const COLOR_MAP = {
  // Classic Apparel Colors
  red: '#ef4444',
  green: '#10b981',
  blue: '#2563eb',
  violet: '#8b5cf6',
  orange: '#f97316',
  black: '#1f2937',
  white: '#ffffff',
  yellow: '#eab308',
  pink: '#ec4899',
  navy: '#1e3a8a',
  maroon: '#831843',
  grey: '#6b7280',
  gray: '#6b7280',
  brown: '#78350f',
  teal: '#14b8a6',
  purple: '#9333ea',
  gold: '#d97706',
  silver: '#94a3b8',

  // Furniture Wood Finishes (Flipkart / Amazon furniture swatches)
  'akeshya wood': '#8b5a2b',
  'akeshya': '#8b5a2b',
  'teak wood': '#b87333',
  'teak': '#b87333',
  'solid teak': '#a0522d',
  'walnut finish': '#4a2c11',
  'dark walnut': '#36220f',
  'natural oak': '#c2a649',
  'honey teak': '#c68642',
  'rosewood': '#5b2c2c',
  'matte black': '#18181b',
  'white ceramic': '#f8fafc',
  'terracotta pot': '#c2593f',

  // Jewellery Finishes
  'panchaloha gold': '#d4af37',
  'antique copper': '#b87333',
  'rose gold': '#b76e79',

  // Fallbacks
  classic: '#334155',
  default: '#134e35'
};

export const DEFAULT_CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
export const DEFAULT_CLOTHING_COLORS = ['Red', 'Green', 'Blue', 'Violet', 'Orange'];

// Furniture Bed Variants (Exactly the 4 catalog products from website)
export const BED_SIZES = ['6.25 x 5 ft', '6.25 x 6 ft'];
export const BED_FINISHES = ['Akeshya Wood', 'Teak Wood'];

// Furniture Dining Table Variants
export const DINING_TABLE_SIZES = ['4-Seater (4.5 x 3 ft)', '6-Seater (6 x 3.5 ft)', '8-Seater (7.5 x 4 ft)'];
export const DINING_TABLE_FINISHES = ['Solid Teak', 'Akeshya Wood', 'Dark Walnut'];

// Furniture Chair Variants
export const CHAIR_SIZES = ['Single Chair', 'Set of 2', 'Set of 4', 'Set of 6'];
export const CHAIR_FINISHES = ['Solid Teak', 'Akeshya Wood', 'Dark Walnut'];

// Furniture Wardrobe Variants
export const WARDROBE_SIZES = ['2-Door', '3-Door', '4-Door'];
export const WARDROBE_FINISHES = ['Akeshya Wood', 'Teak Wood', 'Walnut Finish'];

// Grocery / Spices / Podi Variants
export const GROCERY_SIZES = ['100g', '250g', '500g', '1 Kg'];
export const GROCERY_FINISHES = ['Original Traditional', 'Spicy Extra', 'Mild Classic'];

// Jewellery Variants
export const JEWELLERY_SIZES = ['Size 12', 'Size 14', 'Size 16', 'Size 18', 'Size 20'];
export const JEWELLERY_FINISHES = ['Panchaloha Gold', 'Antique Copper', 'Rose Gold'];

// Plant / Garden Variants
export const PLANT_SIZES = ['Small (with Pot)', 'Medium (with Pot)', 'Large (with Planter)'];
export const PLANT_FINISHES = ['Terracotta Pot', 'White Ceramic', 'Matte Black'];

// General Universal Fallback Variants
export const GENERAL_SIZES = ['Standard', 'Deluxe Edition'];
export const GENERAL_FINISHES = ['Classic', 'Premium'];

export const SIZE_LABELS = {
  'S': 'S (Small)',
  'M': 'M (Medium)',
  'L': 'L (Large)',
  'XL': 'XL (Extra Large)',
  'XXL': 'XXL (Double XL)',
  '3XL': '3XL (Triple XL)',
  'XS': 'XS (Extra Small)',
  'Free': 'Free Size',
  '6.25 x 5 ft': '6.25 x 5 ft (Queen Bed)',
  '6.25 x 6 ft': '6.25 x 6 ft (King Bed)',
  '4-Seater (4.5 x 3 ft)': '4-Seater (Compact)',
  '6-Seater (6 x 3.5 ft)': '6-Seater (Standard Family)',
  '8-Seater (7.5 x 4 ft)': '8-Seater (Grand Family)',
  'Single Chair': 'Single Piece (1x)',
  'Set of 2': 'Set of 2 (Save 5%)',
  'Set of 4': 'Set of 4 (Save 9%)',
  'Set of 6': 'Set of 6 (Save 12%)',
  '2-Door': '2-Door Compact',
  '3-Door': '3-Door Family',
  '4-Door': '4-Door Master Wardrobe'
};

export function getColorHex(colorName) {
  if (!colorName) return '#94a3b8';
  if (colorName.startsWith('#')) return colorName;
  const clean = colorName.trim().toLowerCase();
  return COLOR_MAP[clean] || '#64748b';
}

export function getSizeLabel(sizeCode) {
  if (!sizeCode) return '';
  return SIZE_LABELS[sizeCode] || SIZE_LABELS[sizeCode.toUpperCase()] || sizeCode;
}

export function getProductCategoryType(product) {
  if (!product) return 'general';
  const cat = (product.category || '').toLowerCase();
  const title = (product.title || product.name || '').toLowerCase();

  // 1. Explicit Category prioritization
  if (cat.includes('kid') || cat.includes('toy')) return 'toys';
  if (cat.includes('apparel') || cat.includes('cloth') || cat.includes('fashion') || cat.includes('dress')) return 'apparel';
  if (cat.includes('grocery') || cat.includes('spice') || cat.includes('food')) return 'grocery';
  if (cat.includes('jewel')) return 'jewellery';
  if (cat.includes('plant')) return 'plant';
  if (cat.includes('perfume') || cat.includes('fragrance')) return 'perfume';
  if (cat.includes('utility') || cat.includes('utilities') || cat.includes('clean') || cat.includes('organizer')) return 'utilities';

  // 2. Strict whole-word matching for furniture (to avoid 'bedtime', 'tabletop', etc.)
  const hasWord = (word) => new RegExp(`\\b${word}\\b`, 'i').test(title);

  if (hasWord('bed') || hasWord('cot') || hasWord('mattress')) return 'furniture_bed';
  if (title.includes('dining table') || (hasWord('table') && !hasWord('chair'))) return 'furniture_table';
  if (hasWord('chair') || hasWord('stool') || title.includes('seating')) return 'furniture_chair';
  if (hasWord('wardrobe') || hasWord('cupboard') || hasWord('almirah') || hasWord('closet')) return 'furniture_wardrobe';
  if (cat.includes('furniture') || hasWord('sofa') || title.includes('wood') || title.includes('teak')) return 'furniture_general';

  if (hasWord('dress') || hasWord('shirt') || hasWord('kurti') || hasWord('saree') || hasWord('salwar') || hasWord('pant') || hasWord('t-shirt')) return 'apparel';
  if (hasWord('podi') || hasWord('powder') || hasWord('masala')) return 'grocery';
  if (hasWord('ring') || hasWord('bangle') || hasWord('chain') || hasWord('necklace')) return 'jewellery';

  return 'general';
}

export function isApparelProduct(product) {
  return getProductCategoryType(product) === 'apparel';
}

/**
 * Returns labels for variant pickers like Flipkart & Amazon
 */
export function getVariantTypeLabels(product) {
  const type = getProductCategoryType(product);
  switch (type) {
    case 'furniture_bed':
      return { sizeTitle: 'Bed Size / Dimensions', colorTitle: 'Wood Finish / Material' };
    case 'furniture_table':
      return { sizeTitle: 'Seating Capacity / Size', colorTitle: 'Wood Finish / Material' };
    case 'furniture_chair':
      return { sizeTitle: 'Quantity / Pack Size', colorTitle: 'Wood Finish / Material' };
    case 'furniture_wardrobe':
      return { sizeTitle: 'Configuration / Doors', colorTitle: 'Wood Finish / Material' };
    case 'furniture_general':
      return { sizeTitle: 'Size / Dimensions', colorTitle: 'Finish / Material' };
    case 'apparel':
      return { sizeTitle: 'Select Size', colorTitle: 'Select Color' };
    case 'grocery':
      return { sizeTitle: 'Net Weight / Pack Size', colorTitle: 'Flavor / Blend' };
    case 'jewellery':
      return { sizeTitle: 'Ring / Bangle Size', colorTitle: 'Metal / Finish' };
    case 'plant':
      return { sizeTitle: 'Plant Size', colorTitle: 'Planter Pot Finish' };
    default:
      return { sizeTitle: 'Size / Dimensions', colorTitle: 'Color / Finish' };
  }
}

/**
 * Returns configured variants (sizes and colors) for a product.
 * Returns empty arrays if NO variants are added to this product.
 */
export function getProductVariants(product) {
  if (!product) return { sizes: [], colors: [] };

  let sizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];
  let colors = Array.isArray(product.colors) ? product.colors.filter(Boolean) : [];

  if (typeof product.sizes === 'string') {
    try {
      const parsed = JSON.parse(product.sizes);
      if (Array.isArray(parsed)) sizes = parsed.filter(Boolean);
    } catch (e) {
      sizes = product.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof product.colors === 'string') {
    try {
      const parsed = JSON.parse(product.colors);
      if (Array.isArray(parsed)) colors = parsed.filter(Boolean);
    } catch (e) {
      colors = product.colors.split(',').map(c => c.trim()).filter(Boolean);
    }
  }

  // Also check if variants matrix array is configured
  let variants = Array.isArray(product.variants) ? product.variants : [];
  if (typeof product.variants === 'string') {
    try {
      const parsed = JSON.parse(product.variants);
      if (Array.isArray(parsed)) variants = parsed;
    } catch (e) {
      variants = [];
    }
  }

  if (Array.isArray(variants) && variants.length > 0) {
    if (sizes.length === 0) {
      const extractedSizes = [...new Set(variants.map(v => v?.size || v?.selectedSize).filter(Boolean))];
      if (extractedSizes.length > 0) sizes = extractedSizes;
    }
    if (colors.length === 0) {
      const extractedColors = [...new Set(variants.map(v => v?.color || v?.selectedColor).filter(Boolean))];
      if (extractedColors.length > 0) colors = extractedColors;
    }
  }

  return {
    sizes: [...new Set(sizes.map(s => String(s).trim()).filter(Boolean))],
    colors: [...new Set(colors.map(c => String(c).trim()).filter(Boolean))]
  };
}

/**
 * Smart pre-selection based on the product name/content
 * Returns empty strings if no variants exist for this product.
 */
export function getInitialVariants(product) {
  const { sizes, colors } = getProductVariants(product);
  const title = ((product?.title || product?.name || '') + ' ' + (product?.content || '')).toLowerCase();

  let initialSize = sizes.length > 0 ? sizes[0] : '';
  let initialColor = colors.length > 0 ? colors[0] : '';

  if (sizes.length > 0) {
    for (const s of sizes) {
      const sLower = s.toLowerCase();
      if (title.includes(sLower) || (sLower.includes('6.25 x 6') && title.includes('6.25 x 6')) || (sLower.includes('6.25 x 5') && title.includes('6.25 x 5'))) {
        initialSize = s;
        break;
      }
    }
  }

  if (colors.length > 0) {
    for (const c of colors) {
      const cLower = c.toLowerCase();
      const cFirstWord = cLower.split(' ')[0];
      if (title.includes(cLower) || (cFirstWord && title.includes(cFirstWord))) {
        initialColor = c;
        break;
      }
    }
  }

  return { initialSize, initialColor };
}

/**
 * Returns matching product title based on selected variant (e.g. Bed dimensions and finish)
 */
export function getVariantTitle(product, selectedSize, selectedColor) {
  if (!product) return '';
  const baseTitle = product.title || product.name || '';
  const titleLower = baseTitle.toLowerCase();
  const type = getProductCategoryType(product);
  if (type === 'furniture_bed' && titleLower.includes('aakeshya') && (titleLower.includes('bed') || titleLower.includes('cot'))) {
    const isTeak = (selectedColor || '').toLowerCase().includes('teak');
    const is6x6 = (selectedSize || '').toLowerCase().includes('6.25 x 6') || (selectedSize || '').toLowerCase().includes('6 ft');
    const finish = isTeak ? 'Teak' : 'Akeshya';
    const dim = is6x6 ? '6.25 x 6 ft' : '6.25 x 5 ft';
    return `Aakeshya Upholstered Wooden Bed (${dim} - ${finish})`;
  }
  return baseTitle;
}

/**
 * Flipkart & Amazon dynamic variant pricing calculator
 * When the user selects "6.25 x 6 ft - Akeshya", dynamically adjusts price!
 */
export function calculateVariantPrice(product, selectedSize, selectedColor) {
  if (!product) return { price: 0, oldPrice: 0, offer: '0% OFF' };

  const rawBasePrice = parseFloat(product.offerPrice !== undefined && product.offerPrice !== null && product.offerPrice !== '' ? product.offerPrice : (product.price || 0)) || 0;
  const rawOldPrice = parseFloat(product.oldPrice !== undefined && product.oldPrice !== null && product.oldPrice !== '' ? product.oldPrice : (product.old_price || 0)) || 0;

  let finalPrice = rawBasePrice;
  let finalOldPrice = rawOldPrice;

  // 1. If explicit variants array configured in Admin (Flipkart & Amazon seller style)
  if (product && Array.isArray(product.variants) && product.variants.length > 0) {
    const sLower = (selectedSize || '').toLowerCase().trim();
    const cLower = (selectedColor || '').toLowerCase().trim();
    const matched = product.variants.find(v => {
      const vSize = (v.size || '').toLowerCase().trim();
      const vColor = (v.color || '').toLowerCase().trim();
      const sizeMatch = !vSize || !sLower || vSize === sLower;
      const colorMatch = !vColor || !cLower || vColor === cLower;
      return sizeMatch && colorMatch;
    });

    if (matched) {
      const vPrice = parseFloat(matched.price !== undefined && matched.price !== '' ? matched.price : (matched.offerPrice || rawBasePrice));
      const vOld = matched.oldPrice !== undefined && matched.oldPrice !== null && matched.oldPrice !== '' 
        ? matched.oldPrice 
        : (matched.old_price !== undefined && matched.old_price !== null && matched.old_price !== '' ? matched.old_price : null);
      const vOldPrice = vOld !== null ? parseFloat(vOld) : null;

      finalPrice = !isNaN(vPrice) && vPrice > 0 ? vPrice : rawBasePrice;
      finalOldPrice = vOldPrice !== null && !isNaN(vOldPrice) && vOldPrice > 0 ? vOldPrice : rawOldPrice;

      const discountAmount = Math.max(0, finalOldPrice - finalPrice);
      const discountPercent = finalOldPrice > 0 ? Math.round((discountAmount / finalOldPrice) * 100) : 0;
      return {
        price: finalPrice,
        oldPrice: finalOldPrice > finalPrice ? finalOldPrice : null,
        discountPercent,
        offer: discountPercent > 0 ? `${discountPercent}% OFF` : '',
        savings: discountAmount,
        sku: matched.sku || '',
        stock: matched.stock !== undefined ? matched.stock : product.stock
      };
    }
  }

  // 2. Specific Bed Pricing matching ONLY the original catalog seed Aakeshya Bed if no custom variants
  const titleLower = (product.title || product.name || '').toLowerCase();
  const isOriginalAakeshyaBed = (product.id === 4 || product.id === '4') && (!product.variants || product.variants.length === 0);
  if (isOriginalAakeshyaBed && (titleLower.includes('bed') || titleLower.includes('cot'))) {
    const size = (selectedSize || '').toLowerCase();
    const color = (selectedColor || '').toLowerCase();
    const isTeak = color.includes('teak');
    const is6x6 = size.includes('6.25 x 6') || size.includes('6 ft');

    if (isTeak) {
      if (is6x6) {
        finalPrice = 24000;
        finalOldPrice = 28500;
      } else {
        finalPrice = 17000;
        finalOldPrice = 20000;
      }
    } else {
      if (is6x6) {
        finalPrice = 19000;
        finalOldPrice = 22500;
      } else {
        finalPrice = 14000;
        finalOldPrice = 16500;
      }
    }
  }

  // Calculate discount percentage
  const discountAmount = Math.max(0, finalOldPrice - finalPrice);
  const discountPercent = finalOldPrice > 0 ? Math.round((discountAmount / finalOldPrice) * 100) : 0;
  const offer = discountPercent > 0 ? `${discountPercent}% OFF` : '';

  return {
    price: finalPrice,
    oldPrice: finalOldPrice > finalPrice ? finalOldPrice : null,
    discountPercent,
    offer,
    savings: discountAmount
  };
}
