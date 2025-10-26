// api/order.api.ts
import { request } from './_base';

export type OrderStatus = 'PENDING'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED';

export const OrderApi = {
  listMine(token: string) {
    return request<{ orders: any[] }>('/api/orders/me', 'GET', undefined, token);
  },
  listVendor(token: string) {
    return request<{ orders: any[] }>('/api/orders/vendor', 'GET', undefined, token);
  },
  updateStatus(token: string, id: string, status: OrderStatus) {
    return request<any>(`/api/orders/${id}/status`, 'PATCH', { status }, token);
  },
};
