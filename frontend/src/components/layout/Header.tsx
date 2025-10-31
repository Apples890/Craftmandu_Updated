import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/utils/api.client';



const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const { count: wishlistCount } = useWishlist();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; slug: string; image?: string }>>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const timerRef = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };
  const roleLower = useMemo(() => (user?.role ? String(user.role).toLowerCase() : undefined), [user]);
  const displayName = useMemo(() => (user?.full_name || user?.username || user?.email || 'User'), [user]);


  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
        setShowFilters(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Load categories for dropdowns
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/products/categories');
        const list = (res.data?.items || []).map((c: any) => ({ name: c.name as string, slug: c.slug as string }));
        if (mounted) setCategories(list);
      } catch {
        if (mounted) setCategories([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!search.trim()) { setSuggestions([]); setShowSuggest(false); return; }
    timerRef.current = window.setTimeout(async () => {
      try {
        const { data } = await api.get('/api/products', { params: { search, limit: 8 } });
        const items = (data?.items || []).map((it: any) => ({ name: it.name as string, slug: it.slug as string, image: it.image_url as string | undefined }));
        setSuggestions(items);
        setShowSuggest(true);
      } catch {
        setSuggestions([]); setShowSuggest(false);
      }
    }, 250) as any;
  }, [search]);

  function submitSearch(q?: string) {
    const v = (q ?? search).trim();
    if (!v) return;
    setShowSuggest(false);
    const params = new URLSearchParams();
    params.set('search', v);
    if (selectedCategory) params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', String(Number(minPrice)));
    if (maxPrice) params.set('maxPrice', String(Number(maxPrice)));
    navigate(`/browse?${params.toString()}`);
  }

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
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 max-h-80 overflow-y-auto">
                {categories.map((c) => (
                  <Link key={c.slug} to={`/browse?category=${encodeURIComponent(c.slug)}`} className="block px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8" ref={boxRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search handicrafts..."
                onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => { setShowFilters((v) => !v); setShowSuggest(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-600"
                title="Filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              {showFilters && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border rounded-md px-2 py-2 text-sm"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Price Range (Nrs)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="border rounded-md px-2 py-2 text-sm"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="border rounded-md px-2 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <button
                      className="text-sm text-gray-600 hover:text-gray-800"
                      onClick={() => { setSelectedCategory(''); setMinPrice(''); setMaxPrice(''); }}
                    >
                      Clear
                    </button>
                    <div className="space-x-2">
                      <button
                        className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        onClick={() => setShowFilters(false)}
                      >
                        Close
                      </button>
                      <button
                        className="text-sm px-3 py-1 rounded bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700"
                        onClick={() => { setShowFilters(false); submitSearch(); }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  {suggestions.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => { setShowSuggest(false); navigate(`/product/${s.slug}`); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-orange-50 text-left"
                    >
                      {s.image ? (<img src={s.image} alt={s.name} className="h-8 w-8 rounded object-cover border" />) : (<div className="h-8 w-8 rounded bg-gray-100 border" />)}
                      <span className="text-sm text-gray-800">{s.name}</span>
                    </button>
                  ))}
                  <div className="border-t">
                    <button onClick={() => submitSearch()} className="w-full text-sm px-3 py-2 text-red-600 hover:bg-red-50">Search for "{search}"</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link to="/dashboard?tab=wishlist" className="relative p-2 text-gray-600 hover:text-red-600 transition-colors duration-300 hover:scale-110 transform">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

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
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to={'/profile'}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
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
                    {roleLower === 'vendor' && (
                      <Link
                        to="/vendor"
                        className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-red-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Vendor Dashboard
                      </Link>
                    )}
                    {roleLower === 'admin' && (
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
                  onKeyDown={(e) => { const v = (e.target as HTMLInputElement).value.trim(); if (e.key === 'Enter') { setIsMenuOpen(false); navigate(`/browse?search=${encodeURIComponent(v)}`); } }}
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
                <div className="pl-4 space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((c) => (
                    <Link key={c.slug} to={`/browse?category=${encodeURIComponent(c.slug)}`} className="block text-gray-600 hover:text-red-600 py-1 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                      {c.name}
                    </Link>
                  ))}
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



