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
  const desc = (product.description || product.content || '').toLowerCase();
  const text = `${cat} ${title} ${desc}`;

  if (text.includes('bed') || text.includes('cot') || text.includes('mattress')) return 'furniture_bed';
  if (text.includes('dining table') || (text.includes('table') && !text.includes('chair'))) return 'furniture_table';
  if (text.includes('chair') || text.includes('seating') || text.includes('stool')) return 'furniture_chair';
  if (text.includes('wardrobe') || text.includes('cupboard') || text.includes('almirah') || text.includes('closet')) return 'furniture_wardrobe';
  if (cat.includes('furniture') || text.includes('sofa') || text.includes('wood') || text.includes('teak') || text.includes('akeshya')) return 'furniture_general';
  if (cat.includes('apparel') || cat.includes('cloth') || cat.includes('fashion') || cat.includes('dress') || text.includes('shirt') || text.includes('kurti') || text.includes('saree') || text.includes('wear') || text.includes('pant') || text.includes('t-shirt') || text.includes('salwar')) return 'apparel';
  if (cat.includes('grocery') || cat.includes('spice') || cat.includes('food') || text.includes('podi') || text.includes('powder') || text.includes('masala')) return 'grocery';
  if (cat.includes('jewel') || text.includes('gold') || text.includes('bangle') || text.includes('necklace') || text.includes('ring')) return 'jewellery';
  if (cat.includes('plant') || text.includes('plant') || text.includes('flower') || text.includes('garden')) return 'plant';

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
      return { sizeTitle: 'Select Option / Size', colorTitle: 'Select Finish / Color' };
  }
}

/**
 * Returns configured or smart Flipkart/Amazon default variants for ANY product
 */
export function getProductVariants(product) {
  if (!product) return { sizes: GENERAL_SIZES, colors: GENERAL_FINISHES };

  let sizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];
  let colors = Array.isArray(product.colors) ? product.colors.filter(Boolean) : [];

  if (typeof product.sizes === 'string') {
    try { sizes = JSON.parse(product.sizes); } catch (e) { sizes = product.sizes.split(',').map(s => s.trim()).filter(Boolean); }
  }
  if (typeof product.colors === 'string') {
    try { colors = JSON.parse(product.colors); } catch (e) { colors = product.colors.split(',').map(c => c.trim()).filter(Boolean); }
  }

  // If already populated, return them
  if (sizes.length > 0 && colors.length > 0) {
    return { sizes, colors };
  }

  const type = getProductCategoryType(product);
  let defaultSizes = GENERAL_SIZES;
  let defaultColors = GENERAL_FINISHES;

  switch (type) {
    case 'furniture_bed':
      defaultSizes = BED_SIZES;
      defaultColors = BED_FINISHES;
      break;
    case 'furniture_table':
      defaultSizes = DINING_TABLE_SIZES;
      defaultColors = DINING_TABLE_FINISHES;
      break;
    case 'furniture_chair':
      defaultSizes = CHAIR_SIZES;
      defaultColors = CHAIR_FINISHES;
      break;
    case 'furniture_wardrobe':
      defaultSizes = WARDROBE_SIZES;
      defaultColors = WARDROBE_FINISHES;
      break;
    case 'furniture_general':
      defaultSizes = ['Standard', 'Compact', 'Large'];
      defaultColors = BED_FINISHES;
      break;
    case 'apparel':
      defaultSizes = DEFAULT_CLOTHING_SIZES;
      defaultColors = DEFAULT_CLOTHING_COLORS;
      break;
    case 'grocery':
      defaultSizes = GROCERY_SIZES;
      defaultColors = GROCERY_FINISHES;
      break;
    case 'jewellery':
      defaultSizes = JEWELLERY_SIZES;
      defaultColors = JEWELLERY_FINISHES;
      break;
    case 'plant':
      defaultSizes = PLANT_SIZES;
      defaultColors = PLANT_FINISHES;
      break;
    default:
      defaultSizes = GENERAL_SIZES;
      defaultColors = GENERAL_FINISHES;
      break;
  }

  return {
    sizes: sizes.length > 0 ? sizes : defaultSizes,
    colors: colors.length > 0 ? colors : defaultColors
  };
}

/**
 * Smart pre-selection based on the product name/content
 * e.g. "Aakeshya Upholstered Wooden Bed (6.25 x 6 ft - Teak)" => size "6.25 x 6 ft", color "Teak Wood"
 */
