// frontend/types/notification.types.ts
export type NotificationType = 'ORDER' | 'MESSAGE' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}
