import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import BrowsePage from '../pages/BrowsePage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import MessagesPage from '../pages/MessagesPage';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOTPPage from '../pages/auth/VerifyOTPPage';
import SetupUsernamePage from '../pages/auth/SetupUsernamePage';

import VendorDashboard from '../pages/profile/VendorDashboard';
import AdminDashboard from '../pages/profile/AdminDashboard';
import CustomerDashboard from '../pages/profile/CustomerDashboard';

// Optional: guarded routes can be wrapped with your ProtectedRoute if desired
// import ProtectedRoute from '../components/auth/ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/product/:slug" element={<ProductDetailPage />} />

      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
      <Route path="/messages" element={<MessagesPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/setup-username" element={<SetupUsernamePage />} />

      <Route path="/vendor" element={<VendorDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<CustomerDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

