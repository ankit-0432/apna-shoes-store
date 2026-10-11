import {
  Product,
  Category,
  Order,
  ReturnRequest,
  StoreCMSConfig,
  FlipkartMapping,
  IntegrationStatus,
} from '../types/store.js';

const API_BASE = '/api';

export const api = {
  // CONFIG / CMS
  async getConfig(): Promise<StoreCMSConfig> {
    const res = await fetch(`${API_BASE}/config`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch config');
    return json.data;
  },

  async updateConfig(config: Partial<StoreCMSConfig>): Promise<StoreCMSConfig> {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update config');
    return json.data;
  },

  // PRODUCTS
  async getProducts(params?: {
    category?: string;
    gender?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    admin?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.gender) query.set('gender', params.gender);
    if (params?.search) query.set('search', params.search);
    if (params?.minPrice) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params?.sort) query.set('sort', params.sort);
    if (params?.admin) query.set('admin', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch products');
    return json.data;
  },

  async getProduct(slug: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${slug}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Product not found');
    return json.data;
  },

  async saveProduct(product: Partial<Product> & { name: string; sellingPrice: number }): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save product');
    return json.data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete product');
    return true;
  },

  async importCsv(csvText: string): Promise<string> {
    const res = await fetch(`${API_BASE}/products/import-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'CSV import failed');
    return json.message;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch categories');
    return json.data;
  },

  async saveCategory(cat: Partial<Category> & { name: string; slug: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save category');
    return json.data;
  },

  // COUPONS
  async validateCoupon(code: string, subtotal: number) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return await res.json();
  },

  // PINCODE
  async checkPincode(pincode: string) {
    const res = await fetch(`${API_BASE}/pincode/${pincode}`);
    const json = await res.json();
    return json.data;
  },

  // RAZORPAY
  async createRazorpayOrder(amount: number) {
    const res = await fetch(`${API_BASE}/payment/razorpay/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Payment order creation failed');
    return json.data;
  },

  async verifyRazorpaySignature(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const res = await fetch(`${API_BASE}/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  // ORDERS
  async createOrder(orderData: any): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Order placement failed');
    return json.data;
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch orders');
    return json.data;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Order not found');
    return json.data;
  },

  async getUserOrders(query: string): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/user/${encodeURIComponent(query)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch user orders');
    return json.data;
  },

  async updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update order');
    return json.data;
  },

  async createShipment(orderId: string, courierName?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/shipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courierName }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate shipment');
    return json.data;
  },

  // 7-DAY RETURNS & REFUNDS
  async getReturns(): Promise<ReturnRequest[]> {
    const res = await fetch(`${API_BASE}/returns`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch returns');
    return json.data;
  },

  async createReturn(data: {
    orderId: string;
    reason: string;
    reasonDetails: string;
    photoUrl?: string;
  }): Promise<ReturnRequest> {
    const res = await fetch(`${API_BASE}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Return request failed');
    return json.data;
  },

  async updateReturnStatus(id: string, status: string, adminNotes?: string): Promise<ReturnRequest> {
    const res = await fetch(`${API_BASE}/returns/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update return');
    return json.data;
  },

  // FLIPKART
  async getFlipkartMappings(): Promise<FlipkartMapping[]> {
    const res = await fetch(`${API_BASE}/flipkart/mappings`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch Flipkart mappings');
    return json.data;
  },

  async syncFlipkartStock(): Promise<FlipkartMapping[]> {
    const res = await fetch(`${API_BASE}/flipkart/sync`, { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Flipkart sync failed');
    return json.data;
  },

  async simulateFlipkartOrder(): Promise<string> {
    const res = await fetch(`${API_BASE}/flipkart/simulate-order`, { method: 'POST' });
    const json = await res.json();
    return json.message;
  },

  // INTEGRATIONS & METRICS
  async getIntegrations(): Promise<IntegrationStatus> {
    const res = await fetch(`${API_BASE}/integrations`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch integrations');
    return json.data;
  },

  async updateIntegrations(data: Partial<IntegrationStatus>): Promise<IntegrationStatus> {
    const res = await fetch(`${API_BASE}/integrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update integrations');
    return json.data;
  },

  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch metrics');
    return json.data;
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    const json = await res.json();
    return json.data || [];
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`);
    const json = await res.json();
    return json.data || [];
  },
};
