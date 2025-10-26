import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { User as SupabaseUser } from '@supabase/supabase-js';



const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [FullUser, getUserProfile] = useState<SupabaseUser | null>(null);
  const { user, session, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };
  console.log('Header rendered with user:', user?.full_name);
  console.log('Header rendered with user:', session?.user?.email);
  console.log('Session from getSession:', session);
  console.log('User after recovery:', user);


  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Craftsmandu
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 hover:scale-105 transform"
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 hover:scale-105 transform"
            >
              Browse
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 flex items-center">
                Categories
                <svg className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <Link to="/browse?category=textiles" className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200">Textiles</Link>
                <Link to="/browse?category=woodwork" className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200">Woodwork</Link>
                <Link to="/browse?category=metalwork" className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200">Metalwork</Link>
                <Link to="/browse?category=ceramics" className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200">Ceramics</Link>
                <Link to="/browse?category=jewelry" className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200">Jewelry</Link>
                <Link to="/browse?category=art" className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200 rounded-b-lg">Art</Link>
              </div>
            </div>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search handicrafts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <button className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-300 hover:scale-110 transform">
              <Heart className="w-6 h-6" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-red-600 transition-colors duration-300 hover:scale-110 transform"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user.username}</p>
                      <p className="text-xs text-gray-500">{FullUser?.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Order History
                    </Link>
                    <Link
                      to="/messages"
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Messages
                    </Link>
                    {user.role === 'vendor' && (
                      <Link
                        to="/vendor"
                        className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Vendor Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-red-600 font-medium transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full font-medium hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search handicrafts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <Link
                to="/"
                className="text-gray-700 hover:text-red-600 font-medium py-2 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className="text-gray-700 hover:text-red-600 font-medium py-2 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-500 text-sm font-medium mb-2">Categories</p>
                <div className="pl-4 space-y-2">
                  <Link to="/browse?category=textiles" className="block text-gray-600 hover:text-red-600 py-1 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Textiles</Link>
                  <Link to="/browse?category=woodwork" className="block text-gray-600 hover:text-red-600 py-1 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Woodwork</Link>
                  <Link to="/browse?category=metalwork" className="block text-gray-600 hover:text-red-600 py-1 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Metalwork</Link>
                  <Link to="/browse?category=ceramics" className="block text-gray-600 hover:text-red-600 py-1 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Ceramics</Link>
                  <Link to="/browse?category=jewelry" className="block text-gray-600 hover:text-red-600 py-1 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Jewelry</Link>
                  <Link to="/browse?category=art" className="block text-gray-600 hover:text-red-600 py-1 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Art</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;