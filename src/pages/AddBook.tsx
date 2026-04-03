import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { CATEGORIES, CONDITIONS } from '../constants';
import { BookOpen, Upload, ArrowLeft, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AddBook: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    publisherName: '',
    price: '',
    category: 'Fiction',
    condition: 'Good',
    description: '',
    quantity: '1',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!imageFile) {
      toast.error('Please upload a book cover image');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('publisherName', formData.publisherName);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('description', formData.description);
      data.append('quantity', formData.quantity);
      data.append('image', imageFile);
      data.append('sellerId', user.id);
      data.append('sellerName', user.displayName || 'Anonymous');

      await api.addBook(data);
      toast.success('Book listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Error adding book", error);
      toast.error('Failed to list book. Please try again.');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-white">
          <h1 className="text-3xl font-extrabold mb-2">List a Book for Sale</h1>
          <p className="text-indigo-100">Fill in the details below to reach thousands of potential buyers.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Book Title</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. The Great Gatsby"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Publisher Name</label>
                <input
                  required
                  type="text"
                  name="publisherName"
                  value={formData.publisherName}
                  onChange={handleChange}
                  placeholder="e.g. Penguin Books"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Price (₹)</label>
                  <input
                    required
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="299"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Quantity</label>
                  <input
                    required
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="1"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  >
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Book Cover Image</label>
                <div 
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                  className={`relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-indigo-500' : 'border-gray-200 hover:border-indigo-400 cursor-pointer bg-gray-50'}`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-2xl shadow-sm mb-3">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-sm font-bold text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell buyers more about the book's content and condition..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Publish Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
