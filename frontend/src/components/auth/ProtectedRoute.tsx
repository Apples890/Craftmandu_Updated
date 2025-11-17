import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '@/utils/api.client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'vendor' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [vendorStatus, setVendorStatus] = useState<'APPROVED' | 'PENDING' | 'SUSPENDED' | 'UNKNOWN'>('UNKNOWN');
  const [checkingVendor, setCheckingVendor] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  const userRole = typeof user.role === 'string' ? user.role.toString().toLowerCase() : '';
  if (role === 'admin' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If vendor area, check vendor status and block when not approved
  useEffect(() => {
    let mounted = true;
    async function fetchVendor() {
      if (role !== 'vendor') return;
      try {
        setCheckingVendor(true);
        const { data } = await api.get('/api/vendors/me');
        if (!mounted) return;
        const status = (data?.status as string | undefined) || 'PENDING';
        setVendorStatus(status as any);
      } catch (e) {
        if (mounted) setVendorStatus('PENDING');
      } finally {
        if (mounted) setCheckingVendor(false);
      }
    }
    fetchVendor();
    return () => { mounted = false; };
  }, [role]);

  if (role === 'vendor') {
    if (checkingVendor) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    if (vendorStatus !== 'APPROVED') {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Vendor Account Pending Approval</h2>
            <p className="text-yellow-700">Your vendor account is currently not approved. You will be able to access the vendor dashboard once an admin approves your account.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
