import React, { useState } from 'react';
import Slider from "react-slick";
import { PiShareFat } from "react-icons/pi";
import { BiSolidLike, BiLike, BiCart, BiSolidCart } from "react-icons/bi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ImageLoader from './image-loader';
import ProductSkeleton from './product-skeleton';

function HomeFeatures() {
  const { products, loading } = useProducts();
  const [likes, setLikes] = useState({});
  const [carts, setCarts] = useState({});

  // Show a subset of products as "Best Products"
  const featureProducts = products.slice(0, 10);

  const toggleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleCart = (id) => {
    setCarts(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const settings = {
    dots: false,
    infinite: false,
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
    <section className='home_feature_sec py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden'>
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Best Eacyclic Selection</h2>
          <div className="w-20 h-1.5 bg-black mx-auto mt-4 rounded-full"></div>
          <p className="text-gray-500 mt-4 font-medium">Handpicked premium products just for you on Eacyclic</p>
        </div>
        
        {loading && featureProducts.length === 0 ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="features_slider -mx-3">
            <Slider {...settings}>
              {featureProducts.map(item => (
                <div className='px-3 pb-10' key={item.id}>
                  <div className='bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden relative group border border-transparent hover:border-gray-100'>
                    <Link to={`/product-view/${item.id}`} state={{ product: item }} aria-label={`View details for ${item.title}`} className="absolute inset-0 z-0"></Link>
                    
                    <div className='aspect-[4/3] overflow-hidden bg-gray-50 relative z-10'>
                       {item.offer && (
                          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase">
                            -{item.offer.replace(/[^0-9]/g, '')}%
                          </div>
                        )}
                      <ImageLoader className='transition-transform duration-700 group-hover:scale-110' src={item.image_url || item.image || (item.gallery && item.gallery[0])} alt={item.title} />
                    </div>

                  <div className="p-5 flex flex-col flex-1 relative z-20 pointer-events-none">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors leading-snug">{item.title}</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <div className="text-xl font-semibold text-gray-900 leading-none">₹{item.offerPrice || item.price}</div>
                        {item.oldPrice && (
                          <div className="text-xs text-gray-500 line-through">₹{item.oldPrice}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center pointer-events-auto">
                        <div className="flex gap-4">
                          <button aria-label="Like product" onClick={() => toggleLike(item.id)} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                            {likes[item.id] ? <BiSolidLike className="text-red-500 text-xl" /> : <BiLike className="text-xl" />}
                          </button>
                          <button aria-label="Add to cart" onClick={() => toggleCart(item.id)} className={`transition-colors p-2 ${carts[item.id] ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}>
                            {carts[item.id] ? <BiSolidCart className="text-2xl" /> : <BiCart className="text-2xl" />}
                          </button>
                        </div>
                        <Link
                          to={`/product-view/${item.id}`}
                          state={{ product: item }}
                          className="bg-black text-white text-xs font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-800 transition-all transform group-hover:translate-x-1 uppercase tracking-wider"
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

export default HomeFeatures;
