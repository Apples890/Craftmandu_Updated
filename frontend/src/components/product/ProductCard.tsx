import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  vendor: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      vendor: product.vendor,
      category: product.category,
      rating: product.rating,
    });
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-orange-100">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>

          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full shadow-lg hover:from-red-700 hover:to-orange-700 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="inline-block bg-gradient-to-r from-orange-100 to-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>

          {/* Vendor */}
          <p className="text-sm text-gray-600 mb-3">by {product.vendor}</p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-800">
              <span className="text-lg text-gray-600">Nrs</span> {product.price.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 font-medium">
              Free Shipping
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;