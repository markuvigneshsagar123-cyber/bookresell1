import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { CATEGORIES, CONDITIONS } from '../constants';
import { Search, Filter, SlidersHorizontal, BookOpen } from 'lucide-react';

const Browse: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    condition: 'All',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params: any = {
          q: searchParams.get('q') || '',
          category: filters.category,
          condition: filters.condition,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice
        };
        const results = await api.getBooks(params);
        setBooks(results);
      } catch (error) {
        console.error("Error fetching books", error);
      }
      setLoading(false);
    };

    fetchBooks();
  }, [searchParams, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold">Filters</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['All', ...CATEGORIES].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Condition</label>
                <select 
                  value={filters.condition}
                  onChange={(e) => setFilters({...filters, condition: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {['All', ...CONDITIONS].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button 
                onClick={() => setFilters({ category: 'All', condition: 'All', minPrice: '', maxPrice: '' })}
                className="w-full text-indigo-600 font-bold text-sm hover:underline"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {searchParams.get('q') ? `Search results for "${searchParams.get('q')}"` : 'Browse All Books'}
            </h1>
            <p className="text-gray-500 font-medium">{books.length} books found</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 aspect-[3/4] rounded-3xl"></div>
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map(book => (
                <Link key={book.id} to={`/book/${book.id}`} className="group">
                  <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                      <img 
                        src={book.imageUrl || 'https://picsum.photos/seed/book/400/600'} 
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold text-indigo-600 shadow-sm">
                        {book.condition}
                      </div>
                      {(book.status === 'Sold Out' || (book.quantity || 0) <= 0) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl transform -rotate-12">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-xl text-gray-900 line-clamp-1 mb-1">{book.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{book.author}</p>
                      <div className="mt-auto flex justify-between items-center">
                        <span className="text-2xl font-extrabold text-indigo-600">₹{book.price}</span>
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                          {book.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Browse;
