import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { BookOpen, ShoppingCart, User, LogOut, PlusCircle, Search, MessageSquare } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <BookOpen className="w-8 h-8" />
            <span className="hidden sm:inline">BookResell</span>
          </Link>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/browse?q=${(e.target as HTMLInputElement).value}`);
                  }
                }}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/browse" className="text-gray-600 hover:text-indigo-600 font-medium">Browse</Link>
            
            {user ? (
              <>
                <Link to="/add-book" className="hidden sm:flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                  <PlusCircle className="w-5 h-5" />
                  <span>Sell</span>
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600" title="Dashboard">
                  <User className="w-6 h-6" />
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600" title="Requests">
                  <MessageSquare className="w-6 h-6" />
                </Link>
                <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600" title="Cart">
                  <ShoppingCart className="w-6 h-6" />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600" title="Logout">
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
