import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  MessageCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { productService, Product } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useWishlist } from '@/context/WishlistContext';
import { ChatApi } from '@/api/chat.api';
import { useAuthStore } from '@/store/authStore';
import ReviewsSection from '@/components/review/ReviewsSection';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggle, has } = useWishlist();
  const { user } = useAuth();
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      loadProduct(slug);
    }
  }, [slug]);

  const loadProduct = async (productId: string) => {
    try {
      setNotFound(false);
      const productData = await productService.getProduct(productId);
      setProduct(productData);
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 404) {
        setNotFound(true);
      }
      console.error('Failed to load product:', error);
      toast.error(status === 404 ? 'Product not found' : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.title,
        price: product.price,
        image: product.images[0] || '',
        vendorId: product.vendorId,
        vendorName: product.vendorName,
      });
    }
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleWishlist = () => {
    if (!product) return;
    const inList = has(product.id);
    toggle({ id: product.id, name: product.title, priceCents: product.price * 100, imageUrl: product.images[0] || '', vendorName: product.vendorName, slug: product.id });
    toast.success(inList ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleMessageVendor = async () => {
    if (!product) return;
    if (!user || !token) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`);
      return;
    }
    if (!product.vendorId) {
      toast.error('Vendor not available for messaging');
      return;
    }
    try {
      const conv = await ChatApi.upsertConversation(token, product.vendorId, undefined);
      navigate('/messages');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-96 rounded-lg mb-4"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-20 w-20 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
            <p className="text-gray-600 mb-6">The product you’re looking for doesn’t exist or may have been removed.</p>
            <Link to="/browse" className="btn-primary inline-block">Back to Browse</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/browse" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-primary-600">Browse</Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative bg-white rounded-xl overflow-hidden shadow-sm">
              <img
                src={product.images[currentImageIndex] || 'https://images.pexels.com/photos/1070360/pexels-photo-1070360.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={product.title}
                className="w-full h-96 object-cover"
              />
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                      currentImageIndex === index 
                        ? 'border-primary-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.averageRating || 0)
                            ? 'fill-current'
                            : 'stroke-current fill-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.averageRating?.toFixed(1) || '5.0'} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
                {product.regionTag && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {product.regionTag}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-primary-600 mb-4">
                <span className="text-gray-600 mr-2">Nrs</span>{product.price.toLocaleString()}
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Vendor Info */}
            <div className="card p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {product.vendorName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{product.vendorName}</h4>
                  <p className="text-sm text-gray-600">{product.vendorShop}</p>
                </div>
                <button onClick={handleMessageVendor} className="btn-secondary text-sm flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="px-4 py-2 font-medium text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary text-lg py-3 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  title={product && has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-6 h-6 ${product && has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Share2 className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-primary-500" />
                <span>Free shipping worldwide</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-primary-500" />
                <span>Quality guaranteed</span>
              </div>
            </div>

            {/* Category and Tags */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Category:</span>
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewsSection productId={product.id} productSlug={slug} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;



