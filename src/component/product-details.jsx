import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { FaShoppingCart, FaBolt, FaTruck, FaUndo, FaShieldAlt, FaBoxOpen } from 'react-icons/fa';
import { MdOutlineLocalOffer, MdGppGood, MdOutlineSupportAgent } from 'react-icons/md';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ImageLoader from './image-loader';
import "@fancyapps/ui/dist/fancybox/fancybox.css";

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { products, getProductById } = useProducts();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const passedProduct = location.state?.product;
    const globalProduct = getProductById(id);

    if (passedProduct && globalProduct && passedProduct.title === globalProduct.title) {
      setProduct(globalProduct);
    } else if (passedProduct) {
      setProduct(passedProduct);
    } else if (globalProduct) {
      setProduct(globalProduct);
    }
    setActiveImage(0);
    // Scroll to top when product changes
    window.scrollTo(0, 0);
  }, [id, location.state, products, getProductById]);

  useEffect(() => {
    NativeFancybox.bind("[data-fancybox]", {
      Thumbs: { autoStart: false },
      Toolbar: true,
    });

    return () => {
      NativeFancybox.destroy();
    };
  }, []);

  const handleAddToCart = async () => {
    const result = await addToCart({
      id: product.id,
      title: product.title,
      content: product.content,
      price: product.offerPrice,
      offerPrice: product.offerPrice,
      image: product.gallery?.[0],
      gallery: product.gallery,
    });

    if (result.success) {
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', { state: { product, quantity: 1 } });
  };

  if (!product) return <div>Loading...</div>;

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <a
                href={product.gallery?.[activeImage]}
                data-fancybox="gallery"
                data-caption={`${product.title} - ₹${product.offerPrice}`}
                className="block w-full h-[500px] bg-[#f2f2f200] rounded-lg flex items-center justify-center overflow-hidden mb-4 border border-[#ebebec]"
              >
                <ImageLoader
                  src={product.gallery?.[activeImage]}
                  alt={product.title}
                  aspectRatio=""
                  wrapperClassName="w-full h-full"
                  imgClassName="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                />
              </a>

              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">{product.title}</h1>
                <p className="text-gray-600 text-base leading-relaxed">{product.content}</p>

                <div className="mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-start text-gray-900">
                      <span className="text-3xl font-medium">₹</span>
                      <span className="text-4xl font-semibold leading-none">{product.offerPrice}</span>
                    </div>
                    {product.offer && (
                      <span className="text-2xl font-semibold text-green-600">-{product.offer.replace(/[^0-9]/g, '')}%</span>
                    )}
                  </div>
                  {product.oldPrice && (
                    <div className="text-m text-gray-500 mt-2">
                       M.R.P.: <span className="line-through text-base font-semibold">₹{product.oldPrice}</span>
                    </div>
                  )}
                </div>

                {/* Persuasive Elements */}
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm animate-pulse py-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>Limited Time Offer: Selling fast!</span>
                </div>

                {/* Shipping & Return Badges */}
                <div className="flex flex-wrap gap-3 mt-4 border-y border-gray-100 py-4">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
                    <FaTruck size={14} />
                    <span>{product.freeShipping ? "Free Delivery" : "Fast Delivery"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full text-sm font-medium">
                    <FaUndo size={14} />
                    <span>{product.isReturnable ? "7 Day Returns" : "No Returns"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-medium">
                    <FaBoxOpen size={14} />
                    <span>{product.deliveryPolicy || "Kerala Delivery"}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-900 font-bold text-lg mb-2">About this item</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>{product.description}</p>
                    <p>{product.subDescription}</p>
                    <p>{product.subContent}</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500">{product.count} people viewed this recently</div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-900 text-gray-900 px-6 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 transform active:scale-95 group"
                  >
                    <FaShoppingCart className="text-xl shrink-0" />

                      <span className="text-sm font-semibold">Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white px-6 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-gray-200 transform hover:-translate-y-1 active:scale-95"
                  >
                    <FaBolt className="text-xl" />
                    <span className="text-lg font-semibold uppercase tracking-tight">Buy Now</span>
                  </button>
                </div>

                {/* Trust Signals */}
                <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-green-600" />
                    <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Secure Payment</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdGppGood className="text-blue-600" />
                    <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Verified Quality</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT RELATED IMAGES */}
          <div className="md:col-span-5">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
              <div className="grid grid-cols-2 gap-4">
                {product.gallery?.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-square cursor-pointer"
                    onClick={() => setActiveImage(index)}
                  >
                    <div
                      className={`h-full bg-gray-100 rounded-lg overflow-hidden transition-all duration-200 border-2
                        ${activeImage === index ? "border-gray-900 shadow-sm" : "border-transparent hover:border-gray-200"}`}
                    >
                      <ImageLoader
                        src={img}
                        alt={`Gallery ${index}`}
                        aspectRatio="aspect-square"
                        imgClassName="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Product Highlights</h3>
                <div className="space-y-4">
                  {(product.highlights || ["Free Shipping", "Easy Returns", "Secure Checkout"]).map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                         {idx % 3 === 0 && <FaTruck size={18} />}
                         {idx % 3 === 1 && <FaUndo size={18} />}
                         {idx % 3 === 2 && <FaShieldAlt size={18} />}
                      </div>
                      <span className="text-gray-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
