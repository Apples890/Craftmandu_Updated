import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ProfileSection from '../../dashboard/ProfilePage';
import ProductsSection from '@/dashboard/vendor/ProductsSection';
import SalesAnalyticsSection from '@/dashboard/vendor/SalesAnalyticsSection';
import InventorySection from '@/dashboard/vendor/InventorySection';
import OrdersSection from '@/dashboard/vendor/OrdersSection';

// Sample vendor profile data
const vendorProfileData = {
  id: 'v1',
  name: 'Bob Johnson',
  email: 'bob@techgadgets.com',
  phone: '+1 (555) 123-4567',
  address: '123 Business Ave, Tech Park, CA 91234',
  avatar: '/assets/vendor-avatar.jpg',
  role: 'Store Owner',
  company: 'Tech Gadgets Inc.',
  position: 'Founder & CEO',
  joinDate: '2024-12-10',
};

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ProfileSection 
                userType="vendor" 
                initialProfile={vendorProfileData}
                extraFields={
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Store Performance</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Products</p>
                          <p className="text-2xl font-bold">28</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="text-2xl font-bold">$12.4k</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <p className="text-2xl font-bold">4.8</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ProductsSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <SalesAnalyticsSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <InventorySection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <OrdersSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}