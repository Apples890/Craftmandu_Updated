import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ProfileSection from '../../dashboard/ProfilePage';
import WishlistSection from '@/dashboard/customer/WishlistSection';
import PurchaseHistorySection from '@/dashboard/customer/PurchaseHistorySection';
import DeliverySection from '@/dashboard/customer/DeliverySection';
import PromoCodeSection from '@/dashboard/customer/PromoCodeSection';

// Sample customer profile data
const customerProfileData = {
  id: 'c1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, Anytown, CA 91234',
  avatar: '/assets/customer-avatar.jpg',
  joinDate: '2025-02-15',
};

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>
      
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
                initialProfile={customerProfileData}
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
  );
}