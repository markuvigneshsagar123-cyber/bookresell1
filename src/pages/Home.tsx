import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ArrowRight, Book, Shield, Truck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      try {
        const books = await api.getBooks({ limit: 4 });
        setRecentBooks(books);
      } catch (error) {
        console.error("Error fetching recent books", error);
      }
      setLoading(false);
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
            >
              Give Your Books a <span className="text-indigo-400">Second Life</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-indigo-100 mb-10"
            >
              The easiest way to buy and sell second-hand books. Join our community of readers and save money while saving the planet.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/browse" className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                Browse Books <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/add-book" className="bg-indigo-700 text-white border border-indigo-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition-colors">
                Start Selling
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Recently Added</h2>
            <p className="text-gray-600">Check out the latest books from our community.</p>
          </div>
          <Link to="/browse" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 aspect-[3/4] rounded-2xl"></div>
            ))
          ) : recentBooks.length > 0 ? (
            recentBooks.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-lg transition-all">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <img 
                      src={book.imageUrl || 'https://picsum.photos/seed/book/400/600'} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-indigo-600">
                      {book.condition}
                    </div>
                    {(book.status === 'Sold Out' || (book.quantity || 0) <= 0) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-xl transform -rotate-12">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-indigo-600">₹{book.price}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{book.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No books listed yet.</p>
              <Link to="/add-book" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">Be the first to list a book!</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to declutter your shelf?</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are making reading more affordable and sustainable.
          </p>
          <Link to="/add-book" className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors">
            List a Book Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
