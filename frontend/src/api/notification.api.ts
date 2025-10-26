// api/notification.api.ts
import { request } from './_base';

export const NotificationApi = {
  list(token: string) {
    return request<{ items: any[] }>('/api/notifications', 'GET', undefined, token);
  },
  mark(token: string, id: string, isRead: boolean) {
    return request<any>(`/api/notifications/${id}`, 'PATCH', { isRead }, token);
  },
};
