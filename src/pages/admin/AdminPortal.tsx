import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  RotateCcw,
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
  Image as ImageIcon,
  LogOut,
  X,
  Star,
  Check,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { useStoreConfig } from '../../context/StoreConfigContext.js';
import { Product, Order, ReturnRequest, StoreCMSConfig, FlipkartMapping, HeroBanner } from '../../types/store.js';
import { InvoiceModal } from '../../components/common/InvoiceModal.js';
import { SneakerGraphic } from '../../components/common/SneakerGraphic.js';

const SNEAKER_PHOTO_PRESETS = [
  { label: 'Red-Orange Active Runner', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Black Street High-Top', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Clean White Modern Low', url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pastel Chunky Statement', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Stealth Black Mesh Runner', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Amber Urban Kicks', url: 'https://images.unsplash.com/photo-1514989940743-460b4b35b2b2?auto=format&fit=crop&w=800&q=80' },
  { label: 'White Canvas Low Classic', url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80' },
  { label: 'Retro Multi-Color Court', url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gym Training Sneaker', url: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kids Active Bolt Sports', url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80' },
  { label: 'Light Walking Slip-On', url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Outdoor Rugged Tread', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vintage Red Canvas High', url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Minimalist City Walk Grey', url: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=800&q=80' },
  { label: 'Electric Blue Sprinter', url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80' },
  { label: 'Carbon Speed Athletic', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80' },
];

const DEFAULT_5_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    headline: 'Har Kadam, Apna Style — Indian Streetwear Drop',
    subheadline: 'Designed for comfort, engineered for endurance. Over 50+ fresh Indian silhouettes ready to ship across 19,000+ pin codes.',
    offerBadge: '🔥 FLAT 40% OFF · USE CODE APNA40',
    badge: 'DROP 2026 LIVE',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Shop New Drops',
    ctaLink: 'all',
    accentColor: '#FF5A1F',
    graphicType: 'air-glide',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'banner-2',
    headline: 'Retro Dunk High-Tops — Ankle Armor Edition',
    subheadline: 'Classic basketball silhouette paired with cloud-foam cushioning for all-day campus and street wear.',
    offerBadge: '⚡ BUY 1 GET 1 50% OFF · LIMITED STOCK',
    badge: 'CAMPUS FAVORITE',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Explore High-Tops',
    ctaLink: 'high-top-sneakers',
    accentColor: '#2563EB',
    graphicType: 'high-top',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'banner-3',
    headline: 'Aero Speed Marathon Runners — Carbon Sprint Sole',
    subheadline: 'Featherlight breathable mesh upper with high-energy rebound for early morning 10K runs and gym sessions.',
    offerBadge: '🎉 FESTIVE MEGA OFFER: FLAT ₹300 OFF',
    badge: 'TOP RATED 4.9 ★',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Shop Running Gear',
    ctaLink: 'running-shoes',
    accentColor: '#059669',
    graphicType: 'aero-runner',
    isActive: true,
    displayOrder: 3,
  },
  {
    id: 'banner-4',
    headline: 'Pastel Minimalist Kicks — Everyday Chic',
    subheadline: 'Clean chalk white and lavender tones that match any outfit from college lectures to casual evening dinners.',
    offerBadge: '✨ SPECIAL BUNDLE: FREE SOCKS & EXTRA LACES',
    badge: 'WOMEN’S BESTSELLER',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Shop Women’s Kicks',
    ctaLink: 'womens',
    accentColor: '#DB2777',
    graphicType: 'retro-dunk',
    isActive: true,
    displayOrder: 4,
  },
  {
    id: 'banner-5',
    headline: 'Junior Bolt Kids Athletic Sneakers',
    subheadline: 'Tough scuff-resistant toe guards, zero-slip rubber soles, and electric colorways for school & playground adventures.',
    offerBadge: '🏷️ FLAT ₹500 OFF ON 2 PAIRS · CODE KIDSCOOL',
    badge: 'KIDS SPECIAL',
    imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'Shop Kids Collection',
    ctaLink: 'kids',
    accentColor: '#F59E0B',
    graphicType: 'junior-bolt',
    isActive: true,
    displayOrder: 5,
  },
];

interface AdminPortalProps {
  onNavigateHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateHome }) => {
  const { user, isAdmin, loginAsDemoAdmin, loginAsDemoCustomer, logout } = useAuth();
  const { config, updateConfig } = useStoreConfig();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'returns' | 'cms' | 'flipkart' | 'integrations'
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
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterTab, setOrderFilterTab] = useState<'all' | 'pending_awb' | 'confirmed' | 'delivered'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [showPresetGallery, setShowPresetGallery] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AWB Confirmation Modal
  const [confirmAwbModalOrder, setConfirmAwbModalOrder] = useState<Order | null>(null);
  const [awbInputCourier, setAwbInputCourier] = useState('Shiprocket — Delhivery Air');
  const [awbInputCode, setAwbInputCode] = useState('');

  // CMS Editor form & 5-Banner Slideshow Manager
  const [cmsDraft, setCmsDraft] = useState<StoreCMSConfig>(() => ({
    ...config,
    heroBanners: config.heroBanners && config.heroBanners.length > 0 ? config.heroBanners : DEFAULT_5_BANNERS,
  }));
  const [activeBannerEditIndex, setActiveBannerEditIndex] = useState(0);
  const [showBannerPresetSelector, setShowBannerPresetSelector] = useState(false);
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
    const initialBanners = (config.heroBanners && config.heroBanners.length > 0)
      ? config.heroBanners
      : DEFAULT_5_BANNERS;
    setCmsDraft({
      ...config,
      heroBanners: initialBanners,
    });
  }, [config]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Exit / Delete Admin Mode
  const handleExitAdminMode = () => {
    loginAsDemoCustomer();
    showFeedback('Admin Mode closed. Switched to normal customer shopping experience.');
    setTimeout(() => {
      onNavigateHome();
    }, 300);
  };

  // Handle Product Save (Updating Photos, Prices, and Context data)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.sellingPrice) return;
    try {
      const originalPrice = Number(editingProduct.originalPrice) || Number(editingProduct.sellingPrice) * 1.5;
      const sellingPrice = Number(editingProduct.sellingPrice);
      const discountPercentage = Math.round((1 - sellingPrice / originalPrice) * 100);

      await api.saveProduct({
        ...editingProduct,
        sellingPrice,
        originalPrice,
        discountPercentage,
        images: editingProduct.images || [],
      } as any);

      showFeedback(`Saved footwear "${editingProduct.name}" with photos & pricing!`);
      setEditingProduct(null);
      setNewImageUrl('');
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Error saving product', 'error');
    }
  };

  // Photo Upload Handler (Local file to Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [...(editingProduct.images || []), dataUrl],
        });
        showFeedback('Photo uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Photo URL Handler
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: [...(editingProduct.images || []), newImageUrl.trim()],
    });
    setNewImageUrl('');
    showFeedback('Photo URL added!');
  };

  // Delete Photo
  const handleDeletePhoto = (index: number) => {
    if (!editingProduct) return;
    const updated = [...(editingProduct.images || [])];
    updated.splice(index, 1);
    setEditingProduct({ ...editingProduct, images: updated });
    showFeedback('Photo removed.');
  };

  // Set as Primary Photo
  const handleSetPrimaryPhoto = (index: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const updated = [...editingProduct.images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setEditingProduct({ ...editingProduct, images: updated });
    showFeedback('Set as cover photo.');
  };

  // Trigger Delete Confirmation Modal
  const handleDeleteProduct = (product: Product) => {
    setDeleteCandidate(product);
  };

  // Execute Permanent Delete
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteProduct(deleteCandidate.id);
      showFeedback(`Deleted "${deleteCandidate.name}" (${deleteCandidate.sku}) from catalog.`);
      if (editingProduct?.id === deleteCandidate.id) {
        setEditingProduct(null);
      }
      setDeleteCandidate(null);
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to delete product', 'error');
    }
  };

  // Handle CSV Import
  const handleCsvImport = async () => {
    if (!csvInput.trim()) return;
    try {
      const msg = await api.importCsv(csvInput);
      showFeedback(msg);
      setShowCsvModal(false);
      setCsvInput('');
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'CSV Import failed', 'error');
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

  // Handle Shipment Creation / AWB Assignment
  const handleOpenConfirmAwbModal = (order: Order) => {
    setConfirmAwbModalOrder(order);
    setAwbInputCourier(order.shipment?.courierName || 'Shiprocket — Delhivery Air');
    setAwbInputCode(order.shipment?.awbCode || `DELHIVERY-${Math.floor(100000000 + Math.random() * 900000000)}`);
  };

  const handleConfirmAndAssignAwb = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!confirmAwbModalOrder) return;
    try {
      await api.createShipment(confirmAwbModalOrder.id, awbInputCourier, awbInputCode);
      showFeedback(`Order ${confirmAwbModalOrder.orderNumber} confirmed with AWB ${awbInputCode}!`);
      setConfirmAwbModalOrder(null);
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'AWB assignment failed', 'error');
    }
  };

  const handleGenerateShipment = async (orderId: string) => {
    try {
      await api.createShipment(orderId, 'Shiprocket — Delhivery Air');
      showFeedback('Courier assigned & AWB generated!');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Shipment generation failed');
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const sample = `SKU,Name,Category,Gender,SellingPrice,OriginalPrice,Discount,Stock,Badge,Images
APNA-AG-SAMPLE,"Apna Air Glide 01",running-shoes,men,1499,2499,40%,25,"New Drop","https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
APNA-HT-SAMPLE,"Apna Retro Dunk High",high-top-sneakers,unisex,1799,2999,40%,30,"Bestseller","https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"
APNA-WN-SAMPLE,"Apna Metro Low Women",womens-sneakers,women,1299,2199,41%,20,"Trending","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_apna_shoes_catalog.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV File Upload
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvInput(text);
        showFeedback(`Loaded "${file.name}" with ${text.split('\n').filter(Boolean).length - 1} footwear rows!`);
      }
    };
    reader.readAsText(file);
  };

  // Update specific banner field in cmsDraft
  const handleUpdateBannerField = (index: number, field: keyof HeroBanner, value: any) => {
    const banners = [...(cmsDraft.heroBanners || DEFAULT_5_BANNERS)];
    if (!banners[index]) {
      banners[index] = { ...(DEFAULT_5_BANNERS[index] || DEFAULT_5_BANNERS[0]) };
    }
    banners[index] = { ...banners[index], [field]: value };
    setCmsDraft({ ...cmsDraft, heroBanners: banners });
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
          Access the backend management system to control product catalog photos, prices, orders, shipments, returns, and dynamic website content.
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
    if (orderFilterTab === 'pending_awb' && o.shipment?.awbCode) return false;
    if (orderFilterTab === 'confirmed' && (!o.shipment?.awbCode || o.orderStatus === 'delivered')) return false;
    if (orderFilterTab === 'delivered' && o.orderStatus !== 'delivered') return false;

    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.shipment?.awbCode && o.shipment.awbCode.toLowerCase().includes(q))
    );
  });

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.categorySlug !== productCategoryFilter) {
      return false;
    }
    if (!productSearchQuery.trim()) return true;
    const q = productSearchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.categorySlug.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : 'bg-red-950 text-red-100 border-red-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Admin Header with EXIT / DELETE ADMIN MODE button */}
      <header className="bg-zinc-950 text-white border-b border-zinc-900 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-xs shadow-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">APNA SHOES — Admin Panel</span>
              <span className="text-[10px] font-extrabold uppercase bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded border border-orange-500/30">
                ACTIVE
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">50+ Catalog Footwear & Media Control</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            onClick={fetchAdminData}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          {/* EXIT / DELETE ADMIN MODE BUTTON */}
          <button
            onClick={handleExitAdminMode}
            className="px-3.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Deactivate admin privileges and return to customer view"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin Mode</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-zinc-200 p-4 space-y-1 shrink-0 flex flex-col justify-between">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
              { id: 'returns', label: `7-Day Returns (${returns.length})`, icon: RotateCcw },
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
          </div>

          {/* Quick Exit Admin Mode from Sidebar */}
          <div className="pt-4 border-t border-zinc-200 space-y-2">
            <button
              onClick={handleExitAdminMode}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="w-4 h-4" />
                <span>Turn Off Admin Mode</span>
              </span>
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Exit</span>
            </button>
          </div>
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
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Catalog Models</span>
                  <p className="text-2xl font-black text-zinc-950 mt-1 tabular-nums">{products.length} Styles</p>
                  <span className="text-[10px] text-emerald-600 font-bold">50+ Catalog Ready</span>
                </div>
              </div>

              {/* Provider Integrations */}
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
                    <p className="text-[11px] text-zinc-500 mt-1">UPI, RuPay, Cards & Net Banking verified</p>
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
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Mapped</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">Authorized Seller Sync Enabled</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS & PHOTOS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 font-display">
                    Footwear Catalog & Photo Manager ({products.length} Models)
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Add photos, update prices, manage size variants, and edit product specifications
                  </p>
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
                        originalPrice: 2799,
                        gender: 'men',
                        categorySlug: 'mens-sneakers',
                        badge: 'New Drop',
                        graphicType: 'air-glide',
                        images: [],
                        variants: [
                          { id: `v-${Date.now()}-1`, sku: `APNA-NEW-UK7`, size: 'UK 7', colorName: 'Jet Black / Solar Orange', colorHex: '#FF5A1F', stockQuantity: 20 },
                          { id: `v-${Date.now()}-2`, sku: `APNA-NEW-UK8`, size: 'UK 8', colorName: 'Jet Black / Solar Orange', colorHex: '#FF5A1F', stockQuantity: 25 },
                          { id: `v-${Date.now()}-3`, sku: `APNA-NEW-UK9`, size: 'UK 9', colorName: 'Jet Black / Solar Orange', colorHex: '#FF5A1F', stockQuantity: 18 },
                        ],
                        specifications: {
                          'Sole Material': 'Dual-Density Sculpted EVA',
                          'Upper Material': 'Engineered Knit Mesh',
                          'Closure': 'Lace-Up',
                        },
                      })
                    }
                    className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-orange-500" />
                    <span>Add New Footwear</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search 50+ shoes by name, SKU..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-2xs"
                >
                  <option value="all">All Categories ({products.length})</option>
                  <option value="mens-sneakers">Men's Sneakers</option>
                  <option value="womens-sneakers">Women's Sneakers</option>
                  <option value="kids-shoes">Kids' Shoes</option>
                  <option value="running-shoes">Running Shoes</option>
                  <option value="casual-sneakers">Casual Sneakers</option>
                  <option value="high-top-sneakers">High-Top Sneakers</option>
                  <option value="sports-shoes">Sports Shoes</option>
                  <option value="walking-shoes">Walking Shoes</option>
                </select>

                <div className="text-[11px] text-zinc-500 font-medium">
                  Showing <strong className="text-zinc-900">{filteredProducts.length}</strong> shoes
                </div>
              </div>

              {/* Products Table with Photo Preview & Delete */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Footwear Name & SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Original MRP</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredProducts.map((p) => {
                      const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                      const hasPhotos = p.images && p.images.length > 0;

                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/50">
                          {/* Photo Thumbnail */}
                          <td className="py-2 px-4 w-16">
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center p-1">
                              {hasPhotos ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <SneakerGraphic
                                  type={p.graphicType}
                                  accentColor="#FF5A1F"
                                  className="w-full h-full"
                                />
                              )}
                            </div>
                          </td>

                          {/* Name & SKU */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-zinc-950 block">{p.name}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono mt-0.5">
                              <span>SKU: {p.sku}</span>
                              {hasPhotos && (
                                <span className="text-orange-600 font-semibold bg-orange-50 px-1 rounded">
                                  {p.images.length} Photo{p.images.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-zinc-600">
                            <span className="capitalize">{p.gender}</span> · {p.categorySlug}
                          </td>

                          {/* Selling Price */}
                          <td className="py-3 px-4 font-black text-zinc-950 tabular-nums">
                            ₹{p.sellingPrice.toLocaleString('en-IN')}
                          </td>

                          {/* Original MRP */}
                          <td className="py-3 px-4 text-zinc-400 line-through tabular-nums">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </td>

                          {/* Stock */}
                          <td className="py-3 px-4">
                            <span className={`font-semibold tabular-nums ${totalStock <= 15 ? 'text-amber-600' : 'text-zinc-700'}`}>
                              {totalStock} pairs
                            </span>
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                              title="Edit product photos, prices, variants"
                            >
                              <Edit className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                              title="Delete footwear model from store catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Delete</span>
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
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Latest customer orders, Unique Order Codes, Shiprocket AWB assignment, and GST tax invoices
                  </p>
                </div>

                <div className="relative max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, AWB..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Order Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setOrderFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    orderFilterTab === 'all'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilterTab('pending_awb')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                    orderFilterTab === 'pending_awb'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Pending AWB Confirmation ({orders.filter(o => !o.shipment?.awbCode).length})</span>
                </button>
                <button
                  onClick={() => setOrderFilterTab('confirmed')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                    orderFilterTab === 'confirmed'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Confirmed & In-Transit ({orders.filter(o => o.shipment?.awbCode && o.orderStatus !== 'delivered').length})</span>
                </button>
                <button
                  onClick={() => setOrderFilterTab('delivered')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    orderFilterTab === 'delivered'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  Delivered ({orders.filter(o => o.orderStatus === 'delivered').length})
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Order Code & Date</th>
                      <th className="py-3 px-4">Customer & Destination</th>
                      <th className="py-3 px-4">Amount & Payment</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                      <th className="py-3 px-4">Airway Bill (AWB) Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-zinc-950 block font-mono text-xs">{o.orderNumber}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-900 block">{o.customerName}</span>
                          <span className="text-[11px] text-zinc-500">
                            {o.shippingAddress.city}, {o.shippingAddress.state} ({o.shippingAddress.pincode}) · {o.customerPhone}
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
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[11px]">
                                  {o.shipment.awbCode}
                                </span>
                                <button
                                  onClick={() => handleOpenConfirmAwbModal(o)}
                                  className="text-[10px] text-zinc-500 hover:text-zinc-900 underline"
                                  title="Edit AWB details"
                                >
                                  Edit
                                </button>
                              </div>
                              <span className="text-[10px] text-zinc-500 block truncate max-w-[180px]">
                                {o.shipment.courierName}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-[9.5px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                                Awaiting AWB
                              </span>
                              <button
                                onClick={() => handleOpenConfirmAwbModal(o)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirm & Assign AWB</span>
                              </button>
                            </div>
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

          {/* TAB 5: WEBSITE CONTENT & BRANDING EDITOR (CMS) */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-zinc-950 font-display">Website Content & Branding Editor</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage the 5 storefront slideshow banners (photos, offers, copy), brand colors, announcement bar, and store details.
                </p>
              </div>

              {cmsSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Website content & 5 hero banners published live! Storefront is updated immediately.</span>
                </div>
              )}

              <form onSubmit={handlePublishCMS} className="space-y-6">
                {/* 1. FIVE HERO SLIDESHOW BANNERS MANAGER */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-zinc-950 font-display flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span>Front 5-Hero Slideshow Banners Manager</span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        These 5 banners rotate on the main storefront homepage. Change photos, discount offers, and text.
                      </p>
                    </div>

                    <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                      5 Active Banners
                    </span>
                  </div>

                  {/* Banner Selector Tabs (Slide 1 to 5) */}
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const b = (cmsDraft.heroBanners || DEFAULT_5_BANNERS)[idx] || DEFAULT_5_BANNERS[idx];
                      const isCurrent = idx === activeBannerEditIndex;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveBannerEditIndex(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            isCurrent
                              ? 'bg-zinc-950 text-white shadow-md ring-2 ring-orange-500/30'
                              : 'bg-zinc-100 text-zinc-750 hover:bg-zinc-200'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: b?.accentColor || '#FF5A1F' }}
                          />
                          <span>Slide {idx + 1}: {b?.badge || `Banner ${idx + 1}`}</span>
                          {b?.isActive === false && (
                            <span className="text-[9px] text-zinc-400">(Inactive)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Editor for Currently Selected Banner */}
                  {(() => {
                    const currentBanner = (cmsDraft.heroBanners || DEFAULT_5_BANNERS)[activeBannerEditIndex] || DEFAULT_5_BANNERS[activeBannerEditIndex];
                    const bannerIdx = activeBannerEditIndex;

                    return (
                      <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                          <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
                            Editing Slide #{bannerIdx + 1} Configuration
                          </span>

                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentBanner.isActive !== false}
                              onChange={(e) => handleUpdateBannerField(bannerIdx, 'isActive', e.target.checked)}
                              className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span>Active in Homepage Slideshow</span>
                          </label>
                        </div>

                        {/* Live Mini Preview Box */}
                        <div className="p-4 bg-zinc-950 text-white rounded-xl border border-zinc-800 relative overflow-hidden">
                          <div
                            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none"
                            style={{ backgroundColor: currentBanner.accentColor || '#FF5A1F' }}
                          />
                          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                                style={{ backgroundColor: currentBanner.accentColor || '#FF5A1F', color: '#fff' }}
                              >
                                {currentBanner.offerBadge || 'OFFER BADGE'}
                              </span>
                              <h4 className="font-extrabold text-sm text-white">{currentBanner.headline}</h4>
                              <p className="text-[11px] text-zinc-400 line-clamp-2">{currentBanner.subheadline}</p>
                              <div className="pt-1">
                                <span className="inline-block px-3 py-1 bg-white text-zinc-950 font-bold text-[10px] rounded-lg">
                                  {currentBanner.ctaText} →
                                </span>
                              </div>
                            </div>

                            <div className="w-24 h-24 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden p-1 flex items-center justify-center">
                              {currentBanner.imageUrl ? (
                                <img
                                  src={currentBanner.imageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <SneakerGraphic type={currentBanner.graphicType || 'air-glide'} accentColor="#FF5A1F" className="w-full h-full" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Banner Fields Form Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block text-zinc-700 font-bold mb-1">
                              Promotional Offer Badge (e.g. FLAT 40% OFF, BUY 1 GET 1) *
                            </label>
                            <input
                              type="text"
                              value={currentBanner.offerBadge || ''}
                              onChange={(e) => handleUpdateBannerField(bannerIdx, 'offerBadge', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                              placeholder="e.g. 🔥 FLAT 40% OFF · CODE APNA40"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-700 font-bold mb-1">
                              Campaign Tag / Badge *
                            </label>
                            <input
                              type="text"
                              value={currentBanner.badge || ''}
                              onChange={(e) => handleUpdateBannerField(bannerIdx, 'badge', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                              placeholder="e.g. DROP 2026 LIVE / CAMPUS FAVORITE"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-zinc-700 font-bold mb-1">
                              Banner Main Headline *
                            </label>
                            <input
                              type="text"
                              value={currentBanner.headline || ''}
                              onChange={(e) => handleUpdateBannerField(bannerIdx, 'headline', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold text-sm text-zinc-900"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-zinc-700 font-bold mb-1">
                              Banner Subheadline / Description *
                            </label>
                            <textarea
                              rows={2}
                              value={currentBanner.subheadline || ''}
                              onChange={(e) => handleUpdateBannerField(bannerIdx, 'subheadline', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-700 font-bold mb-1">
                              CTA Button Text
                            </label>
                            <input
                              type="text"
                              value={currentBanner.ctaText || ''}
                              onChange={(e) => handleUpdateBannerField(bannerIdx, 'ctaText', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg font-semibold"
                              placeholder="e.g. Shop New Drops"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-700 font-bold mb-1">
                              CTA Destination Category / Link
                            </label>
                            <select
                              value={currentBanner.ctaLink || 'all'}
                              onChange={(e) => handleUpdateBannerField(bannerIdx, 'ctaLink', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg font-semibold"
                            >
                              <option value="all">All Shoes Catalog</option>
                              <option value="mens">Men's Sneakers</option>
                              <option value="womens">Women's Sneakers</option>
                              <option value="kids">Kids' Shoes</option>
                              <option value="running-shoes">Running Shoes</option>
                              <option value="high-top-sneakers">High-Top Sneakers</option>
                              <option value="casual-sneakers">Casual Street Kicks</option>
                              <option value="bestsellers">Bestsellers</option>
                              <option value="sale">Sale & Discount Drops</option>
                            </select>
                          </div>

                          {/* Image URL & Preset Selector */}
                          <div className="sm:col-span-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-zinc-700 font-bold">
                                Slide Sneaker Image URL / Upload *
                              </label>
                              <button
                                type="button"
                                onClick={() => setShowBannerPresetSelector(!showBannerPresetSelector)}
                                className="text-orange-600 font-bold text-[11px] hover:underline"
                              >
                                {showBannerPresetSelector ? '▲ Hide Presets' : '▼ Select from Curated Sneaker Photos'}
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={currentBanner.imageUrl || ''}
                                onChange={(e) => handleUpdateBannerField(bannerIdx, 'imageUrl', e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs"
                                placeholder="https://images.unsplash.com/..."
                              />
                              <label className="px-3.5 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        handleUpdateBannerField(bannerIdx, 'imageUrl', reader.result as string);
                                        showFeedback(`Uploaded image for Slide ${bannerIdx + 1}!`);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Preset Sneaker Photos Grid */}
                            {showBannerPresetSelector && (
                              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 bg-white rounded-xl border border-zinc-200">
                                {SNEAKER_PHOTO_PRESETS.map((preset, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateBannerField(bannerIdx, 'imageUrl', preset.url);
                                      showFeedback(`Set "${preset.label}" for Slide ${bannerIdx + 1}!`);
                                    }}
                                    className="aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-orange-500 hover:ring-2 hover:ring-orange-500/20 transition-all text-left bg-zinc-50 relative group"
                                    title={preset.label}
                                  >
                                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Check className="w-4 h-4 text-white font-bold" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-zinc-700 font-bold mb-1">
                              Slide Accent Glow Color (Hex)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={currentBanner.accentColor || '#FF5A1F'}
                                onChange={(e) => handleUpdateBannerField(bannerIdx, 'accentColor', e.target.value)}
                                className="w-10 h-9 p-0.5 border border-zinc-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={currentBanner.accentColor || '#FF5A1F'}
                                onChange={(e) => handleUpdateBannerField(bannerIdx, 'accentColor', e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg font-mono text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. GENERAL STORE BRANDING & ANNOUNCEMENT BAR */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-6">
                  <h3 className="text-base font-black text-zinc-950 font-display border-b border-zinc-100 pb-3">
                    Store Branding & Announcement Bar
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">Store Name</label>
                      <input
                        type="text"
                        value={cmsDraft.storeName}
                        onChange={(e) => setCmsDraft({ ...cmsDraft, storeName: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">Tagline</label>
                      <input
                        type="text"
                        value={cmsDraft.tagline}
                        onChange={(e) => setCmsDraft({ ...cmsDraft, tagline: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-700 font-bold mb-1">Top Announcement Bar Text & Promo</label>
                      <input
                        type="text"
                        value={cmsDraft.announcementText}
                        onChange={(e) => setCmsDraft({ ...cmsDraft, announcementText: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">Brand Primary Color (Hex)</label>
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
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={cmsDraft.gstNumber || ''}
                        onChange={(e) => setCmsDraft({ ...cmsDraft, gstNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">Support WhatsApp Number</label>
                      <input
                        type="text"
                        value={cmsDraft.whatsappNumber || ''}
                        onChange={(e) => setCmsDraft({ ...cmsDraft, whatsappNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-zinc-950 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-zinc-850 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      <span>Publish Website & 5 Banners Live</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: FLIPKART INTEGRATION */}
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
                  </div>
                </div>

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
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Add / Edit Modal with PHOTO GALLERY & PRICING MANAGER */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-lg font-black text-zinc-950 font-display">
                  {editingProduct.id ? 'Edit Footwear & Manage Photos' : 'Add New Footwear Model'}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Update selling price, original MRP, multiple photos, size variants, and specifications.
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* SECTION 1: PRODUCT PHOTOS MANAGER */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                      Product Photos ({editingProduct.images?.length || 0} Added)
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">First photo is used as main store cover</span>
                </div>

                {/* Add Photo by URL or File Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste Image URL..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!newImageUrl.trim()}
                      className="px-3 py-2 bg-zinc-900 text-white rounded-lg font-bold text-xs hover:bg-zinc-800 disabled:opacity-40 transition-colors shrink-0"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Local File Upload */}
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-zinc-300 hover:border-orange-500 rounded-lg cursor-pointer text-xs font-semibold text-zinc-700 hover:text-orange-600 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-orange-600" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Curated Footwear Presets Bar (1-Click Photo Assignment) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>Curated Sneaker Presets (Click to Add Photo):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPresetGallery(!showPresetGallery)}
                      className="text-[10.5px] text-orange-600 font-bold hover:underline"
                    >
                      {showPresetGallery ? '▲ Hide Gallery' : `▼ Show 16 Presets`}
                    </button>
                  </div>

                  {showPresetGallery && (
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 bg-white rounded-xl border border-zinc-200">
                      {SNEAKER_PHOTO_PRESETS.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              images: [...(editingProduct.images || []), preset.url],
                            });
                            showFeedback(`Added "${preset.label}" photo!`);
                          }}
                          className="group relative aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-orange-500 hover:ring-2 hover:ring-orange-500/20 transition-all text-left bg-zinc-50"
                          title={`Click to add: ${preset.label}`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white font-bold" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photo Gallery Thumbnails */}
                {editingProduct.images && editingProduct.images.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {editingProduct.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`group relative aspect-[4/3] rounded-xl overflow-hidden border bg-white flex items-center justify-center p-1.5 shadow-2xs ${
                          idx === 0 ? 'border-orange-600 ring-2 ring-orange-500/20' : 'border-zinc-200'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Product photo ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />

                        {/* Badges & Actions Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                          <div className="flex justify-between items-center">
                            {idx === 0 ? (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white px-1.5 py-0.5 rounded">
                                Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryPhoto(idx)}
                                className="text-[9px] font-bold bg-white text-zinc-900 hover:bg-orange-500 hover:text-white px-1.5 py-0.5 rounded transition-colors"
                              >
                                Set Cover
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(idx)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase bg-orange-600 text-white px-1 py-0.2 rounded group-hover:hidden">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-zinc-200 text-center text-zinc-400 text-xs">
                    No custom photos attached yet. The store will render the dynamic vector silhouette below:
                    <div className="w-24 h-16 mx-auto mt-2">
                      <SneakerGraphic
                        type={editingProduct.graphicType || 'air-glide'}
                        accentColor="#FF5A1F"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: BASIC INFO & PRICING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Footwear Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs font-semibold"
                    placeholder="e.g. Apna Air Glide 01 Sneaker"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Selling Price (INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProduct.sellingPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold text-zinc-950"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Original Price / MRP (INR) *</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-zinc-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Gender *</label>
                  <select
                    value={editingProduct.gender || 'men'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Category *</label>
                  <select
                    value={editingProduct.categorySlug || 'mens-sneakers'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categorySlug: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium"
                  >
                    <option value="mens-sneakers">Men's Sneakers</option>
                    <option value="womens-sneakers">Women's Sneakers</option>
                    <option value="kids-shoes">Kids' Shoes</option>
                    <option value="running-shoes">Running Shoes</option>
                    <option value="casual-sneakers">Casual Sneakers</option>
                    <option value="high-top-sneakers">High-Top Sneakers</option>
                    <option value="sports-shoes">Sports Shoes</option>
                    <option value="walking-shoes">Walking Shoes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Badge Tag</label>
                  <select
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: (e.target.value as any) || undefined })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium"
                  >
                    <option value="">No Badge</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New Drop">New Drop</option>
                    <option value="Trending">Trending</option>
                    <option value="Hot Deal">Hot Deal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Graphic Vector Silhouette</label>
                  <select
                    value={editingProduct.graphicType || 'air-glide'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, graphicType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg font-medium"
                  >
                    <option value="air-glide">Air Glide (Street Silhouette)</option>
                    <option value="high-top">High-Top (Basketball Silhouette)</option>
                    <option value="aero-runner">Aero Runner (Speed Foam)</option>
                    <option value="retro-dunk">Retro Dunk (Court Classic)</option>
                    <option value="street-chunky">Street Chunky (Platform)</option>
                    <option value="junior-bolt">Junior Bolt (Kids Sport)</option>
                    <option value="campus-pulse">Campus Pulse (College Canvas)</option>
                    <option value="velocity-pro">Velocity Pro (Sprinter)</option>
                    <option value="flex-slipon">Flex Slip-On (Comfort Walk)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg"
                    placeholder="Short product story and features..."
                  />
                </div>
              </div>

              {/* SECTION 3: SIZES & STOCK VARIANT MANAGER */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-900 text-[11px] uppercase tracking-wider">
                    Size Variants & Stock Quantities
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold">
                    Total: {editingProduct.variants?.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0) || 0} pairs
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {editingProduct.variants?.map((v, idx) => (
                    <div key={v.id || idx} className="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-2xs">
                      <span className="text-[10.5px] font-bold text-zinc-800 block">{v.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stockQuantity}
                        onChange={(e) => {
                          const updated = [...(editingProduct.variants || [])];
                          updated[idx] = { ...updated[idx], stockQuantity: Math.max(0, parseInt(e.target.value) || 0) };
                          setEditingProduct({ ...editingProduct, variants: updated });
                        }}
                        className="w-full text-center mt-1 py-1 bg-zinc-50 border border-zinc-200 rounded-lg font-black text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        title="Available Stock Pairs"
                      />
                      <span className="text-[9px] text-zinc-400 block mt-0.5">pairs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                {editingProduct.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteCandidate(editingProduct as Product);
                    }}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete This Shoe</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Check className="w-4 h-4 text-orange-500" />
                    <span>Save Footwear Changes</span>
                  </button>
                </div>
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
              placeholder={`APNA-AG-53,"Apna Ultra Trail",running-shoes,men,1699,2999`}
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

      {/* Delete Product Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-950 font-display">Delete Footwear Model?</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to permanently delete <strong>"{deleteCandidate.name}"</strong> ({deleteCandidate.sku}) from the store catalog?
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-lg bg-white border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                {deleteCandidate.images && deleteCandidate.images.length > 0 ? (
                  <img src={deleteCandidate.images[0]} alt={deleteCandidate.name} className="w-full h-full object-contain" />
                ) : (
                  <SneakerGraphic type={deleteCandidate.graphicType} accentColor="#FF5A1F" className="w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs text-zinc-900 block truncate">{deleteCandidate.name}</span>
                <span className="text-[11px] text-zinc-500 block font-mono">
                  ₹{deleteCandidate.sellingPrice.toLocaleString('en-IN')} · {deleteCandidate.categorySlug}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Footwear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