export function getInitialVariants(product) {
  const { sizes, colors } = getProductVariants(product);
  const title = ((product?.title || product?.name || '') + ' ' + (product?.content || '')).toLowerCase();

  let initialSize = sizes[0] || '';
  let initialColor = colors[0] || '';

  // Match sizes from title
  for (const s of sizes) {
    const sLower = s.toLowerCase();
    if (title.includes(sLower) || (sLower.includes('6.25 x 6') && title.includes('6.25 x 6')) || (sLower.includes('6.25 x 5') && title.includes('6.25 x 5'))) {
      initialSize = s;
      break;
    }
  }

  // Match colors / finish from title
  for (const c of colors) {
    const cLower = c.toLowerCase();
    const cFirstWord = cLower.split(' ')[0];
    if (title.includes(cLower) || (cFirstWord && title.includes(cFirstWord))) {
      initialColor = c;
      break;
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
  const type = getProductCategoryType(product);
  if (type === 'furniture_bed') {
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

  const rawBasePrice = parseFloat(product.offerPrice || product.price || 0) || 0;
  const rawOldPrice = parseFloat(product.oldPrice || 0) || Math.round(rawBasePrice * 1.2);

  const type = getProductCategoryType(product);
  const size = (selectedSize || '').toLowerCase();
  const color = (selectedColor || '').toLowerCase();

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

    if (matched && (matched.price || matched.offerPrice)) {
      const vPrice = parseFloat(matched.price || matched.offerPrice) || rawBasePrice;
      const vOldPrice = parseFloat(matched.oldPrice) || (rawOldPrice > vPrice ? rawOldPrice : Math.round(vPrice * 1.2));
      const discountAmount = Math.max(0, vOldPrice - vPrice);
      const discountPercent = vOldPrice > 0 ? Math.round((discountAmount / vOldPrice) * 100) : 0;
      return {
        price: vPrice,
        oldPrice: vOldPrice > vPrice ? vOldPrice : null,
        discountPercent,
        offer: discountPercent > 0 ? `${discountPercent}% OFF` : '',
        savings: discountAmount,
        sku: matched.sku || '',
        stock: matched.stock !== undefined ? matched.stock : product.stock
      };
    }
  }

  // Specific Bed Pricing matching exactly the 4 catalog products from https://eacyclic.com/product
  if (type === 'furniture_bed') {
    // 1. Aakeshya Upholstered Wooden Bed (6.25 x 5 ft - Akeshya) -> Rs 14,000 (old Rs 16,500)
    // 2. Aakeshya Upholstered Wooden Bed (6.25 x 6 ft - Akeshya) -> Rs 19,000 (old Rs 22,500)
    // 3. Aakeshya Upholstered Wooden Bed (6.25 x 5 ft - Teak) -> Rs 17,000 (old Rs 20,000)
    // 4. Aakeshya Upholstered Wooden Bed (6.25 x 6 ft - Teak) -> Rs 24,000 (old Rs 28,500)
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
      // Akeshya Wood
      if (is6x6) {
        finalPrice = 19000;
        finalOldPrice = 22500;
      } else {
        finalPrice = 14000;
        finalOldPrice = 16500;
      }
    }
  } 
  else if (type === 'furniture_chair') {
    // Single, Set of 2, Set of 4, Set of 6
    const singlePrice = rawBasePrice > 4000 ? 3499 : (rawBasePrice > 1300 ? 1450 : 1250);
    const singleOld = Math.round(singlePrice * 1.25);

    if (size.includes('2')) {
      finalPrice = Math.round(singlePrice * 2 * 0.95);
      finalOldPrice = singleOld * 2;
    } else if (size.includes('4')) {
      finalPrice = Math.round(singlePrice * 4 * 0.91);
      finalOldPrice = singleOld * 4;
    } else if (size.includes('6')) {
      finalPrice = Math.round(singlePrice * 6 * 0.88);
      finalOldPrice = singleOld * 6;
    } else {
      finalPrice = singlePrice;
      finalOldPrice = singleOld;
    }

    if (color.includes('teak')) {
      finalPrice += size.includes('4') ? 800 : (size.includes('6') ? 1200 : 250);
      finalOldPrice += size.includes('4') ? 1000 : 350;
    }
  }
  else if (type === 'furniture_table') {
    if (size.includes('4')) {
      finalPrice = 8499;
      finalOldPrice = 10500;
    } else if (size.includes('8')) {
      finalPrice = 15999;
      finalOldPrice = 19500;
    } else {
      finalPrice = 10999;
      finalOldPrice = 12500;
    }
  }
  else if (type === 'furniture_wardrobe') {
    if (size.includes('2')) {
      finalPrice = 18000;
      finalOldPrice = 22000;
    } else if (size.includes('3')) {
      finalPrice = 25000;
      finalOldPrice = 30000;
    } else {
      finalPrice = color.includes('teak') ? 36000 : 32000;
      finalOldPrice = color.includes('teak') ? 42000 : 38000;
    }
  }
  else if (type === 'grocery') {
    if (size.includes('100g')) {
      finalPrice = Math.round(rawBasePrice * 0.45);
      finalOldPrice = Math.round(rawOldPrice * 0.45);
    } else if (size.includes('500g')) {
      finalPrice = Math.round(rawBasePrice * 1.85);
      finalOldPrice = Math.round(rawOldPrice * 1.85);
    } else if (size.includes('1 kg')) {
      finalPrice = Math.round(rawBasePrice * 3.4);
      finalOldPrice = Math.round(rawOldPrice * 3.4);
    } else {
      finalPrice = rawBasePrice;
      finalOldPrice = rawOldPrice;
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
