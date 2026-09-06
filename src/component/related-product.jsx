import React, { useState } from 'react';
import Slider from "react-slick";
import { PiShareFat } from "react-icons/pi";
import { BiSolidLike, BiLike, BiCart, BiSolidCart } from "react-icons/bi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ImageLoader from './image-loader';
import ProductSkeleton from './product-skeleton';

function RelatedProduct() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const [likes, setLikes] = useState({});
  const [carts, setCarts] = useState({});

  // Filter out the current product and show others as "related"
  // In a real app, we might filter by category
  const relatedProducts = products.filter(p => p.id.toString() !== id?.toString()).slice(0, 8);

  const toggleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleCart = (id) => {
    setCarts(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    arrows: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1199, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <section className='related_product_sec py-16 bg-white overflow-hidden border-t border-gray-100'>
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 uppercase tracking-tight">Best Product</h2>
          <div className="w-16 h-1 bg-black mt-3 rounded-full"></div>
        </div>
        
        {loading && relatedProducts.length === 0 ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="features_slider -mx-3">
            <Slider {...settings}>
              {relatedProducts.map(item => (
                <div className='px-3 pb-8' key={item.id}>
                  <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden relative group'>
                    <Link to={`/product-view/${item.id}`} state={{ product: item }} className="absolute inset-0 z-0"></Link>
                    
                    <div className='aspect-[4/3] overflow-hidden bg-gray-50 relative z-10'>
                       {item.offer && (
                          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            -{item.offer.replace(/[^0-9]/g, '')}%
                          </div>
                        )}
                      <ImageLoader className='transition-transform duration-500 group-hover:scale-110' src={item.image_url || item.image || (item.gallery && item.gallery[0])} alt={item.title} />
                    </div>

                  <div className="p-4 flex flex-col flex-1 relative z-20 pointer-events-none">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors leading-snug">{item.title}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <div className="text-xl font-semibold text-gray-900 leading-none">₹{item.offerPrice || item.price}</div>
                        {item.oldPrice && (
                          <div className="text-xs text-gray-400 line-through">₹{item.oldPrice}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center pointer-events-auto">
                       <div className="flex gap-3">
                          <button onClick={() => toggleLike(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            {likes[item.id] ? <BiSolidLike className="text-red-500 text-lg" /> : <BiLike className="text-lg" />}
                          </button>
                          <button onClick={() => toggleCart(item.id)} className={`transition-colors ${carts[item.id] ? 'text-orange-600' : 'text-gray-400 hover:text-orange-500'}`}>
                            {carts[item.id] ? <BiSolidCart className="text-xl" /> : <BiCart className="text-xl" />}
                          </button>
                        </div>
                        <Link
                          to={`/product-view/${item.id}`}
                          state={{ product: item }}
                          className="bg-black text-white text-[10px] font-semibold py-1.5 px-4 rounded hover:bg-gray-800 transition-colors uppercase tracking-wider"
                        >
                          Buy
                        </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        )}
      </div>
    </section>
  );
}

export default RelatedProduct;
