import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { ArrowLeft, Send, Loader2, CheckCircle, XCircle, MessageSquare, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      try {
        const orderData = await api.getOrder(id);
        setOrder(orderData);
        const msgs = await api.getMessages(id);
        setMessages(msgs);
      } catch (error) {
        console.error("Error fetching order details", error);
        toast.error('Failed to load request details');
      }
      setLoading(false);
    };

    fetchData();

    // Initialize socket
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('join_room', id);
    });

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !id) return;

    setSending(true);
    try {
      await api.sendMessage({
        orderId: id,
        senderId: user.id,
        text: newMessage.trim()
      });
      setNewMessage('');
      const msgs = await api.getMessages(id);
      setMessages(msgs);
    } catch (error) {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      await api.updateOrderStatus(id, status);
      const orderData = await api.getOrder(id);
      setOrder(orderData);
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error('Failed to update status');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Request not found</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 font-bold hover:underline">Back to Dashboard</button>
      </div>
    );
  }

  const isSeller = user?.id === order.sellerId;
  const isBuyer = user?.id === order.buyerId;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Status</p>
                  <p className={`font-bold ${order.status === 'Approved' ? 'text-green-600' : order.status === 'Denied' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {order.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Book</p>
                  <p className="font-bold text-gray-900">{order.bookTitle}</p>
                </div>
              </div>
              <Link to={`/profile/${isSeller ? order.buyerId : order.sellerId}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{isSeller ? 'Buyer' : 'Seller'}</p>
                  <p className="font-bold text-gray-900">{isSeller ? order.buyerName : (order.sellerName || 'Seller')}</p>
                </div>
              </Link>
              <div className="pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Amount</p>
                <p className="text-2xl font-black text-indigo-600">₹{order.amount}</p>
              </div>
            </div>

            {order.status === 'Requested' && (
              <div className="mt-8 space-y-3">
                {isSeller ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus('Approved')}
                      disabled={updating}
                      className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Request
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('Denied')}
                      disabled={updating}
                      className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      Deny Request
                    </button>
                  </>
                ) : isBuyer ? (
                  <button 
                    onClick={() => handleUpdateStatus('Cancelled')}
                    disabled={updating}
                    className="w-full bg-gray-50 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Request
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col h-[600px] bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-3">
            <Link to={`/profile/${isSeller ? order.buyerId : order.sellerId}`} className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold hover:bg-indigo-700 transition-colors">
              {isSeller ? (order.buyerName?.[0] || 'B') : (order.sellerName?.[0] || 'S')}
            </Link>
            <div>
              <Link to={`/profile/${isSeller ? order.buyerId : order.sellerId}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors block">
                Chat with {isSeller ? order.buyerName : (order.sellerName || 'Seller')}
              </Link>
              <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length > 0 ? messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.senderId === user?.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 opacity-60 ${msg.senderId === user?.id ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-50 flex gap-3">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
