/// <reference types="vite/client" />
const API_URL = import.meta.env.VITE_API_URL || '';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  photoURL?: string;
  bio?: string;
  location?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  condition: string;
  description: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  status: 'Available' | 'Sold' | 'Reserved' | 'Sold Out';
  quantity: number;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  bookId: string;
  bookTitle: string;
  sellerId: string;
  amount: number;
  status: string;
  createdAt: string;
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `Request failed with status ${res.status}`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
}

export const api = {
  // Auth
  async register(data: any) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  },

  async login(data: any) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Books
  async getBooks(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/books?${query}`);
    return handleResponse(res);
  },

  async getBook(id: string) {
    const res = await fetch(`${API_URL}/api/books/${id}`);
    return handleResponse(res);
  },

  async addBook(formData: FormData) {
    const res = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Orders
  async createOrder(data: any) {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getOrders(params: { buyerId?: string; sellerId?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/orders?${query}`);
    return handleResponse(res);
  },

  async getOrder(id: string) {
    const res = await fetch(`${API_URL}/api/orders/${id}`);
    return handleResponse(res);
  },

  async updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Users
  async getUser(id: string) {
    const res = await fetch(`${API_URL}/api/users/${id}`);
    return handleResponse(res);
  },

  async updateProfile(data: Partial<User>) {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Messages
  async getMessages(orderId: string) {
    const res = await fetch(`${API_URL}/api/messages/${orderId}`);
    return handleResponse(res);
  },

  async sendMessage(data: { orderId: string; senderId: string; text: string }) {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }
};
