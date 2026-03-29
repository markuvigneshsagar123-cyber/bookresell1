import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { Book, ShoppingBag, Settings, User as UserIcon, Package, Clock, CheckCircle, XCircle, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user, isAdmin, updateUser } = useAuth();
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'sent' | 'received' | 'profile'>('listings');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    photoURL: user?.photoURL || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName,
        bio: user.bio || '',
        location: user.location || '',
        photoURL: user.photoURL || ''
      });
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch my listings
      const books = await api.getBooks({ sellerId: user.id });
      setMyBooks(books);

      // Fetch requests sent by me
      const sent = await api.getOrders({ buyerId: user.id });
      setSentRequests(sent);

      // Fetch requests received by me
      const received = await api.getOrders({ sellerId: user.id });
      setReceivedRequests(received);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const seedSampleData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const sampleBooks = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          price: 299,
          condition: "Like New",
          category: "Fiction",
          description: "A classic novel set in the Roaring Twenties.",
          imageUrl: "https://picsum.photos/seed/gatsby/400/600",
          sellerId: user.id,
          sellerName: user.displayName,
          status: "Available",
          quantity: 5
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          price: 450,
          condition: "New",
          category: "Self-Help",
          description: "An easy and proven way to build good habits and break bad ones.",
          imageUrl: "https://picsum.photos/seed/habits/400/600",
          sellerId: user.id,
          sellerName: user.displayName,
          status: "Available",
          quantity: 3
        },
        {
          title: "A Brief History of Time",
          author: "Stephen Hawking",
          price: 350,
          condition: "Good",
          category: "Non-Fiction",
          description: "A landmark volume in science writing by one of the great minds of our time.",
          imageUrl: "https://picsum.photos/seed/hawking/400/600",
          sellerId: user.id,
          sellerName: user.displayName,
          status: "Available",
          quantity: 2
        }
      ];

      for (const book of sampleBooks) {
        const formData = new FormData();
        Object.entries(book).forEach(([key, value]) => formData.append(key, String(value)));
        await api.addBook(formData);
      }
      toast.success('Sample books added successfully!');
      await fetchData();
    } catch (error) {
      console.error("Error seeding data", error);
      toast.error('Failed to seed sample data');
    }
    setSeeding(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const updated = await api.updateProfile({ id: user.id, ...profileData });
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setSavingProfile(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-indigo-50">
              <img src={user.photoURL || 'https://picsum.photos/seed/user/200'} alt={user.displayName || ''} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.displayName}</h2>
            <p className="text-gray-500 text-sm mb-6">{user.email}</p>
            <div className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              {user.role || 'User'}
            </div>
            <Link 
              to={`/profile/${user.id}`}
              className="block text-indigo-600 text-sm font-bold hover:underline"
            >
              View Public Profile
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveTab('listings')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left font-bold transition-colors ${activeTab === 'listings' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Book className="w-5 h-5" />
              My Listings ({myBooks.length})
            </button>
            <button 
              onClick={() => setActiveTab('sent')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left font-bold transition-colors ${activeTab === 'sent' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              My Requests ({sentRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('received')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left font-bold transition-colors ${activeTab === 'received' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Package className="w-5 h-5" />
              Requests Received ({receivedRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left font-bold transition-colors ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings className="w-5 h-5" />
              Profile Settings
            </button>
          </div>

          {isAdmin && (
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Admin Tools
              </h3>
              <button 
                onClick={seedSampleData}
                disabled={seeding}
                className="w-full bg-white text-indigo-600 border-2 border-indigo-200 py-3 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Seed Sample Books'}
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {activeTab === 'listings' ? 'My Listings' : activeTab === 'sent' ? 'My Requests' : activeTab === 'received' ? 'Requests Received' : 'Profile Settings'}
            </h1>
            {activeTab === 'listings' && (
              <Link to="/add-book" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                Add New Book
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'listings' ? (
                myBooks.length > 0 ? myBooks.map(book => (
                  <div key={book.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-6 items-center">
                    <div className="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={book.imageUrl || 'https://picsum.photos/seed/book/200'} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${book.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                          {book.status}
                        </span>
                      </div>
                      <p className="text-gray-500 mb-4">{book.author} • {book.category} • {book.quantity || 1} in stock</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-indigo-600">₹{book.price}</span>
                        <div className="flex gap-2">
                          <button className="text-indigo-600 font-bold hover:underline">Edit</button>
                          <button className="text-red-600 font-bold hover:underline">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-500 mb-8">Start selling your old books today!</p>
                    <Link to="/add-book" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                      List Your First Book
                    </Link>
                  </div>
                )
              ) : activeTab === 'sent' ? (
                sentRequests.length > 0 ? sentRequests.map(order => (
                  <Link key={order.id} to={`/order/${order.id}`} className="block group">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <ShoppingBag className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Request #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${order.status === 'Approved' ? 'text-green-600' : order.status === 'Denied' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-900">{order.bookTitle}</h4>
                          <p className="text-sm text-gray-500">Click to chat with seller</p>
                        </div>
                        <span className="text-xl font-bold text-gray-900">₹{order.amount}</span>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-gray-500 mb-8">Browse our collection and find your next read!</p>
                    <Link to="/browse" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                )
              ) : activeTab === 'profile' ? (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                        <input 
                          type="text"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                        <input 
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          placeholder="e.g. Mumbai, India"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                      <textarea 
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell others about yourself..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Profile Photo URL</label>
                      <input 
                        type="url"
                        value={profileData.photoURL}
                        onChange={(e) => setProfileData({...profileData, photoURL: e.target.value})}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={savingProfile}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              ) : (
                receivedRequests.length > 0 ? receivedRequests.map(order => (
                  <Link key={order.id} to={`/order/${order.id}`} className="block group">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <UserIcon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">From: {order.buyerName}</p>
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${order.status === 'Approved' ? 'text-green-600' : order.status === 'Denied' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-900">{order.bookTitle}</h4>
                          <p className="text-sm text-gray-500">Click to view request and chat</p>
                        </div>
                        <span className="text-xl font-bold text-gray-900">₹{order.amount}</span>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No requests received</h3>
                    <p className="text-gray-500">Your listed books will appear here when someone is interested.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
