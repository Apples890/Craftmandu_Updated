import React from 'react';
import { Card } from '@/components/ui/card';

type Props = {
  userType: 'admin' | 'vendor' | 'customer';
  initialProfile: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role?: string;
    position?: string;
    joinDate?: string;
  };
  extraFields?: React.ReactNode;
};

export default function ProfilePage({ userType, initialProfile, extraFields }: Props) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-4">
            {initialProfile.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={initialProfile.avatar} alt={initialProfile.name} className="w-16 h-16 rounded-full object-cover" />
            )}
            <div>
              <div className="text-lg font-semibold">{initialProfile.name}</div>
              <div className="text-sm text-gray-500">{initialProfile.email}</div>
              {initialProfile.role && (
                <div className="text-sm text-gray-500 capitalize">{userType} · {initialProfile.role}</div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {extraFields}
    </div>
  );
}

