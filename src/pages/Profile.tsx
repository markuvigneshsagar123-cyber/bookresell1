import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, User, Book } from '../api';
import { MapPin, Calendar, Book as BookIcon, User as UserIcon, Mail } from 'lucide-react';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const userData = await api.getUser(id);
        setProfile(userData);
        
        // If they are a seller, fetch their books
        const userBooks = await api.getBooks({ sellerId: id });
        setBooks(userBooks);
      } catch (err) {
        setError('User not found or error loading profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Profile not found'}</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8"
      >
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end space-x-6">
              <div className="h-24 w-24 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-indigo-400" />
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                <p className="text-gray-500 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">
                  {profile.bio || "This user hasn't added a bio yet."}
                </p>
              </div>

              {books.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Listings ({books.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {books.map((book) => (
                      <Link 
                        key={book.id} 
                        to={`/book/${book.id}`}
                        className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                      >
                        <div className="h-16 w-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                          <img 
                            src={book.imageUrl} 
                            alt={book.title} 
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <p className="font-medium text-gray-900 truncate">{book.title}</p>
                          <p className="text-sm text-gray-500 truncate">{book.author}</p>
                          <p className="text-sm font-semibold text-indigo-600 mt-0.5">₹{book.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">Details</h3>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{profile.location || 'Location not specified'}</span>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <span>Joined {new Date(profile.createdAt as any).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="capitalize">{profile.role} Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
