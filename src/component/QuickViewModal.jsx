import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, ArrowRight, Minus, Plus, ShieldCheck, Truck, RotateCcw, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ImageLoader from './image-loader';
import { 
  getColorHex, 
  getSizeLabel, 
  getProductVariants, 
  getVariantTypeLabels, 
  getInitialVariants, 
  calculateVariantPrice,
  getVariantTitle 
} from '../utils/variantUtils';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Extract variants (sizes & colors)
  const { sizes, colors } = getProductVariants(product);
  const { sizeTitle, colorTitle } = getVariantTypeLabels(product);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setAdded(false);
      setActiveImageIndex(0);
      const { initialSize, initialColor } = getInitialVariants(product);
      setSelectedSize(product.selectedSize || initialSize);
      setSelectedColor(product.selectedColor || initialColor);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image_url || product.image].filter(Boolean);

  const currentImage = gallery[activeImageIndex] || product.image_url || product.image;
  
  // Real-time Flipkart/Amazon variant pricing
  const pricing = calculateVariantPrice(product, selectedSize, selectedColor);
  const currentPrice = pricing.price;
  const currentOldPrice = pricing.oldPrice;
  const currentOffer = pricing.offer;

  const currentTitle = getVariantTitle(product, selectedSize, selectedColor);
  const category = (product.category || 'Collection').toUpperCase();

  const handleAdd = async () => {
    const productWithVariantPrice = {
      ...product,
      title: currentTitle,
      name: currentTitle,
      price: currentPrice,
      offerPrice: currentPrice,
      oldPrice: currentOldPrice
    };
    await addToCart(productWithVariantPrice, quantity, {
      selectedSize,
      selectedColor
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2200);
  };

  const handleBuyNow = () => {
    onClose();
    navigate('/checkout', {
      state: {
        product: {
          ...product,
          title: currentTitle,
          name: currentTitle,
          price: currentPrice,
          offerPrice: currentPrice,
          oldPrice: currentOldPrice,
          selectedSize,
          selectedColor
        },
        quantity
      }
    });
  };

  const handleGoToDetails = () => {
    onClose();
    navigate(`/product-view/${product.id}`, { 
      state: { 
        product: {
          ...product,
          selectedSize,
          selectedColor
        } 
      } 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 border border-gray-100 flex flex-col md:flex-row my-auto max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 text-gray-500 hover:text-gray-900 bg-white/90 backdrop-blur-md rounded-full shadow-xs hover:bg-white transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Showcase Gallery */}
        <div className="md:w-5/12 bg-[#f6f7f6] p-5 sm:p-6 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-gray-100">
          <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-white/80 p-4 shadow-xs flex items-center justify-center">
            {currentOffer && (
              <span className="absolute top-3 left-3 z-10 text-[10px] font-bold text-white bg-[#134e35] px-2.5 py-1 rounded-full shadow-2xs">
                {currentOffer}
              </span>
            )}
            <ImageLoader
              src={currentImage}
              alt={title}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Gallery Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto w-full justify-center py-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 rounded-lg bg-white p-1 border-2 transition-all cursor-pointer overflow-hidden ${
                    activeImageIndex === idx ? 'border-[#134e35] shadow-xs' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}

          {/* View Full Page Link */}
          <button
            onClick={handleGoToDetails}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#134e35] hover:text-[#0b2b1d] hover:underline cursor-pointer"
          >
            <span>View Full Product Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Options & Variant Selectors */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                  {category}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  ● In Stock
                </span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug line-clamp-2">
                {currentTitle}
              </h2>

              {/* Dynamic variant highlight tagline */}
              {(selectedSize || selectedColor) && (
                <p className="text-xs text-[#134e35] font-medium mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 inline shrink-0" />
                  <span>Selected: <strong>{selectedSize}</strong> {selectedColor && `• ${selectedColor}`}</span>
                </p>
              )}
            </div>

            {/* Price section (Dynamic Real-time Flipkart & Amazon updates) */}
            <div className="flex items-baseline gap-3 pb-3 border-b border-gray-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {currentOldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{currentOldPrice.toLocaleString('en-IN')}
                </span>
              )}
              {currentOffer && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  {currentOffer}
                </span>
              )}
              {product.freeShipping && (
                <span className="text-[11px] font-medium text-[#134e35] bg-[#eaf4ee] px-2 py-0.5 rounded-md ml-auto">
                  🚚 Free Delivery
                </span>
              )}
            </div>

            {/* Size / Dimension Variants (Flipkart / Amazon Style) */}
            {sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">
                    {sizeTitle}:
                  </span>
                  <span className="font-semibold text-[#134e35]">
                    {getSizeLabel(selectedSize)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-10 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#134e35] text-white border-[#134e35] shadow-xs scale-105'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color / Wood Finish Variants (Flipkart / Amazon Style) */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">
                    {colorTitle}:
                  </span>
                  <span className="font-semibold text-[#134e35]">
                    {selectedColor}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {colors.map((c) => {
                    const hex = getColorHex(c);
                    const isSelected = selectedColor?.toLowerCase() === c.toLowerCase();
                    const isWhite = c.toLowerCase() === 'white' || hex === '#ffffff';

                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        title={c}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 border-[#134e35] shadow-xs ring-1 ring-[#134e35]'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full inline-block shadow-2xs shrink-0 ${
                            isWhite ? 'border border-gray-300' : 'border border-black/10'
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                        <span className="capitalize">{c}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#134e35]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-gray-800">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl px-2 py-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-gray-500 hover:text-black cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-gray-500 hover:text-black cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Action CTAs: Add to Bag + Buy Now */}
          <div className="pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAdd}
                disabled={added}
                className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#134e35] hover:bg-[#0e3a27] text-white active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gray-900 hover:bg-black text-white flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs cursor-pointer active:scale-95"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="flex items-center justify-around text-[10px] text-gray-500 pt-2 border-t border-gray-100 font-medium">
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#134e35]" /> Fast Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-[#134e35]" /> 7-Day Returns
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#134e35]" /> Verified Authentic
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
