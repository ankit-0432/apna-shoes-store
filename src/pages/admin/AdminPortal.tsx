import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  RotateCcw,
  Users,
  Palette,
  Layers,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Search,
  CheckCircle2,
  Truck,
  FileText,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useStoreConfig } from '../../context/StoreConfigContext.js';
import { Product, Order, ReturnRequest, StoreCMSConfig, FlipkartMapping } from '../../types/store.js';
import { InvoiceModal } from '../../components/common/InvoiceModal.js';

interface AdminPortalProps {
  onNavigateHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateHome }) => {
  const { user, isAdmin, loginAsDemoAdmin } = useAuth();
  const { config, updateConfig } = useStoreConfig();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'returns' | 'customers' | 'cms' | 'flipkart' | 'integrations'
  >('dashboard');

  // Data states
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [flipkartMappings, setFlipkartMappings] = useState<FlipkartMapping[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & sub-states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [csvInput, setCsvInput] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [statusActionOrder, setStatusActionOrder] = useState<{ id: string; status: string } | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // CMS Editor form
  const [cmsDraft, setCmsDraft] = useState<StoreCMSConfig>(config);
  const [cmsSuccess, setCmsSuccess] = useState(false);

  // Flipkart sync
  const [isSyncingFk, setIsSyncingFk] = useState(false);
  const [fkMessage, setFkMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [m, p, o, r, fk, n, al] = await Promise.all([
        api.getAdminMetrics(),
        api.getProducts({ admin: true }),
        api.getOrders(),
        api.getReturns(),
        api.getFlipkartMappings(),
        api.getNotifications(),
        api.getAuditLogs(),
      ]);
      setMetrics(m);
      setProducts(p);
      setOrders(o);
      setReturns(r);
      setFlipkartMappings(fk);
      setNotifications(n);
      setAuditLogs(al);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    setCmsDraft(config);
  }, [config]);

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.sellingPrice) return;
    try {
      await api.saveProduct(editingProduct as any);
      setEditingProduct(null);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  // Handle CSV Import
  const handleCsvImport = async () => {
    if (!csvInput.trim()) return;
    try {
      const msg = await api.importCsv(csvInput);
      alert(msg);
      setShowCsvModal(false);
      setCsvInput('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'CSV Import failed');
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  // Handle Shipment Creation
  const handleGenerateShipment = async (orderId: string) => {
    try {
      await api.createShipment(orderId, 'Shiprocket — Delhivery Air');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Shipment generation failed');
    }
  };

  // Handle Return Action
  const handleReturnAction = async (returnId: string, status: string, notes?: string) => {
    try {
      await api.updateReturnStatus(returnId, status, notes);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Return update failed');
    }
  };

  // Handle CMS Publish
  const handlePublishCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig(cmsDraft);
      setCmsSuccess(true);
      setTimeout(() => setCmsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update CMS');
    }
  };

  // Handle Flipkart Sync
  const handleFlipkartSync = async () => {
    setIsSyncingFk(true);
    setFkMessage(null);
    try {
      const res = await api.syncFlipkartStock();
      setFlipkartMappings(res);
      setFkMessage(`Successfully synchronized ${res.length} SKUs with Flipkart marketplace!`);
    } catch (err: any) {
      setFkMessage(err.message || 'Failed to sync with Flipkart');
    } finally {
      setIsSyncingFk(false);
    }
  };

  const handleSimulateFlipkartOrder = async () => {
    try {
      const msg = await api.simulateFlipkartOrder();
      setFkMessage(msg);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // If not admin, provide 1-click admin authentication gate
  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 bg-white border border-zinc-200 rounded-3xl shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-zinc-950 font-display">
          Apna Shoes Admin Authentication
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Access the backend management system to control product catalog, orders, Shiprocket shipments, 7-day returns, Flipkart syncing, and dynamic website content.
        </p>
        <button
          onClick={loginAsDemoAdmin}
          className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          <span>Authorize as Super Admin (One-Click)</span>
        </button>
        <button
          onClick={onNavigateHome}
          className="text-xs text-zinc-500 hover:text-zinc-900 underline block mx-auto pt-2"
        >
          Return to Customer Storefront
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  const filteredProducts = products.filter((p) => {
    if (!productSearchQuery.trim()) return true;
    const q = productSearchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-zinc-950 text-white border-b border-zinc-900 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center font-black text-xs">
            A
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">APNA SHOES — Admin Panel</span>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">Role: Super Administrator</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={fetchAdminData}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onNavigateHome}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-zinc-200 p-4 space-y-1 shrink-0">
          {[
            { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
            { id: 'products', label: 'Products & Variants', icon: Package },
            { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
            { id: 'returns', label: '7-Day Return Requests', icon: RotateCcw },
            { id: 'cms', label: 'Website Content Editor', icon: Palette },
            { id: 'flipkart', label: 'Flipkart Integration', icon: Layers },
            { id: 'integrations', label: 'Gateway & Logistics', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Dynamic Admin Body */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-zinc-950 font-display">Store Overview & Performance</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Live database statistics across India</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Revenue</span>
                  <p className="text-2xl font-black text-zinc-950 mt-1 tabular-nums">
                    ₹{metrics?.totalRevenue?.toLocaleString('en-IN') || '0'}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">18% GST Accounted</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Orders</span>
                  <p className="text-2xl font-black text-zinc-950 mt-1 tabular-nums">{orders.length}</p>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {metrics?.pendingOrders || 0} Pending Dispatch
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">7-Day Returns</span>
                  <p className="text-2xl font-black text-zinc-950 mt-1 tabular-nums">{returns.length}</p>
                  <span className="text-[10px] text-orange-600 font-bold">
                    {metrics?.pendingReturns || 0} In Review Queue
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Catalog</span>
                  <p className="text-2xl font-black text-zinc-950 mt-1 tabular-nums">{products.length} Styles</p>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {metrics?.lowStockCount > 0 ? (
                      <span className="text-amber-600 font-bold">⚠️ {metrics.lowStockCount} Variants Low Stock</span>
                    ) : (
                      'All Stocks Healthy'
                    )}
                  </span>
                </div>
              </div>

              {/* Live Integration Cards */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Provider Integrations Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-900">Razorpay Payment Gateway</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Active (Sandbox)</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">UPI, RuPay, Cards & Net Banking enabled</p>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-900">Shiprocket Logistics</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Connected</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">Delhivery & BlueDart AWB generation ready</p>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-900">Flipkart Marketplace</span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">3 SKUs Mapped</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">Authorized Seller Sync Enabled</p>
                  </div>
                </div>
              </div>

              {/* Recent Notifications & Audit Log */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Customer Notifications Log (WhatsApp / SMS)
                </h3>
                <div className="divide-y divide-zinc-100 text-xs">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-zinc-900">{n.title}</span>
                        <p className="text-[11px] text-zinc-500">{n.message}</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(n.timestamp).toLocaleTimeString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 font-display">Footwear Catalog Management</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Manage products, size variants, stock inventory, and bulk CSVs</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/api/products/export-csv"
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>

                  <button
                    onClick={() => setShowCsvModal(true)}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Bulk Import CSV</span>
                  </button>

                  <button
                    onClick={() =>
                      setEditingProduct({
                        name: '',
                        sellingPrice: 1499,
                        originalPrice: 2499,
                        gender: 'men',
                        categorySlug: 'mens-sneakers',
                        badge: 'New Drop',
                        graphicType: 'air-glide',
                        variants: [
                          { id: 'v-new-1', sku: 'APNA-NEW-UK7', size: 'UK 7', colorName: 'Black / Orange', colorHex: '#FF5A1F', stockQuantity: 20 },
                          { id: 'v-new-2', sku: 'APNA-NEW-UK8', size: 'UK 8', colorName: 'Black / Orange', colorHex: '#FF5A1F', stockQuantity: 25 },
                          { id: 'v-new-3', sku: 'APNA-NEW-UK9', size: 'UK 9', colorName: 'Black / Orange', colorHex: '#FF5A1F', stockQuantity: 15 },
                        ],
                      })
                    }
                    className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-orange-500" />
                    <span>Add New Footwear</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter by name or SKU..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Footwear</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock (Variants)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredProducts.map((p) => {
                      const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-zinc-900 block">{p.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">SKU: {p.sku}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-600">{p.categorySlug}</td>
                          <td className="py-3 px-4 capitalize font-medium text-zinc-700">{p.gender}</td>
                          <td className="py-3 px-4 font-bold text-zinc-900 tabular-nums">
                            ₹{p.sellingPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold tabular-nums ${totalStock <= 15 ? 'text-amber-600' : 'text-zinc-700'}`}>
                              {totalStock} units
                            </span>
                            <span className="text-[10px] text-zinc-400 block">({p.variants.length} sizes)</span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 rounded hover:bg-zinc-100"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete product ${p.name}?`)) {
                                  await api.deleteProduct(p.id);
                                  fetchAdminData();
                                }
                              }}
                              className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER FULFILLMENT & INVOICES */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 font-display">Orders & Shipment Management</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Manage customer orders, Shiprocket courier dispatch, and printable GST invoices</p>
                </div>

                <div className="relative max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID or customer..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer & City</th>
                      <th className="py-3 px-4">Amount & Payment</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                      <th className="py-3 px-4">Shiprocket AWB</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-zinc-900 block font-mono">{o.orderNumber}</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(o.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-900 block">{o.customerName}</span>
                          <span className="text-[11px] text-zinc-500">
                            {o.shippingAddress.city}, {o.shippingAddress.state} ({o.shippingAddress.pincode})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-zinc-950 block tabular-nums">
                            ₹{o.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <span className={`text-[10px] font-bold uppercase ${o.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {o.paymentMethod.toUpperCase()} · {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="text-[11px] font-bold py-1 px-2 border border-zinc-300 rounded-md bg-white text-zinc-800"
                          >
                            <option value="order_placed">Order Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered (Activates 7-Day Return)</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {o.shipment?.awbCode ? (
                            <div>
                              <span className="font-mono font-bold text-zinc-900 text-[11px] block">
                                {o.shipment.awbCode}
                              </span>
                              <span className="text-[10px] text-zinc-400">{o.shipment.courierName}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGenerateShipment(o.id)}
                              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded text-[11px] font-bold transition-colors"
                            >
                              + Assign Courier
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedInvoiceOrder(o)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 rounded hover:bg-zinc-100"
                            title="Print Tax Invoice & Packing Slip"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: 7-DAY RETURN REQUESTS */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-zinc-950 font-display">
                  7-Day Return & Refund Authorization Queue
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Review customer return requests within 7-calendar-day window, schedule reverse pickups, and issue refunds
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Return ID & Order</th>
                      <th className="py-3 px-4">Customer & Phone</th>
                      <th className="py-3 px-4">Reason & Details</th>
                      <th className="py-3 px-4">Refund Amount</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Fulfillment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {returns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-zinc-900 block">{ret.orderNumber}</span>
                          <span className="text-[10px] text-zinc-400">ID: {ret.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-900 block">{ret.customerName}</span>
                          <span className="text-zinc-500 text-[11px]">{ret.customerPhone}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-zinc-800 capitalize block">
                            {ret.reason.replace('_', ' ')}
                          </span>
                          <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">{ret.reasonDetails}</p>
                        </td>
                        <td className="py-3 px-4 font-black text-zinc-950 tabular-nums">
                          ₹{ret.refundAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ret.status === 'refund_completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ret.status === 'pickup_scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ret.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          {ret.status === 'requested' && (
                            <button
                              onClick={() => handleReturnAction(ret.id, 'approved', 'Approved by returns desk')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px]"
                            >
                              Approve Pickup
                            </button>
                          )}
                          {ret.status === 'approved' && (
                            <button
                              onClick={() => handleReturnAction(ret.id, 'picked_up', 'Courier picked up package')}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10px]"
                            >
                              Mark Picked Up
                            </button>
                          )}
                          {(ret.status === 'picked_up' || ret.status === 'approved') && (
                            <button
                              onClick={() => handleReturnAction(ret.id, 'refund_completed', 'Refund reconciled')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px]"
                            >
                              Issue Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: WEBSITE CONTENT EDITOR (CMS) */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-zinc-950 font-display">Website Content & Branding Editor</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Update logos, taglines, hero banner copy, promotional text, and brand colors without editing source code.
                </p>
              </div>

              {cmsSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Changes published live! Storefront is instantly updated.</span>
                </div>
              )}

              <form onSubmit={handlePublishCMS} className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Store Name</label>
                    <input
                      type="text"
                      value={cmsDraft.storeName}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, storeName: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={cmsDraft.tagline}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-700 font-bold mb-1">Top Announcement Bar Text</label>
                    <input
                      type="text"
                      value={cmsDraft.announcementText}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, announcementText: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Brand Accent Color (Hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={cmsDraft.brandPrimaryColor}
                        onChange={(e) => setCmsDraft({ ...cmsDraft, brandPrimaryColor: e.target.value })}
                        className="w-10 h-9 p-0.5 border border-zinc-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={cmsDraft.brandPrimaryColor}
                        onChange={(e) => setCmsDraft({ ...cmsDraft, brandPrimaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Free Shipping Threshold (INR)</label>
                    <input
                      type="number"
                      value={cmsDraft.freeShippingThreshold}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-700 font-bold mb-1">Hero Main Headline</label>
                    <input
                      type="text"
                      value={cmsDraft.heroHeadline}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, heroHeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-700 font-bold mb-1">Hero Subheadline</label>
                    <textarea
                      rows={2}
                      value={cmsDraft.heroSubheadline}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, heroSubheadline: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Customer Care Phone</label>
                    <input
                      type="text"
                      value={cmsDraft.contactPhone}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">Customer Care Email</label>
                    <input
                      type="email"
                      value={cmsDraft.contactEmail}
                      onChange={(e) => setCmsDraft({ ...cmsDraft, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-zinc-950 text-white font-bold text-xs rounded-xl shadow hover:bg-zinc-800 transition-colors"
                  >
                    Publish Changes Live
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: FLIPKART MARKETPLACE INTEGRATION */}
          {activeTab === 'flipkart' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 font-display">
                    Flipkart Authorized Seller Integration
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Map SKUs to Flipkart FSN identifiers and synchronize inventory across platforms
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateFlipkartOrder}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Simulate Marketplace Order
                  </button>

                  <button
                    onClick={handleFlipkartSync}
                    disabled={isSyncingFk}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFk ? 'animate-spin' : ''}`} />
                    <span>{isSyncingFk ? 'Syncing...' : 'Sync Stock Now'}</span>
                  </button>
                </div>
              </div>

              {fkMessage && (
                <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs">
                  {fkMessage}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Internal SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Flipkart FSN</th>
                      <th className="py-3 px-4">Internal Stock</th>
                      <th className="py-3 px-4">Flipkart Stock</th>
                      <th className="py-3 px-4">Sync Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {flipkartMappings.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">{m.internalSku}</td>
                        <td className="py-3 px-4 text-zinc-800">{m.productName}</td>
                        <td className="py-3 px-4 font-mono text-blue-600">{m.flipkartFsn}</td>
                        <td className="py-3 px-4 tabular-nums font-bold text-zinc-900">{m.internalStock}</td>
                        <td className="py-3 px-4 tabular-nums font-bold text-zinc-900">{m.flipkartStock}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: INTEGRATIONS & GATEWAY SETTINGS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-zinc-950 font-display">Integrations & Credentials</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Configure live credentials for Razorpay, Shiprocket, and Google Maps
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Razorpay Settings */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <h3 className="text-sm font-bold text-zinc-900">Razorpay Payment Gateway</h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      SANDBOX ACTIVE
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500">
                    Online payments (UPI, RuPay, Credit/Debit Cards, Net Banking) are verified server-side with HMAC SHA256 signatures.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Key ID</label>
                      <input
                        type="text"
                        readOnly
                        value={process.env.RAZORPAY_KEY_ID || 'rzp_test_apnashoes2026'}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-mono text-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Key Secret</label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••••••••••••"
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-mono text-zinc-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Shiprocket Settings */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <h3 className="text-sm font-bold text-zinc-900">Shiprocket Courier Logistics</h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      INTEGRATED
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500">
                    Automated airway bill (AWB) generation, Delhivery / BlueDart routing, and real-time reverse pickup for 7-day returns.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Logistics Account</label>
                      <input
                        type="text"
                        readOnly
                        value="logistics@apnashoes.in"
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Default Dispatch Hub</label>
                      <input
                        type="text"
                        readOnly
                        value="Noida Central Warehouse (Sector 63)"
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Edit / Create Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-zinc-950 font-display mb-4">
              {editingProduct.id ? 'Edit Footwear Model' : 'Add New Footwear Model'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Selling Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.sellingPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Original Price (INR)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Gender *</label>
                  <select
                    value={editingProduct.gender || 'men'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Category Slug</label>
                  <select
                    value={editingProduct.categorySlug || 'mens-sneakers'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categorySlug: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                  >
                    <option value="mens-sneakers">Men's Sneakers</option>
                    <option value="womens-sneakers">Women's Sneakers</option>
                    <option value="kids-shoes">Kids' Shoes</option>
                    <option value="running-shoes">Running Shoes</option>
                    <option value="casual-sneakers">Casual Sneakers</option>
                    <option value="high-top-sneakers">High-Top Sneakers</option>
                    <option value="walking-shoes">Walking Shoes</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-bold"
                >
                  Save Footwear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200">
            <h3 className="text-base font-black text-zinc-950 font-display mb-2">Bulk CSV Product Import</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Paste CSV text with headers: <code>SKU,Name,Category,Gender,SellingPrice,OriginalPrice</code>
            </p>
            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={`APNA-AG-09,"Apna Apex Turbo",mens-sneakers,men,1599,2999\nAPNA-RW-10,"Apna Cloud Walk",walking-shoes,women,1299,2299`}
              className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl font-mono text-xs focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvImport}
                className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-bold"
              >
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal for Selected Order */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
};
