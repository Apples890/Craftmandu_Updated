import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ProfileSection from '../../dashboard/ProfilePage';
import WishlistSection from '@/dashboard/customer/WishlistSection';
import PurchaseHistorySection from '@/dashboard/customer/PurchaseHistorySection';
import DeliverySection from '@/dashboard/customer/DeliverySection';
import PromoCodeSection from '@/dashboard/customer/PromoCodeSection';
import { useAuth } from '@/context/AuthContext';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, recoverSession } = useAuth();

  useEffect(() => {
    if (!user) recoverSession().catch(() => {});
  }, [user, recoverSession]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== activeTab) setActiveTab(t);
  }, [searchParams]);

  useEffect(() => {
    const current = searchParams.get('tab');
    if (activeTab !== (current || 'profile')) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', activeTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab]);

  const profileData = useMemo(() => ({
    id: user?.id || '',
    name: user?.full_name || user?.username || user?.email || 'User',
    email: user?.email || '',
    phone: user?.phone || null,
    avatar: user?.avatar_url || null,
    role: (user?.role ? String(user.role).toLowerCase() : 'customer') as string,
    position: null,
    joinDate: user?.created_at || null,
    updatedAt: user?.updated_at || null,
  }), [user]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-8">Customer Dashboard</h1>
      {loading && (
        <div className="p-4">Loading profile…</div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Tracking</TabsTrigger>
          <TabsTrigger value="promo">Promo Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ProfileSection
                userType="customer"
                initialProfile={profileData}
                extraFields={
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Account Summary</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Orders</p>
                          <p className="text-2xl font-bold">12</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Wishlist</p>
                          <p className="text-2xl font-bold">8</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Reviews</p>
                          <p className="text-2xl font-bold">5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wishlist" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <WishlistSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <PurchaseHistorySection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <DeliverySection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promo" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <PromoCodeSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
