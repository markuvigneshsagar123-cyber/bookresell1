import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { ShoppingBag, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart: React.FC = () => {
  const { items, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-12">Your Shopping Cart</h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-6 items-center"
                >
                  <div className="w-24 h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl || 'https://picsum.photos/seed/book/200'} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">Seller ID: {item.sellerId.slice(0, 8)}...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-indigo-600">₹{item.price}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-black text-indigo-600">₹{total}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <ArrowRight className="w-6 h-6" />
              </button>

              <Link to="/browse" className="block text-center mt-6 text-gray-500 font-bold hover:text-indigo-600 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-10 max-w-md mx-auto">Looks like you haven't added any books to your cart yet. Start exploring our collection!</p>
          <Link to="/browse" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Browse Books <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
