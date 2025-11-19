import { useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ProfileSection from '../../dashboard/ProfilePage';
import ProductsSection from '@/dashboard/vendor/ProductsSection';
import SalesAnalyticsSection from '@/dashboard/vendor/SalesAnalyticsSection';
import InventorySection from '@/dashboard/vendor/InventorySection';
import OrdersSection from '@/dashboard/vendor/OrdersSection';
import VendorReviewsSection from '@/dashboard/vendor/VendorReviewsSection';
import { useAuth } from '@/context/AuthContext';
import { VendorApi } from '@/api/vendor.api';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import { Label } from '@/components/common/label';
import { Button } from '@/components/common/button';
import toast from 'react-hot-toast';
import { Upload, Pencil } from 'lucide-react';

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, loading, recoverSession } = useAuth();
  const [vendor, setVendor] = useState<any | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(false);

  async function loadVendor() {
    try {
      setLoadingVendor(true);
      const v = await VendorApi.me();
      setVendor(v);
    } catch (e: any) {
      // Non-vendor accounts won't have a vendor row
    } finally { setLoadingVendor(false); }
  }

  useEffect(() => {
    if (!user) recoverSession().catch(() => {});
    loadVendor();
  }, [user, recoverSession]);

  const profileData = useMemo(() => ({
    id: user?.id || '',
    name: user?.full_name || user?.username || user?.email || 'User',
    email: user?.email || '',
    phone: user?.phone || null,
    avatar: user?.avatar_url || null,
    role: (user?.role ? String(user.role).toLowerCase() : 'vendor') as string,
    position: user?.position || null,
    joinDate: user?.created_at || null,
    updatedAt: user?.updated_at || null,
  }), [user]);

  // Editor state
  const [openEdit, setOpenEdit] = useState(false);
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!vendor) return;
    setShopName(vendor.shop_name || '');
    setDescription(vendor.description || '');
    setAddressLine1(vendor.address_line1 || '');
    setAddressLine2(vendor.address_line2 || '');
    setCity(vendor.city || '');
    setCountry(vendor.country || '');
  }, [vendor]);

  async function handleSaveVendor() {
    try {
      setSaving(true);
      const payload = {
        shopName: shopName || undefined,
        description: description || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city: city || null,
        country: country || null,
      };
      const updated = await VendorApi.update(payload);
      setVendor(updated);
      toast.success('Store updated');
      setOpenEdit(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    } finally { setSaving(false); }
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    try {
      const res = await VendorApi.uploadLogo(file);
      setVendor(res.vendor || vendor);
      toast.success('Logo updated');
    } catch (e: any) { toast.error(e?.message || 'Logo upload failed'); }
  }
  async function uploadBanner(file?: File) {
    if (!file) return;
    try {
      const res = await VendorApi.uploadBanner(file);
      setVendor(res.vendor || vendor);
      toast.success('Banner updated');
    } catch (e: any) { toast.error(e?.message || 'Banner upload failed'); }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Vendor Dashboard</h1>
        {loadingVendor && <p className="text-sm text-muted-foreground mt-1">Loading store…</p>}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <ProfileSection
                userType="vendor"
                initialProfile={profileData}
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

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Store settings</p>
                  <h2 className="text-lg font-semibold">{vendor?.shop_name || 'Your Store'}</h2>
                </div>
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                  <DialogTrigger asChild>
                    <Button variant="secondary"><Pencil className="h-4 w-4" /> Edit store</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Store</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="shopName">Shop name</Label>
                        <Input id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" className="w-full border rounded-md p-2 h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="address1">Address line 1</Label>
                        <Input id="address1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="address2">Address line 2</Label>
                        <Input id="address2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
                      <Button onClick={handleSaveVendor} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium mb-2">Logo</p>
                  <div className="flex items-center gap-4">
                    {vendor?.logo_url ? (
                      <img src={vendor.logo_url} alt="logo" className="h-16 w-16 rounded-md object-cover border" />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-gray-100 border" />
                    )}
                    <div>
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0] || undefined)} />
                      <Button size="sm" variant="ghost" className="border border-gray-200" onClick={() => logoInputRef.current?.click()}>
                        <Upload className="h-4 w-4" /> Upload logo
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Banner</p>
                  <div className="flex items-center gap-4">
                    {vendor?.banner_url ? (
                      <img src={vendor.banner_url} alt="banner" className="h-16 w-28 rounded-md object-cover border" />
                    ) : (
                      <div className="h-16 w-28 rounded-md bg-gray-100 border" />
                    )}
                    <div>
                      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadBanner(e.target.files?.[0] || undefined)} />
                      <Button size="sm" variant="ghost" className="border border-gray-200" onClick={() => bannerInputRef.current?.click()}>
                        <Upload className="h-4 w-4" /> Upload banner
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

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

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <VendorReviewsSection />
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
    </div>
  );
}
