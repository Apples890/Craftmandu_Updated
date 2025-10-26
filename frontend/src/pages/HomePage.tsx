import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Heart, ShoppingCart, Truck, Shield, Award, Users } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  vendor: string;
  category: string;
}

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Handwoven Pashmina Shawl',
      price: 4500,
      image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      vendor: 'Himalayan Crafts',
      category: 'Textiles'
    },
    {
      id: '2',
      name: 'Traditional Khukuri Knife',
      price: 3200,
      image: 'https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      vendor: 'Mountain Forge',
      category: 'Metalwork'
    },
    {
      id: '3',
      name: 'Carved Wooden Buddha',
      price: 2800,
      image: 'https://images.pexels.com/photos/8111357/pexels-photo-8111357.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      vendor: 'Sacred Arts',
      category: 'Woodwork'
    },
    {
      id: '4',
      name: 'Nepali Tea Set',
      price: 1800,
      image: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      vendor: 'Tea Masters',
      category: 'Ceramics'
    }
  ];

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeaturedProducts(mockProducts);
        setError(null);
      } catch (err) {
        console.error('Failed to load featured products:', err);
        setError('Failed to load featured products');
        // Use mock data as fallback
        setFeaturedProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Textiles', icon: '🧵', count: 245 },
    { name: 'Woodwork', icon: '🪵', count: 189 },
    { name: 'Metalwork', icon: '⚒️', count: 156 },
    { name: 'Ceramics', icon: '🏺', count: 134 },
    { name: 'Jewelry', icon: '💎', count: 298 },
    { name: 'Art', icon: '🎨', count: 167 }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white py-20 px-4">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
            Craftsmandu
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-orange-100">
            Discover Authentic Nepali Handicrafts & Support Local Artisans
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for handicrafts..."
                className="w-full pl-10 pr-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-lg"
              />
            </div>
            <Link
              to="/browse"
              className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Browse All
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-200">500+</div>
              <div className="text-orange-200">Artisans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-200">1200+</div>
              <div className="text-orange-200">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-200">50+</div>
              <div className="text-orange-200">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-200">98%</div>
              <div className="text-orange-200">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/browse?category=${category.name.toLowerCase()}`}
                className="group bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg">Handpicked treasures from our finest artisans</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <p className="text-gray-600">Showing sample products instead</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/browse"
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Why Choose Craftsmandu?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-100 to-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Authentic Crafts</h3>
              <p className="text-gray-600">100% genuine handmade products from skilled Nepali artisans</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-100 to-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Support Artisans</h3>
              <p className="text-gray-600">Direct support to local craftspeople and their families</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-100 to-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600">Quick and secure shipping across Nepal and worldwide</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-red-100 to-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Quality Guarantee</h3>
              <p className="text-gray-600">30-day return policy and quality assurance on all products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="text-xl mb-8 text-orange-100">
            Get updates on new products, artisan stories, and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-4 focus:ring-orange-300"
            />
            <button className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;