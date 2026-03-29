const API_URL = ''; // Relative to the same origin

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  photoURL?: string;
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

export const api = {
  // Auth
  async register(data: any) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    const result = await res.json();
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
    if (!res.ok) throw new Error((await res.json()).message);
    const result = await res.json();
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
    return res.json();
  },

  async getBook(id: string) {
    const res = await fetch(`${API_URL}/api/books/${id}`);
    if (!res.ok) throw new Error('Book not found');
    return res.json();
  },

  async addBook(formData: FormData) {
    const res = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      body: formData,
    });
    
    let result;
    try {
      result = await res.json();
    } catch (e) {
      throw new Error('Server returned an invalid response. Please check if the server is running correctly.');
    }

    if (!res.ok) throw new Error(result.message || 'Failed to add book');
    return result;
  },

  // Orders
  async createOrder(data: any) {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create request');
    return res.json();
  },

  async getOrders(params: { buyerId?: string; sellerId?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/api/orders?${query}`);
    return res.json();
  },

  async getOrder(id: string) {
    const res = await fetch(`${API_URL}/api/orders/${id}`);
    if (!res.ok) throw new Error('Request not found');
    return res.json();
  },

  async updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  // Messages
  async getMessages(orderId: string) {
    const res = await fetch(`${API_URL}/api/messages/${orderId}`);
    return res.json();
  },

  async sendMessage(data: { orderId: string; senderId: string; text: string }) {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
};
