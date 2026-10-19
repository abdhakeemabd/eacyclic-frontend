import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, RotateCcw, ArrowUp, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { Link } from 'react-router-dom';
import ImageLoader from './image-loader';

export default function AskCyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedIds, setAddedIds] = useState({});
  const { addToCart } = useCart();
  const { products = [] } = useProducts();
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { id: '1', number: '01', text: 'Show items under ₹500' },
    { id: '2', number: '02', text: 'Recommend top home products' },
    { id: '3', number: '03', text: 'Delivery & returns info' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleSend = (userText) => {
    const text = (userText || inputValue).trim();
    if (!text) return;

    // Append user message
    const newMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      let matchedProducts = [];

      const query = text.toLowerCase();

      // 1. Budget Filter (e.g. Under 500)
      if (query.includes('500') || query.includes('under') || query.includes('cheap') || query.includes('budget')) {
        matchedProducts = products
          .filter((p) => {
            const price = parseFloat(p.offerPrice || p.price || 0);
            return price > 0 && price <= 500;
          })
          .slice(0, 4);

        if (matchedProducts.length > 0) {
          botResponse = `Here are our best genuine finds under ₹500 from the store:`;
        } else {
          botResponse = `Here are our most affordable selections from the collection:`;
          matchedProducts = [...products]
            .sort((a, b) => (a.offerPrice || a.price || 0) - (b.offerPrice || b.price || 0))
            .slice(0, 3);
        }
      } 
      // 2. Shipping & Returns Information
      else if (query.includes('delivery') || query.includes('return') || query.includes('shipping') || query.includes('kerala')) {
        botResponse = `We offer 100% Free Delivery across Kerala & India! All products are carefully handled and delivered directly to your doorstep. You also get a 7-day hassle-free return guarantee.`;
      } 
      // 3. Search Real Store Catalog
      else {
        const keywords = query.split(/\s+/).filter(w => w.length > 2);
        
        matchedProducts = products.filter((p) => {
          const title = (p.name || p.title || '').toLowerCase();
          const category = (p.category || '').toLowerCase();
          const desc = (p.description || p.content || '').toLowerCase();

          return keywords.some(k => title.includes(k) || category.includes(k) || desc.includes(k));
        }).slice(0, 4);

        if (matchedProducts.length > 0) {
          botResponse = `Here is what I found in our catalog for "${text}":`;
        } else {
          // If no specific keyword match, suggest top store products
          matchedProducts = products.slice(0, 3);
          botResponse = `I couldn't find an exact match for "${text}", but you might love these popular picks from our store:`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse,
          products: matchedProducts
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleReset = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 bg-[#121c18] hover:bg-[#1c2c26] text-white px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/10"
          aria-label="Ask Musthu shopping assistant"
        >
          <div className="w-5 h-5 rounded-full bg-[#134e35] flex items-center justify-center text-[10px] font-bold">
            M
          </div>
          <span className="font-semibold text-xs tracking-wide">Ask Musthu</span>
          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Chat Companion Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[390px] h-[550px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50 animate-fadeIn font-sans">
          
          {/* Header */}
          <div className="bg-[#121c18] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#134e35] flex items-center justify-center text-xs font-bold text-white border border-white/20">
                M
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-bold text-sm">Musthu</span>
                  <span className="text-gray-400 text-xs">/ eacyclic</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Your personal shopping assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Restart conversation"
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                aria-label="Reset chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fafbfa]">
            {/* Initial Musthu Greeting */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                    A LITTLE HELP, A GOOD FIND.
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 leading-snug">
                    Hello, I'm Musthu. <br />What's on your list today?
                  </h3>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="space-y-2 pt-1">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleSend(prompt.text)}
                      className="w-full bg-white hover:bg-[#f0f4f1] border border-gray-200/90 rounded-xl p-3 flex items-center justify-between text-left transition-all duration-200 group shadow-2xs hover:border-[#134e35]/30 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 group-hover:text-[#134e35]">
                          {prompt.number}
                        </span>
                        <span className="text-xs font-semibold text-gray-800 group-hover:text-gray-900">
                          {prompt.text}
                        </span>
                      </div>
                      <span className="text-gray-400 group-hover:text-[#134e35] text-xs">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#134e35] text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200/80 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render Real Store Products */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    {msg.products.map((p) => {
                      const image = p.image_url || p.image || (p.gallery && p.gallery[0]);
                      const title = p.name || p.title || 'Product';
                      const price = p.offerPrice || p.price || 0;
                      const isAdded = addedIds[p.id];

                      return (
                        <div
                          key={p.id}
                          className="bg-white border border-gray-200/90 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-2xs hover:border-gray-300 transition-colors"
                        >
                          <Link
                            to={`/product-view/${p.id}`}
                            state={{ product: p }}
                            onClick={() => setIsOpen(false)}
                            className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center border border-gray-100"
                          >
                            <ImageLoader
                              src={image}
                              alt={title}
                              className="w-full h-full object-contain"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold truncate">
                              {p.category || 'Store'}
                            </p>
                            <Link
                              to={`/product-view/${p.id}`}
                              state={{ product: p }}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-bold text-gray-900 truncate block hover:text-[#134e35]"
                            >
                              {title}
                            </Link>
                            <span className="text-xs font-bold text-[#134e35]">
                              ₹{price}
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(p)}
                            className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-700 text-white'
                                : 'bg-[#134e35] hover:bg-[#0e3a27] text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 px-3 py-2 rounded-2xl w-fit">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Musthu about products, delivery, prices..."
                className="w-full bg-[#f4f6f4] border border-gray-200 rounded-xl pl-4 pr-11 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#134e35] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 p-1.5 rounded-lg bg-[#134e35] text-white disabled:opacity-40 disabled:hover:bg-[#134e35] hover:bg-[#0e3a27] transition-all cursor-pointer"
                aria-label="Send query"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Musthu searches actual Eacyclic products. Delivered across Kerala & India.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
