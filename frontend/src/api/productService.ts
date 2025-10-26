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
  region?: string;
  sortBy?: 'price' | 'rating' | 'newest' | 'popularity';
  search?: string;
}

export const productService = {
  async getProducts(filters?: ProductFilters) {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  async getProduct(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
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