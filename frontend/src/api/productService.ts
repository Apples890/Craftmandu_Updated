import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  quantity: number;
  vendorId: string;
  vendorName: string;
  vendorShop: string;
  regionTag?: string;
  ratings: number[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popularity';
  search?: string;
}

export const productService = {
  async getProducts(filters?: ProductFilters) {
    const params: any = { limit: 50 };
    if (filters?.search) params.search = filters.search;
    if (filters?.category) params.category = filters.category; // slug
    if (filters?.minPrice !== undefined) params.minPriceCents = Math.round(Number(filters.minPrice) * 100);
    if (filters?.maxPrice !== undefined) params.maxPriceCents = Math.round(Number(filters.maxPrice) * 100);
    if (filters?.sortBy) params.sortBy = filters.sortBy === 'rating' || filters.sortBy === 'popularity' ? 'newest' : filters.sortBy;

    const response = await api.get('/products', { params });
    const items = response.data?.items || [];
    const mapped = items.map((it: any) => {
      const priceCents = typeof it.price_cents === 'number' ? it.price_cents : 0;
      const image = it.image_url || (it.product_images && it.product_images[0]?.image_url) || '';
      const vendorName = it.vendor?.shop_name || 'Vendor';
      const categoryName = it.category?.name || 'General';
      return {
        id: it.slug || it.id,
        name: it.name,
        price: Math.round(priceCents / 100),
        image,
        rating: Number(it.avg_rating ?? it.average_rating ?? 0),
        vendor: vendorName,
        category: categoryName,
      } as Product;
    });
    return { products: mapped };
  },

  async getProduct(slug: string): Promise<Product> {
    const { data } = await api.get(`/products/${slug}`);
    const priceCents = typeof data.price_cents === 'number' ? Math.round(data.price_cents) : 0;
    const images: string[] = Array.isArray(data.images) ? data.images : [];
    const categoryName = data.category?.name || 'General';
    const vendorName = data.vendor?.shop_name || 'Vendor';
    const vendorId = data.vendor?.id || '';
    return {
      id: data.slug || data.id,
      title: data.name,
      description: data.description || '',
      price: Math.ceil(priceCents / 100),
      category: categoryName,
      images: images.length ? images : [
        'https://images.unsplash.com/photo-1523419409543-a6d49002b6aa?q=80&w=800&auto=format&fit=crop'
      ],
      quantity: data.inventory?.qty_available ?? 0,
      vendorId,
      vendorName,
      vendorShop: vendorName,
      ratings: [],
      averageRating: Number(data.avg_rating ?? data.average_rating ?? 0),
      reviewCount: Number(data.review_count ?? 0),
      createdAt: data.created_at,
    };
  },

  async getFeaturedProducts() {
    const response = await api.get('/products/featured');
    return response.data;
  },

  async getVendorProducts(vendorId: string) {
    const response = await api.get(`/products/vendor/${vendorId}`);
    return response.data;
  },

  async createProduct(productData: FormData) {
    const response = await api.post('/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async updateProduct(id: string, productData: FormData) {
    const response = await api.put(`/products/${id}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async getRecommendations(userId: string) {
    const response = await api.get(`/products/recommendations/${userId}`);
    return response.data;
  },
};
