import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Truck, RotateCcw, ShieldCheck, Minus, Plus, Heart, Share2, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
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
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { products, getProductById } = useProducts();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const { addToCart, toggleLike, isLiked } = useCart();

  useEffect(() => {
    const passedProduct = location.state?.product;
    const globalProduct = getProductById(id);
    const targetProduct = passedProduct || globalProduct;

    if (targetProduct) {
      setProduct(targetProduct);
      const { initialSize, initialColor } = getInitialVariants(targetProduct);
      setSelectedSize(targetProduct.selectedSize || initialSize);
      setSelectedColor(targetProduct.selectedColor || initialColor);
    }
    setActiveImage(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, location.state, products, getProductById]);

  useEffect(() => {
    NativeFancybox.bind("[data-fancybox]", {
      Thumbs: { autoStart: false },
      Toolbar: true,
    });
    return () => {
      NativeFancybox.destroy();
    };
  }, [product]);

  if (!product) {
    return (
      <div className="py-24 text-center bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-3 border-[#134e35] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-500">Loading thoughtful finds...</p>
      </div>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image_url || product.image].filter(Boolean);

  const currentImage = gallery[activeImage] || product.image_url || product.image;
  const price = product.offerPrice || product.price || 0;
  const oldPrice = product.oldPrice || (product.discount > 0 ? Math.round((parseFloat(price) * 100) / (100 - parseFloat(product.discount))) : null);
  const title = product.name || product.title || 'Product';
  const category = product.category || 'Store Collection';
  const liked = isLiked(product.id);

  const { sizes, colors } = getProductVariants(product);
  const { sizeTitle, colorTitle } = getVariantTypeLabels(product);

  // Dynamic Flipkart / Amazon variant pricing
  const pricing = calculateVariantPrice(product, selectedSize, selectedColor);
  const currentPrice = pricing.price;
  const currentOldPrice = pricing.oldPrice;
  const currentOffer = pricing.offer;
  const currentTitle = getVariantTitle(product, selectedSize, selectedColor);

  const handleAddToCart = async () => {
    const productWithVariantPrice = {
      ...product,
      title: currentTitle,
      name: currentTitle,
      price: currentPrice,
      offerPrice: currentPrice,
      oldPrice: currentOldPrice
    };
    await addToCart(productWithVariantPrice, quantity, { selectedSize, selectedColor });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleBuyNow = () => {
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch (err) {
        // Ignored
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <section className="bg-white py-8 sm:py-12 border-b border-gray-100">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 max-w-7xl">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/product" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/product?category=${encodeURIComponent(category)}`} className="hover:text-black transition-colors">
            {category}
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{title}</span>
        </nav>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Showcase Image */}
            <div className="relative aspect-square w-full bg-[#f6f7f6] rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center p-6 group">
              {product.offer && (
                <span className="absolute top-4 left-4 z-10 text-xs font-semibold text-gray-800 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-2xs">
                  {product.offer}
                </span>
              )}

              <a
                href={currentImage}
                data-fancybox="gallery"
                data-caption={`${title} - ₹${price}`}
                className="w-full h-full flex items-center justify-center cursor-zoom-in"
              >
                <ImageLoader
                  src={currentImage}
                  alt={title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                />
              </a>

              {/* Wishlist and Share Floating Buttons */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => toggleLike(product)}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs shadow-2xs flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Save to wishlist"
                >
                  <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs shadow-2xs flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-[#f6f7f6] p-1.5 shrink-0 overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImage === idx
                        ? 'border-[#134e35] shadow-xs'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`${title} preview ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category & Title */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#5c6e61]">
                    {category}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    ● In Stock
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14261c] tracking-tight leading-tight font-serif">
                  {currentTitle}
                </h1>

                {/* Dynamic Selected Variant Tagline */}
                {(selectedSize || selectedColor) && (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200/70 rounded-lg text-xs text-gray-700">
                    <Sparkles className="w-3.5 h-3.5 text-[#134e35]" />
                    <span>Variant: <strong className="text-gray-900">{selectedSize}</strong> {selectedColor && `• `}<span className="text-gray-900 font-medium">{selectedColor}</span></span>
                  </div>
                )}
              </div>

              {/* Price & Discounts (Flipkart & Amazon dynamic updates) */}
              <div className="flex items-baseline gap-3 border-b border-gray-100 pb-5">
                <span className="text-3xl font-extrabold text-gray-900 font-sans">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {currentOldPrice && (
                  <span className="text-base text-gray-400 line-through">
                    ₹{currentOldPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {currentOffer && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                    {currentOffer}
                  </span>
                )}
                {product.freeShipping && (
                  <span className="text-xs font-semibold text-[#134e35] bg-[#eaf4ee] px-2.5 py-1 rounded-md ml-auto">
                    🚚 Free Delivery
                  </span>
                )}
              </div>

              {/* Summary Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description || product.content || 'Thoughtfully crafted with quality materials, designed to bring enduring comfort and function into your living spaces.'}
              </p>

              {/* Size / Dimension Selector (Flipkart / Amazon Style) */}
              {sizes.length > 0 && (
                <div className="space-y-2.5 pt-1 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 uppercase tracking-wider">
                      {sizeTitle}:
                    </span>
                    <span className="font-bold text-[#134e35]">
                      {getSizeLabel(selectedSize)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-12 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#134e35] text-white border-[#134e35] shadow-xs scale-105'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color / Wood Finish Selector (Flipkart / Amazon Style) */}
              {colors.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 uppercase tracking-wider">
                      {colorTitle}:
                    </span>
                    <span className="font-bold text-gray-700 capitalize">
                      {selectedColor}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
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
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 border-[#134e35] shadow-xs ring-1 ring-[#134e35]'
                              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full inline-block shadow-2xs shrink-0 ${
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

              {/* Quantity Stepper & Add to Bag Actions */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-700">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl px-2 py-1 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 text-gray-500 hover:text-black cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-black cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCart}
                    className={`py-3.5 px-6 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs ${
                      isAdded
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#134e35] hover:bg-[#0e3a27] text-white active:scale-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to bag</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={handleBuyNow}
                    className="py-3.5 px-6 rounded-full font-semibold text-xs sm:text-sm bg-[#14261c] hover:bg-black text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delivery, Returns, & Guarantees (Conditionally set properly!) */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-[#f4f6f4] flex items-center justify-center shrink-0 text-[#134e35]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    {product.freeShipping ? (
                      <p className="font-semibold text-gray-900">
                        Free Delivery across Kerala & India
                      </p>
                    ) : (
                      <p className="font-semibold text-gray-900">
                        Standard Doorstep Delivery
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500">Delivered within 2–5 business days</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-[#f4f6f4] flex items-center justify-center shrink-0 text-[#134e35]">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">7-Day Return Guarantee</p>
                    <p className="text-[11px] text-gray-500">Hassle-free replacement or return</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-[#f4f6f4] flex items-center justify-center shrink-0 text-[#134e35]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">100% Genuine Quality</p>
                    <p className="text-[11px] text-gray-500">Verified products carefully inspected</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
