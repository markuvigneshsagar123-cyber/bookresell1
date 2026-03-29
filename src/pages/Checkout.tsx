import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { MessageSquare, ShieldCheck, CheckCircle, ArrowLeft, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) return;

    setIsProcessing(true);
    try {
      // Create requests for each book
      for (const item of items) {
        const order = await api.createOrder({
          buyerId: user.id,
          buyerName: user.displayName || 'Anonymous Buyer',
          bookId: item.id,
          bookTitle: item.title || 'Unknown Book',
          sellerId: item.sellerId,
          amount: item.price
        });

        // Send initial message if provided
        if (message.trim()) {
          await api.sendMessage({
            orderId: order.id,
            senderId: user.id,
            text: message.trim()
          });
        }
      }

      setIsSuccess(true);
      clearCart();
      toast.success('Purchase requests sent successfully!');
    } catch (error) {
      console.error("Error sending request", error);
      toast.error('Failed to send request. Please try again.');
    }
    setIsProcessing(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 text-center border border-gray-100"
        >
          <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Requests Sent!</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">Your purchase requests have been sent to the sellers. You can track them and chat with sellers in your dashboard.</p>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full text-gray-500 font-bold hover:text-indigo-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-indigo-600" />
              Purchase Request
            </h2>
            
            <div className="bg-indigo-50 p-6 rounded-2xl mb-10 border border-indigo-100">
              <div className="flex items-center gap-3 text-indigo-700 font-bold mb-2">
                <ShieldCheck className="w-5 h-5" />
                Seller Approval Required
              </div>
              <p className="text-indigo-600 text-sm">Your request will be sent to the seller. Once they approve, the book will be marked as sold to you. You can chat with them to coordinate delivery.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Message to Seller (Optional)</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'm interested in this book. Can we meet at..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Summary</h2>
            
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate max-w-[150px]">{item.title}</span>
                  <span className="font-bold">₹{item.price}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-black text-indigo-600">₹{total}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
