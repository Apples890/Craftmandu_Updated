import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api.client';

const ProfileRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [isVendor, setIsVendor] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user || String(user.role || '').toLowerCase() === 'admin') { setIsVendor(false); return; }
      try {
        const { data } = await api.get('/api/vendors/status/me');
        if (!mounted) return;
        const status = (data?.status as string | undefined) || 'NONE';
        setIsVendor(status === 'APPROVED');
      } catch {
        if (mounted) setIsVendor(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const role = String(user.role || '').toLowerCase();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (isVendor === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
      </div>
    );
  }
  if (isVendor) return <Navigate to="/vendor" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default ProfileRedirect;
