// frontend/types/api.types.ts
export interface ApiErrorShape {
  error?: string;
  message?: string;
  details?: any;
}

export type ApiList<T> = { items: T[] };
export type ApiWithCount<T> = { items: T[]; count: number };
