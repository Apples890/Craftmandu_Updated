import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/common/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/common/avatar';
import { Mail, Phone, Calendar, IdCard, Camera, Pencil, Key, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/common/button';
import { Dialog, DialogContent, DialogFooter as ModalFooter, DialogHeader, DialogTitle } from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import { Label } from '@/components/common/label';
import { UserApi } from '@/api/user.api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

type Props = {
  userType: 'admin' | 'vendor' | 'customer';
  initialProfile: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    role?: string | null;
    position?: string | null;
    joinDate?: string | null;
    updatedAt?: string | null;
  };
  extraFields?: React.ReactNode;
};

export default function ProfilePage({ userType, initialProfile, extraFields }: Props) {
  const roleBadgeVariant = useMemo(() => {
    switch (userType) {
      case 'admin': return 'destructive';
      case 'vendor': return 'warning';
      default: return 'success';
    }
  }, [userType]);

  const initialLetter = (initialProfile.name || initialProfile.email || 'U').charAt(0).toUpperCase();
  const joined = useMemo(() => {
    if (!initialProfile.joinDate) return '-';
    const d = new Date(initialProfile.joinDate);
    return isNaN(d.getTime()) ? String(initialProfile.joinDate) : d.toLocaleDateString();
  }, [initialProfile.joinDate]);

  const updated = useMemo(() => {
    if (!initialProfile.updatedAt) return '-';
    const d = new Date(initialProfile.updatedAt);
    return isNaN(d.getTime()) ? String(initialProfile.updatedAt) : d.toLocaleDateString();
  }, [initialProfile.updatedAt]);

  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [editMode, setEditMode] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  const [editName, setEditName] = useState(initialProfile.name || '');
  const [editPhone, setEditPhone] = useState(initialProfile.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Inline change password section
  const [showPwd, setShowPwd] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // Simple center-crop dialog state
  const [openCrop, setOpenCrop] = useState(false);
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);

  async function handleSaveProfile() {
    try {
      setSavingProfile(true);
      await UserApi.updateProfile({ fullName: editName, phone: editPhone || null });
      await refreshProfile();
      toast.success('Profile updated');
      setEditMode(false);
      setShowSavedBanner(true);
      setTimeout(() => setShowSavedBanner(false), 4000);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  }

  async function handleChangePassword() {
    try {
      if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
      setSavingPwd(true);
      await UserApi.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      toast.success('Password changed');
      setShowPwd(false);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to change password');
    } finally { setSavingPwd(false); }
  }

  async function onAvatarFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropPreviewUrl(url);
    setImgNatural(null);
    setOpenCrop(true);
  }

  async function handleConfirmCropUpload() {
    if (!cropPreviewUrl || !imgNatural) { setOpenCrop(false); return; }
    try {
      setUploadingAvatar(true);
      // Render exact center square crop to canvas, without upscaling
      const img = await loadImage(cropPreviewUrl);
      const srcSize = Math.min(imgNatural.w, imgNatural.h);
      const sx = Math.max(0, (imgNatural.w - srcSize) / 2);
      const sy = Math.max(0, (imgNatural.h - srcSize) / 2);
      const outSize = Math.min(512, srcSize); // do not upscale beyond original
      const canvas = document.createElement('canvas');
      canvas.width = outSize; canvas.height = outSize;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, outSize, outSize);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, outSize, outSize);

      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92));
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      await UserApi.uploadAvatar(file);
      await refreshProfile();
      toast.success('Profile photo updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      setOpenCrop(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cropPreviewUrl) URL.revokeObjectURL(cropPreviewUrl);
      setCropPreviewUrl(null);
    }
  }

  function onCropImageLoad(ev: React.SyntheticEvent<HTMLImageElement>) {
    const t = ev.currentTarget;
    setImgNatural({ w: t.naturalWidth, h: t.naturalHeight });
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = src;
    });
  }

  function openAvatarPicker() { fileInputRef.current?.click(); }
  function viewAvatar() { if (initialProfile.avatar) window.open(initialProfile.avatar, '_blank'); }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-red-600/80 via-orange-500/80 to-pink-500/80" />
        <CardContent className="pt-0">
          <div className="-mt-10 flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-md cursor-pointer" onClick={() => { if (!editMode) viewAvatar(); }}>
                {initialProfile.avatar ? (
                  <AvatarImage src={initialProfile.avatar} alt={initialProfile.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-2xl font-bold">
                    {initialLetter}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-2 right-0 flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white border border-gray-200"
                  onClick={openAvatarPicker}
                  disabled={uploadingAvatar}
                  title="Change photo"
                  aria-label="Change photo"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFileSelected} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {editMode ? (
                  <Input
                    aria-label="Full name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="max-w-sm"
                  />
                ) : (
                  <h2 className="text-xl md:text-2xl font-semibold">{initialProfile.name}</h2>
                )}
                <Badge variant={roleBadgeVariant as any} className="capitalize">
                  {initialProfile.role || userType}
                </Badge>
              </div>
              <div className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> {initialProfile.email}</span>
                {editMode ? (
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <Input
                      aria-label="Phone"
                      value={editPhone || ''}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="h-8 w-[180px]"
                    />
                  </span>
                ) : (
                  initialProfile.phone && (
                    <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {initialProfile.phone}</span>
                  )
                )}
                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined {joined}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => { setEditMode(false); setEditName(initialProfile.name || ''); setEditPhone(initialProfile.phone || ''); }}>Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditMode(true)}>
              <Pencil className="h-4 w-4" /> Edit profile
            </Button>
          )}
        </CardFooter>
      </Card>

      {showSavedBanner && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-700">Your profile changes have been saved.</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editMode ? (
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Full Name</div>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
            ) : (
              <Detail label="Full Name" value={initialProfile.name} />
            )}
            <Detail label="Email" value={initialProfile.email} icon={<Mail className="h-4 w-4 text-gray-400" />} />
            {editMode ? (
              <div className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Phone</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <Input value={editPhone || ''} onChange={(e) => setEditPhone(e.target.value)} className="h-8" />
                </div>
              </div>
            ) : (
              <Detail label="Phone" value={initialProfile.phone || '-'} icon={<Phone className="h-4 w-4 text-gray-400" />} />
            )}
            <Detail label="User ID" value={initialProfile.id} icon={<IdCard className="h-4 w-4 text-gray-400" />} />
            <Detail label="Role" value={(initialProfile.role || userType).toString()} />
            <Detail label="Last Updated" value={updated} />
          </div>
        </CardContent>
      </Card>

      {/* Security (inline collapsible) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4" />
              Security
            </CardTitle>
            <Button variant="outline" onClick={() => setShowPwd((v) => !v)}>
              {showPwd ? 'Hide' : 'Change password'}
            </Button>
          </div>
        </CardHeader>
        {showPwd && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowPwd(false); setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); }}>Cancel</Button>
              <Button onClick={handleChangePassword} disabled={savingPwd}>{savingPwd ? 'Updating…' : 'Update password'}</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {extraFields}

      {/* Simple center-crop dialog */}
      <Dialog open={openCrop} onOpenChange={setOpenCrop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust profile photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="mx-auto h-[300px] w-[300px] rounded-md overflow-hidden relative bg-gray-100">
              {cropPreviewUrl && (
                <img
                  src={cropPreviewUrl}
                  onLoad={onCropImageLoad}
                  alt="preview"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              )}
              {/* Square overlay frame */}
              <div className="pointer-events-none absolute inset-0 ring-2 ring-white/80" />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => { setOpenCrop(false); if (cropPreviewUrl) { URL.revokeObjectURL(cropPreviewUrl); setCropPreviewUrl(null);} }}>Cancel</Button>
            <Button onClick={handleConfirmCropUpload} disabled={uploadingAvatar || !cropPreviewUrl || !imgNatural}>
              {uploadingAvatar ? 'Uploading…' : 'Upload'}
            </Button>
          </ModalFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="break-all">{value}</span>
      </div>
    </div>
  );
}
