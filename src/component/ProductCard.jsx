import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Check, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { getProductVariants } from '../utils/variantUtils';
import ImageLoader from './image-loader';

const FALLBACK_BADGES = ['Best seller', 'Everyday essential', 'Popular pick', 'New arrival', 'Top rated', 'Staff pick'];

/**
 * Shared high-converting product card used across Home, Catalog, and Related Products.
 */
export default function ProductCard({ product, index = 0, priority = false, onQuickView, showDescription = false }) {
  const navigate = useNavigate();
  const { addToCart, toggleLike, isLiked, openCartDrawer } = useCart();
  const { requireLogin } = useUser();
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const liked = isLiked(product.id);
  const price = parseFloat(
    product.offerPrice !== undefined && product.offerPrice !== null && product.offerPrice !== ''
      ? product.offerPrice
      : (product.price || 0)
  );
  const rawOld =
    product.oldPrice !== undefined && product.oldPrice !== null && product.oldPrice !== ''
      ? parseFloat(product.oldPrice)
      : (product.old_price !== undefined && product.old_price !== null && product.old_price !== ''
          ? parseFloat(product.old_price)
          : null);
  const oldPrice =
    rawOld !== null && !isNaN(rawOld) && rawOld > 0
      ? rawOld
      : (product.discount > 0
          ? Math.round((price * 100) / (100 - parseFloat(product.discount)))
          : (price > 0 ? Math.round(price * 1.2) : null));

  const discountPct =
    oldPrice && price > 0 && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;
  const tag =
    product.offer
      ? `-${product.offer.toString().replace(/[^0-9]/g, '')}%`
      : discountPct > 0
      ? `-${discountPct}% OFF`
      : FALLBACK_BADGES[index % FALLBACK_BADGES.length];

  const imageSrc = product.image_url || product.image || (product.gallery && product.gallery[0]);
  const title = product.name || product.title || 'Product';
  const category = product.category || 'STORE PICK';
  const description = product.description || product.content || '';
  const { sizes, colors } = getProductVariants(product);
  const hasVariants = (sizes && sizes.length > 0) || (colors && colors.length > 0);

  const handleNavigateDetails = () => {
    navigate(`/product-view/${product.id}`, { state: { product } });
  };

  const handleAddAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants && onQuickView) {
      onQuickView(product);
      return;
    }
    await addToCart(product, 1);
    setJustAdded(true);
    openCartDrawer();
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants && onQuickView) {
      onQuickView(product);
      return;
    }
    requireLogin(() => {
      navigate('/checkout', { state: { product, quantity: 1 } });
    });
  };

  return (
    <div
      onClick={handleNavigateDetails}
      className="group bg-white rounded-2xl border border-gray-100/90 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 hover:border-[#134e35]/20 transition-all duration-300 flex flex-col relative cursor-pointer h-full"
    >
      {/* Image Area */}
      <div className="aspect-square bg-[#f5f6f5] relative flex items-center justify-center p-4 overflow-hidden">
        <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${
          discountPct > 0 || product.offer
            ? 'bg-[#134e35] text-white'
            : 'bg-white/95 backdrop-blur-xs text-gray-700'
        }`}>
          {tag}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleLike(product);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs shadow-2xs flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
        </button>

        <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <ImageLoader
            src={imageSrc}
            alt={title}
            priority={priority}
            className="w-full h-full object-contain mix-blend-multiply"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 md:p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1 truncate">
            {category}
          </div>

          <h3
            className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 group-hover:text-[#134e35] transition-colors mb-1.5 leading-snug"
            title={title}
          >
            {title}
          </h3>

          {showDescription && description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
              {description}
            </p>
          )}
        </div>

        {/* Price, Delivery & CTAs */}
        <div className="mt-auto pt-2.5 border-t border-gray-100">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base md:text-lg font-black text-gray-900 tracking-tight whitespace-nowrap">
              ₹{Math.round(Number(price) || 0).toLocaleString('en-IN')}
            </span>
            {oldPrice && Number(oldPrice) > Number(price) && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through whitespace-nowrap">
                ₹{Math.round(Number(oldPrice) || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="mt-1.5 mb-3 flex items-center gap-1.5 flex-wrap">
            {product.freeShipping !== false ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#134e35] bg-[#edf6f1] px-2 py-0.5 rounded-md whitespace-nowrap">
                <Truck className="w-3 h-3 text-[#134e35] shrink-0" />
                <span>Free delivery</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                <Truck className="w-3 h-3 text-gray-400 shrink-0" />
                <span>COD available</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleAddAction}
              className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer z-10 ${
                justAdded
                  ? 'bg-[#134e35] border-[#134e35] text-white'
                  : 'border-gray-200 hover:border-[#134e35] hover:bg-[#edf6f1] hover:text-[#134e35] text-gray-700'
              }`}
              title={hasVariants ? 'Select Options' : 'Add to Bag'}
              aria-label={`Add ${title} to Bag`}
            >
              {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 h-9 px-3 rounded-xl bg-[#134e35] hover:bg-[#0c3322] active:bg-[#082216] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer z-10 whitespace-nowrap group/buy"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/buy:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
