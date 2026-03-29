import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { ShoppingCart, ArrowLeft, User, Calendar, Tag, Info, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<any>(null);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const bookData = await api.getBook(id);
        setBook(bookData);

        // Fetch similar books
        const similar = await api.getBooks({ 
          category: bookData.category,
          limit: 5 
        });
        setSimilarBooks(similar.filter((b: any) => b.id !== id).slice(0, 4));
      } catch (error) {
        console.error("Error fetching book details", error);
      }
      setLoading(false);
    };

    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } });
      return;
    }
    addToCart({
      id: book.id,
      title: book.title,
      price: book.price,
      imageUrl: book.imageUrl,
      sellerId: book.sellerId
    });
    toast.success('Added to cart!');
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-32 text-center">Loading...</div>;
  if (!book) return <div className="max-w-7xl mx-auto px-4 py-32 text-center">Book not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Image Section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 aspect-[3/4]">
          <img 
            src={book.imageUrl || 'https://picsum.photos/seed/book/800/1200'} 
            alt={book.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          <div>
            <div className="flex gap-2 mb-4">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{book.category}</span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{book.condition}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-2xl text-gray-500 font-medium">by {book.author}</p>
          </div>

          <div className="text-5xl font-black text-indigo-600">₹{book.price}</div>

          <div className="grid grid-cols-2 gap-6 py-8 border-y border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-3 rounded-xl">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Seller</p>
                <p className="font-bold text-gray-800">{book.sellerName || 'Verified Seller'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-3 rounded-xl">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Quantity</p>
                <p className="font-bold text-gray-800">{book.quantity || 1} available</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {book.description || "No description provided for this book. Please contact the seller for more details."}
            </p>
          </div>

          <div className="pt-8">
            <button
              onClick={() => {
                handleAddToCart();
                navigate('/checkout');
              }}
              disabled={book.status !== 'Available' || (book.quantity || 0) <= 0}
              className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none"
            >
              <ShoppingCart className="w-6 h-6" />
              {book.status === 'Available' && (book.quantity || 1) > 0 ? 'Request to Buy' : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Similar Books */}
      {similarBooks.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-8">Similar Books in {book.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarBooks.map(b => (
              <Link key={b.id} to={`/book/${b.id}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-lg transition-all">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                    <img src={b.imageUrl || 'https://picsum.photos/seed/book/400/600'} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate mb-1">{b.title}</h3>
                    <p className="text-lg font-bold text-indigo-600">₹{b.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookDetails;
