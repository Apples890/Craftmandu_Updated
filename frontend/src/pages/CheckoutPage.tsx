import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserApi } from '@/api/user.api';
import { api } from '@/utils/api.client';

const NepalDistricts: Record<string, string[]> = {
  'Koshi': ['Bhojpur','Dhankuta','Ilam','Jhapa','Khotang','Morang','Okhaldhunga','Panchthar','Sankhuwasabha','Solukhumbu','Sunsari','Taplejung','Udayapur'],
  'Madhesh': ['Bara','Dhanusha','Mahottari','Parsa','Rautahat','Saptari','Sarlahi','Siraha'],
  'Bagmati': ['Bhaktapur','Chitwan','Dhading','Dolakha','Kathmandu','Kavrepalanchok','Lalitpur','Makwanpur','Nuwakot','Ramechhap','Rasuwa','Sindhuli','Sindhupalchok'],
  'Gandaki': ['Baglung','Gorkha','Kaski','Lamjung','Manang','Mustang','Myagdi','Nawalpur','Parbat','Syangja','Tanahun'],
  'Lumbini': ['Arghakhanchi','Banke','Bardiya','Dang','Gulmi','Kapilvastu','Nawalparasi (West)','Palpa','Pyuthan','Rolpa','Rukum (East)','Rupandehi'],
  'Karnali': ['Dailekh','Dolpa','Humla','Jajarkot','Jumla','Kalikot','Mugu','Rukum (West)','Salyan','Surkhet'],
  'Sudurpashchim': ['Achham','Baitadi','Bajhang','Bajura','Dadeldhura','Darchula','Doti','Kailali','Kanchanpur'],
};
const CheckoutPage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, recoverSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const [formData, setFormData] = useState({
    // Shipping Address
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '', // street address
    province: '',
    district: '',
    
    // Payment
    paymentMethod: 'COD' as 'COD' | 'WALLET',
    wallet: '' as '' | 'ESEWA' | 'KHALTI',
    
    // Options
    saveAddress: false,
    newsletter: false,
  });

  // Prefill name and phone from user profile once when available
  useEffect(() => {
    if (!user || initialized.current) return;
    // Parse full name: first = all words except last; last = last word; single word => only first
    const full = (user.full_name || user.username || '').trim();
    let firstName = '';
    let lastName = '';
    if (full) {
      const parts = full.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        firstName = parts[0];
      } else if (parts.length > 1) {
        lastName = parts[parts.length - 1];
        firstName = parts.slice(0, -1).join(' ');
      }
    }
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName,
      email: prev.email || user.email || '',
      phone: prev.phone || (user.phone || ''),
      address: prev.address || (user.shipping_address_json?.address || ''),
      province: prev.province || (user.shipping_address_json?.province || ''),
      district: prev.district || (user.shipping_address_json?.district || ''),
    }));
    initialized.current = true;
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If user is logged in and doesn't have a phone yet, persist the first-time phone number
      if (user && !user.phone && formData.phone) {
        try {
          await UserApi.updateProfile({ phone: formData.phone });
          await recoverSession();
        } catch (err: any) {
          // Non-blocking: proceed with checkout even if phone update fails
        }
      }
            // Persist shipping address once if opted-in and user profile doesn't have it yet
      if (user && !user.shipping_address_json && formData.saveAddress && formData.address && formData.province && formData.district) {
        try {
          await UserApi.updateProfile({ shippingAddress: { address: formData.address, province: formData.province, district: formData.district } });
          await recoverSession();
        } catch {}
      }// Simulate payment processing
      // Create orders on the server (one per vendor)
      if (!items.length) throw new Error('Cart is empty');
      const payload = {
        items: items.map((it) => ({ product: (it as any).productId || (it as any).id, qty: (it as any).quantity })),
        shipping: { address: formData.address, province: formData.province, district: formData.district },
        payment: { method: (formData as any).paymentMethod || 'COD', wallet: (formData as any).wallet || undefined },
      } as any;
      await api.post('/api/orders/checkout', payload);
      // Optional: brief UX delay
      await new Promise(resolve => setTimeout(resolve, ((formData as any).paymentMethod === 'WALLET') ? 1500 : 800));

      // Clear cart and redirect
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const taxAmount = total * 0.08;
  const finalTotal = total + taxAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-8">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </motion.div>
              {/* Shipping Address - Nepal specific */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address (Nepal)</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="House/Street/Area"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={(e) => { handleInputChange(e); setFormData(prev => ({ ...prev, district: '' })); }}
                      className="input-field"
                      required
                    >
                      <option value="">Select Province</option>
                      {Object.keys(NepalDistricts).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      disabled={!formData.province}
                    >
                      <option value="">Select District</option>
                      {!!formData.province && NepalDistricts[formData.province as keyof typeof NepalDistricts].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    name="saveAddress"
                    checked={formData.saveAddress}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Save this address for future orders</label>
                </div>
              </motion.div>
              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} />
                    <span className="text-gray-700">Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="WALLET" checked={formData.paymentMethod === 'WALLET'} onChange={handleInputChange} />
                    <span className="text-gray-700">Digital Wallet</span>
                  </label>
                </div>
                {formData.paymentMethod === 'WALLET' && (
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Choose Wallet</label>
                    <select name="wallet" value={formData.wallet} onChange={handleInputChange} className="input-field" required>
                      <option value="">Select provider</option>
                      <option value="ESEWA">eSewa</option>
                      <option value="KHALTI">Khalti</option>
                    </select>
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                      You will be redirected to {formData.wallet === 'ESEWA' ? 'eSewa' : formData.wallet === 'KHALTI' ? 'Khalti' : 'the wallet'} to complete payment.
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="card p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        <span className="text-gray-600 mr-1">Nrs</span>{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium"><span className="text-gray-600 mr-1">Nrs</span>{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium"><span className="text-gray-600 mr-1">Nrs</span>{taxAmount.toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary-600"><span className="text-gray-600 mr-1">Nrs</span>{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-primary-700">
                    <Truck className="w-4 h-4" />
                    <span>Estimated delivery: 5-7 business days</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Complete Order - Nrs ${finalTotal.toLocaleString()}`}
                </button>

                {/* Newsletter */}
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Subscribe to our newsletter for updates and special offers
                  </label>
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;







