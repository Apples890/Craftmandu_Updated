import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage: React.FC = () => {
  const { items, total, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Looks like you haven't added any handmade treasures to your cart yet. 
              Start exploring our collection of unique crafts.
            </p>
            <Link to="/browse" className="btn-primary inline-flex items-center space-x-2">
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || 'https://images.pexels.com/photos/1070360/pexels-photo-1070360.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by {item.vendorName}
                    </p>
                    <div className="text-lg font-bold text-primary-600">
                      <span className="text-gray-600 mr-1">Nrs</span> {item.price.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium"><span className="text-gray-600 mr-1">Nrs</span>{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium"><span className="text-gray-600 mr-1">Nrs</span>{(total * 0.08).toLocaleString()}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary-600"><span className="text-gray-600 mr-1">Nrs</span>{(total * 1.08).toLocaleString()}</span>
                </div>
              </div>

              {user ? (
                <Link to="/checkout" className="w-full btn-primary text-center block">
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link to="/login?redirect=checkout" className="w-full btn-primary text-center block">
                    Sign In to Checkout
                  </Link>
                  <Link to="/register?redirect=checkout" className="w-full btn-secondary text-center block">
                    Create Account
                  </Link>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link 
                  to="/browse" 
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Secure Checkout</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>SSL encrypted payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free worldwide shipping</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
