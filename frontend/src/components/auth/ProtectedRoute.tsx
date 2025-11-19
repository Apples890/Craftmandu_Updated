import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '@/utils/api.client';
import { AuthApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'vendor' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [vendorStatus, setVendorStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'UNKNOWN'>('UNKNOWN');
  const [checkingVendor, setCheckingVendor] = useState(false);
  const [refreshingRole, setRefreshingRole] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const token = useAuthStore((s) => s.token);

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
  const shouldCheckVendorStatus = role === 'vendor' || role === 'customer';

  if (role && role !== 'vendor' && role !== 'customer' && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  // If vendor/customer area, check vendor status
  useEffect(() => {
    let mounted = true;
    async function fetchVendor() {
      if (!shouldCheckVendorStatus) {
        if (mounted) {
          setVendorStatus('NONE');
          setCheckingVendor(false);
        }
        return;
      }
      try {
        setCheckingVendor(true);
        const { data } = await api.get('/api/vendors/status/me');
        if (!mounted) return;
        const status = (data?.status as string | undefined) || 'NONE';
        setVendorStatus(status as any);
      } catch (e) {
        if (mounted) setVendorStatus('NONE');
      } finally {
        if (mounted) setCheckingVendor(false);
      }
    }
    fetchVendor();
    return () => { mounted = false; };
  }, [role, user?.id, shouldCheckVendorStatus]);

  useEffect(() => {
    let mounted = true;
    async function syncRole() {
      if (role !== 'vendor') return;
      if (vendorStatus !== 'APPROVED' || userRole === 'vendor' || refreshingRole || !token) return;
      try {
        setRefreshingRole(true);
        const { token: newToken } = await AuthApi.refresh(token);
        setToken(newToken);
        await refreshProfile();
      } catch {
        // ignore; fallback to blocking state below
      } finally {
        if (mounted) setRefreshingRole(false);
      }
    }
    syncRole();
    return () => { mounted = false; };
  }, [role, vendorStatus, userRole, refreshingRole, refreshProfile, setToken, token]);

  if (role === 'vendor') {
    if (checkingVendor || vendorStatus === 'UNKNOWN' || refreshingRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    if (vendorStatus !== 'APPROVED') {
      const message =
        vendorStatus === 'NONE'
          ? 'You have not submitted a vendor application yet. Please sign up as a vendor or contact support.'
          : vendorStatus === 'SUSPENDED'
            ? 'Your vendor account is suspended. Please contact support for more information.'
            : 'Your vendor account is currently pending approval from the admin team.';
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Vendor Access Restricted</h2>
            <p className="text-yellow-700">{message}</p>
          </div>
        </div>
      );
    }
    if (userRole !== 'vendor') {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Action Required</h2>
            <p className="text-yellow-700">Your vendor account is approved. Please sign out and sign in again to refresh your access.</p>
          </div>
        </div>
      );
    }
  }

  if (role === 'customer') {
    if (checkingVendor || vendorStatus === 'UNKNOWN') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    if (vendorStatus !== 'NONE') {
      const message =
        vendorStatus === 'PENDING'
          ? 'Your vendor application is under review. Customer dashboard access is disabled until a decision is made.'
          : vendorStatus === 'APPROVED'
            ? 'Your account has been approved as a vendor. Please use the vendor dashboard instead.'
            : 'Your vendor account is suspended. Please contact support.';
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Access Restricted</h2>
            <p className="text-yellow-700">{message}</p>
          </div>
        </div>
      );
    }
    if (userRole !== 'customer') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
