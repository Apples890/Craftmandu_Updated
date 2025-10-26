import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ProfileSection from '../../dashboard/ProfilePage';
import UsersManagementSection from '@/dashboard/admin/UsersManagementSection';
import PromoManagementSection from '@/dashboard/admin/PromoManagementSection';
import VendorManagementSection from '@/dashboard/admin/VendorManagementSection';
import SystemAnalyticsSection from '@/dashboard/admin/SystemAnalyticsSection';

// Sample admin profile data
const adminProfileData = {
  id: 'a1',
  name: 'Charlie Brown',
  email: 'charlie.brown@example.com',
  phone: '+1 (555) 987-6543',
  avatar: '/assets/admin-avatar.jpg',
  role: 'System Administrator',
  position: 'Senior Administrator',
  joinDate: '2024-12-01',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container mx-auto py-8 px-4 bg-white shadow-md rounded-lg">
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="analytics">System Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ProfileSection 
                userType="admin" 
                initialProfile={adminProfileData}
                extraFields={
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">System Access</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Last Login</p>
                          <p className="text-md font-medium">Today, 9:32 AM</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Security Level</p>
                          <p className="text-md font-medium">Level 3 (Full Access)</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Account Status</p>
                          <p className="text-md font-medium text-green-600">Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <UsersManagementSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promos" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <PromoManagementSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <VendorManagementSection />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <SystemAnalyticsSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}