// models/notification.model.ts
export type NotificationType = 'ORDER' | 'MESSAGE' | 'SYSTEM';

export interface NotificationDbRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export const NotificationModel = {
  fromDb: (r: NotificationDbRow): Notification => ({
    id: r.id,
    userId: r.user_id,
    type: r.type,
    title: r.title,
    body: r.body,
    data: r.data,
    isRead: r.is_read,
    createdAt: r.created_at,
  }),
  toDb: (n: Partial<Notification>): Partial<NotificationDbRow> => ({
    id: n.id,
    user_id: n.userId!,
    type: n.type!,
    title: n.title!,
    body: n.body ?? null,
    data: n.data ?? null,
    is_read: n.isRead ?? false,
    created_at: n.createdAt,
  }),
};
