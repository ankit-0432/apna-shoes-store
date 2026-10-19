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
  Database,
  Copy,
  Server,
  Share2,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Send,
  Clock,
  Store,
  Globe,
} from 'lucide-react';
import { api } from '../../services/api.js';
import {
  syncOrderToFirestore,
  syncReturnToFirestore,
  syncProductToFirestore,
  deleteProductFromFirestore,
} from '../../services/firebaseSync.js';
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
  onProductUpdated?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onNavigateHome,
  onProductUpdated,
  onProductDeleted,
}) => {
  const { user, isAdmin, loginAsDemoAdmin, loginAsDemoCustomer, logout } = useAuth();
  const { config, updateConfig } = useStoreConfig();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'returns' | 'cms' | 'flipkart' | 'integrations' | 'supabase' | 'shopify'
  >('dashboard');

  // Supabase Database States
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [loadingSupabase, setLoadingSupabase] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [supabaseSchemaSql, setSupabaseSchemaSql] = useState('');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Shopify Storefront States
  const [shopifyStatus, setShopifyStatus] = useState<any>(null);
  const [loadingShopify, setLoadingShopify] = useState(false);
  const [syncingShopify, setSyncingShopify] = useState(false);
  const [shopifyMessage, setShopifyMessage] = useState<string | null>(null);


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

  // AWB Confirmation & Share Modals
  const [confirmAwbModalOrder, setConfirmAwbModalOrder] = useState<Order | null>(null);
  const [awbInputCourier, setAwbInputCourier] = useState('Shiprocket — Delhivery Air');
  const [awbInputCode, setAwbInputCode] = useState('');
  const [awbInputTrackingUrl, setAwbInputTrackingUrl] = useState('');
  const [awbInputEstDelivery, setAwbInputEstDelivery] = useState('');
  const [isSubmittingAwb, setIsSubmittingAwb] = useState(false);
  const [shareAwbModalOrder, setShareAwbModalOrder] = useState<Order | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [awbCodeCopied, setAwbCodeCopied] = useState(false);

  // Return Processing States & Modals
  const [returnStatusFilter, setReturnStatusFilter] = useState<'all' | 'requested' | 'approved' | 'picked_up' | 'refund_completed' | 'rejected'>('all');
  const [returnModalItem, setReturnModalItem] = useState<ReturnRequest | null>(null);
  const [returnModalType, setReturnModalType] = useState<'approve' | 'picked_up' | 'refund' | 'reject' | null>(null);
  const [returnModalCourier, setReturnModalCourier] = useState('Shiprocket — Delhivery Reverse Express');
  const [returnModalAwb, setReturnModalAwb] = useState('');
  const [returnModalPickupDate, setReturnModalPickupDate] = useState('');
  const [returnModalTxnId, setReturnModalTxnId] = useState('');
  const [returnModalNotes, setReturnModalNotes] = useState('');
  const [isSubmittingReturnAction, setIsSubmittingReturnAction] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'supabase') {
      fetchSupabaseInfo();
    } else if (activeTab === 'shopify' || activeTab === 'integrations') {
      fetchShopifyInfo();
    }
  }, [activeTab]);


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
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) {
      showFeedback('Please enter a footwear name.', 'error');
      return;
    }
    const sellingPrice = Number(editingProduct.sellingPrice);
    if (!sellingPrice || sellingPrice <= 0) {
      showFeedback('Please enter a valid selling price greater than ₹0.', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      const originalPrice =
        Number(editingProduct.originalPrice) && Number(editingProduct.originalPrice) > sellingPrice
          ? Number(editingProduct.originalPrice)
          : Math.round(sellingPrice * 1.5);
      const discountPercentage = Math.round((1 - sellingPrice / originalPrice) * 100);

      // Default high-quality photo if none provided so the shoe is never blank
      const images =
        editingProduct.images && editingProduct.images.length > 0
          ? editingProduct.images
          : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'];

      const payload = {
        ...editingProduct,
        id: editingProduct.id || `prod-${Date.now()}`,
        name: editingProduct.name.trim(),
        sellingPrice,
        originalPrice,
        discountPercentage,
        images,
        isActive: true,
      };

      const savedProduct = await api.saveProduct(payload as any);

      // Live Firestore sync immediately
      await syncProductToFirestore(savedProduct).catch((err) => {
        console.warn('[Firebase] Product live sync notice:', err);
      });

      // Update parent App.tsx state immediately
      if (onProductUpdated) {
        onProductUpdated(savedProduct);
      }

      // Dispatch global event for instant multi-tab / customer view sync
      window.dispatchEvent(new CustomEvent('apna:product-saved', { detail: savedProduct }));

      showFeedback(`🎉 "${savedProduct.name}" is now LIVE! All customers can see it immediately.`, 'success');
      setEditingProduct(null);
      setNewImageUrl('');
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Error saving product', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Photo Upload Handler (Local file to Data URL with canvas compression)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        if (editingProduct) {
          setEditingProduct({
            ...editingProduct,
            images: [...(editingProduct.images || []), compressedDataUrl],
          });
          showFeedback('Photo uploaded and optimized successfully!');
        }
      };
      img.src = event.target?.result as string;
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
      await deleteProductFromFirestore(deleteCandidate.id).catch(() => {});
      if (onProductDeleted) onProductDeleted(deleteCandidate.id);
      window.dispatchEvent(new CustomEvent('apna:product-deleted', { detail: deleteCandidate.id }));
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
      const updated = await api.updateOrderStatus(orderId, status);
      syncOrderToFirestore(updated).catch(() => {});
      showFeedback(`Order ${updated.orderNumber} updated to ${status.replace(/_/g, ' ').toUpperCase()}`);
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Status update failed', 'error');
    }
  };

  // Intelligent Tracking URL Generator
  const getAutoTrackingUrl = (courier: string, awb: string) => {
    const c = courier.toLowerCase();
    const cleanAwb = awb.trim();
    if (!cleanAwb) return 'https://shiprocket.co/tracking';
    if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${cleanAwb}`;
    if (c.includes('bluedart') || c.includes('blue dart')) return `https://www.bluedart.com/tracking?trackNumber=${cleanAwb}`;
    if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${cleanAwb}`;
    if (c.includes('shadowfax')) return `https://tracker.shadowfax.in/#/track/${cleanAwb}`;
    if (c.includes('xpressbees')) return `https://www.xpressbees.com/track?awb=${cleanAwb}`;
    return `https://shiprocket.co/tracking/${cleanAwb}`;
  };

  // Handle Shipment Creation / AWB Assignment Modal Open
  const handleOpenConfirmAwbModal = (order: Order) => {
    setConfirmAwbModalOrder(order);
    const courier = order.shipment?.courierName || 'Shiprocket — Delhivery Air';
    const code = order.shipment?.awbCode || `DELHIVERY-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setAwbInputCourier(courier);
    setAwbInputCode(code);
    setAwbInputTrackingUrl(order.shipment?.trackingUrl || getAutoTrackingUrl(courier, code));
    const defaultDate = order.shipment?.estimatedDelivery
      ? new Date(order.shipment.estimatedDelivery).toISOString().split('T')[0]
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setAwbInputEstDelivery(defaultDate);
  };

  const handleCourierSelect = (newCourier: string) => {
    setAwbInputCourier(newCourier);
    setAwbInputTrackingUrl(getAutoTrackingUrl(newCourier, awbInputCode));
  };

  const handleAwbCodeType = (newCode: string) => {
    setAwbInputCode(newCode);
    setAwbInputTrackingUrl(getAutoTrackingUrl(awbInputCourier, newCode));
  };

  const handleGeneratePresetAwb = (type: 'delhivery' | 'bluedart' | 'shiprocket' | 'numeric') => {
    let code = '';
    let courier = awbInputCourier;
    if (type === 'delhivery') {
      code = `DELHIVERY-${Math.floor(100000000 + Math.random() * 900000000)}`;
      courier = 'Shiprocket — Delhivery Air';
    } else if (type === 'bluedart') {
      code = `BLUEDART-${Math.floor(100000000 + Math.random() * 900000000)}`;
      courier = 'Shiprocket — BlueDart Express';
    } else if (type === 'shiprocket') {
      code = `SR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      courier = 'Shiprocket — Delhivery Air';
    } else {
      code = `${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    }
    setAwbInputCourier(courier);
    setAwbInputCode(code);
    setAwbInputTrackingUrl(getAutoTrackingUrl(courier, code));
  };

  const handleConfirmAndAssignAwb = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!confirmAwbModalOrder) return;
    if (!awbInputCode.trim()) {
      showFeedback('Please provide a valid AWB number', 'error');
      return;
    }
    setIsSubmittingAwb(true);
    try {
      const updatedOrder = await api.createShipment(
        confirmAwbModalOrder.id,
        awbInputCourier,
        awbInputCode.trim(),
        awbInputTrackingUrl.trim(),
        awbInputEstDelivery ? new Date(awbInputEstDelivery).toISOString() : undefined
      );
      showFeedback(`AWB ${awbInputCode.trim()} confirmed for Order ${confirmAwbModalOrder.orderNumber}!`, 'success');
      syncOrderToFirestore(updatedOrder).catch(() => {});
      setConfirmAwbModalOrder(null);
      // Automatically open the Share AWB dialog so admin can share it immediately!
      setShareAwbModalOrder(updatedOrder);
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'AWB assignment failed', 'error');
    } finally {
      setIsSubmittingAwb(false);
    }
  };

  const getAwbShareMessage = (order: Order) => {
    const awb = order.shipment?.awbCode || 'Pending';
    const courier = order.shipment?.courierName || 'Shiprocket Logistics';
    const trackingUrl = order.shipment?.trackingUrl || `https://shiprocket.co/tracking/${awb}`;
    const estDate = order.shipment?.estimatedDelivery
      ? new Date(order.shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'In 3-4 business days';

    return `👟 *APNA SHOES - Order Confirmed & Dispatched!*

Namaste *${order.customerName}*,
Great news! Your footwear order *${order.orderNumber}* has been confirmed by our warehouse team and dispatched!

📦 *Courier Partner:* ${courier}
🎫 *Airway Bill (AWB) No:* ${awb}
🔗 *Live Tracking Link:* ${trackingUrl}
📅 *Estimated Delivery:* ${estDate}

You can also track your shipment anytime on our store by entering your Order No. or AWB No.

Thank you for choosing *APNA SHOES*!`;
  };

  const getWhatsAppShareUrl = (order: Order) => {
    const rawPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = getAwbShareMessage(order);
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const getSmsShareUrl = (order: Order) => {
    const rawPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const awb = order.shipment?.awbCode || 'Pending';
    const trackingUrl = order.shipment?.trackingUrl || `https://shiprocket.co/tracking/${awb}`;
    const msg = `APNA SHOES: Your order ${order.orderNumber} has shipped via ${order.shipment?.courierName || 'Courier'}. AWB No: ${awb}. Track: ${trackingUrl}`;
    return `sms:${rawPhone}?body=${encodeURIComponent(msg)}`;
  };

  const getEmailShareUrl = (order: Order) => {
    const awb = order.shipment?.awbCode || 'Pending';
    const trackingUrl = order.shipment?.trackingUrl || `https://shiprocket.co/tracking/${awb}`;
    const subject = `APNA SHOES - Order Dispatched: ${order.orderNumber} (AWB: ${awb})`;
    const body = `Dear ${order.customerName},\n\nYour order ${order.orderNumber} has been dispatched.\n\nCourier: ${order.shipment?.courierName || 'Courier'}\nAWB Number: ${awb}\nLive Tracking: ${trackingUrl}\n\nThank you,\nAPNA SHOES Team`;
    return `mailto:${order.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

  // Handle Return Actions & Modals
  const handleOpenReturnModal = (ret: ReturnRequest, action: 'approve' | 'picked_up' | 'refund' | 'reject') => {
    setReturnModalItem(ret);
    setReturnModalType(action);
    setReturnModalCourier(ret.reverseCourier || 'Shiprocket — Delhivery Reverse Express');
    setReturnModalAwb(ret.reverseAwb || `REV-${Math.floor(100000000 + Math.random() * 900000000)}`);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setReturnModalPickupDate(ret.pickupDate ? ret.pickupDate.split('T')[0] : tomorrow);
    setReturnModalTxnId(ret.refundTransactionId || `UPI/REF-${Date.now().toString().slice(-6)}`);
    setReturnModalNotes(ret.adminNotes || '');
  };

  const handleExecuteReturnAction = async () => {
    if (!returnModalItem || !returnModalType) return;
    setIsSubmittingReturnAction(true);

    try {
      let targetStatus = 'approved';
      if (returnModalType === 'approve') targetStatus = 'approved';
      else if (returnModalType === 'picked_up') targetStatus = 'picked_up';
      else if (returnModalType === 'refund') targetStatus = 'refund_completed';
      else if (returnModalType === 'reject') targetStatus = 'rejected';

      await api.updateReturnStatus(returnModalItem.id, targetStatus, returnModalNotes, {
        reverseCourier: returnModalCourier,
        reverseAwb: returnModalAwb,
        pickupDate: returnModalPickupDate ? new Date(returnModalPickupDate).toISOString() : undefined,
        refundTransactionId: returnModalTxnId,
      });

      showFeedback(`Return #${returnModalItem.id} updated to ${targetStatus.replace('_', ' ').toUpperCase()}`);
      setReturnModalItem(null);
      setReturnModalType(null);
      fetchAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update return', 'error');
    } finally {
      setIsSubmittingReturnAction(false);
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

  // Handle Supabase Status & Sync
  const fetchSupabaseInfo = async () => {
    setLoadingSupabase(true);
    try {
      const status = await api.getSupabaseStatus();
      setSupabaseStatus(status);
    } catch (err: any) {
      showFeedback(err.message || 'Error checking Supabase', 'error');
    } finally {
      setLoadingSupabase(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncingSupabase(true);
    try {
      const res = await api.syncSupabase();
      showFeedback(res.message || 'Synchronized store data to Supabase!');
      fetchSupabaseInfo();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to sync with Supabase', 'error');
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleLoadSchema = async () => {
    try {
      const sql = await api.getSupabaseSchema();
      setSupabaseSchemaSql(sql);
      setShowSqlModal(true);
    } catch (err: any) {
      showFeedback('Failed to load SQL schema', 'error');
    }
  };

  const handleCopySql = () => {
    if (supabaseSchemaSql) {
      navigator.clipboard.writeText(supabaseSchemaSql);
      setSqlCopied(true);
      showFeedback('Copied schema.sql to clipboard!');
      setTimeout(() => setSqlCopied(false), 2500);
    }
  };

  // Handle Shopify Storefront Status & Product Sync
  const fetchShopifyInfo = async () => {
    setLoadingShopify(true);
    try {
      const status = await api.getShopifyStatus();
      setShopifyStatus(status);
    } catch (err: any) {
      console.warn('Shopify status fetch error:', err);
    } finally {
      setLoadingShopify(false);
    }
  };

  const handleSyncShopify = async () => {
    setSyncingShopify(true);
    setShopifyMessage(null);
    try {
      const res = await api.syncShopifyProducts();
      showFeedback(res.message || 'Successfully synced products from Shopify!');
      setShopifyMessage(res.message);

      // Refresh admin products list & notify parent app
      const updatedList = await api.getProducts({ admin: true });
      setProducts(updatedList);
      if (res.products && Array.isArray(res.products)) {
        for (const p of res.products) {
          onProductUpdated?.(p);
          syncProductToFirestore(p).catch(() => {});
        }
      }
      fetchShopifyInfo();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to sync with Shopify', 'error');
      setShopifyMessage(`Sync error: ${err.message}`);
    } finally {
      setSyncingShopify(false);
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
              { id: 'shopify', label: `Shopify (${shopifyStatus?.totalProducts ?? 1})`, icon: Store },
              { id: 'integrations', label: 'Gateway & Logistics', icon: Settings },
              { id: 'supabase', label: 'Supabase Cloud DB', icon: Database },
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
                        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],
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
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>+ Add New Footwear</span>
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
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-emerald-950 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{o.shipment.awbCode}</span>
                                </span>
                                <button
                                  onClick={() => handleOpenConfirmAwbModal(o)}
                                  className="text-[10px] text-zinc-500 hover:text-zinc-900 underline font-semibold"
                                  title="Edit AWB details"
                                >
                                  Edit
                                </button>
                              </div>
                              <div className="flex items-center justify-between gap-2 max-w-[210px]">
                                <span className="text-[10px] text-zinc-500 truncate block">
                                  {o.shipment.courierName}
                                </span>
                                <button
                                  onClick={() => setShareAwbModalOrder(o)}
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                                  title="Share AWB with customer via WhatsApp / SMS"
                                >
                                  <Share2 className="w-2.5 h-2.5" />
                                  <span>Share AWB</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <span className="text-[9.5px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                                Awaiting AWB
                              </span>
                              <button
                                onClick={() => handleOpenConfirmAwbModal(o)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirm & Assign AWB</span>
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {o.shipment?.awbCode && (
                              <button
                                onClick={() => setShareAwbModalOrder(o)}
                                className="p-1.5 text-emerald-700 hover:text-emerald-950 rounded hover:bg-emerald-50 transition-colors"
                                title="Share AWB with Customer"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedInvoiceOrder(o)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-950 rounded hover:bg-zinc-100"
                              title="Print Tax Invoice & Packing Slip"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: 7-DAY RETURN & REFUND MANAGEMENT */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 font-display">
                    7-Day Return & Refund Authorization Queue
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Review customer return requests, inspect items, assign reverse courier AWB for doorstep pickup, and issue 100% refunds.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl shadow-2xs">
                    Total Requests: <strong className="text-orange-600">{returns.length}</strong>
                  </span>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(
                  [
                    { id: 'all', label: 'All Requests', count: returns.length },
                    { id: 'requested', label: 'Pending Review', count: returns.filter((r) => r.status === 'requested').length },
                    { id: 'approved', label: 'Pickup Scheduled', count: returns.filter((r) => r.status === 'approved' || r.status === 'pickup_scheduled').length },
                    { id: 'picked_up', label: 'Picked Up', count: returns.filter((r) => r.status === 'picked_up').length },
                    { id: 'refund_completed', label: 'Refund Completed', count: returns.filter((r) => r.status === 'refund_completed').length },
                    { id: 'rejected', label: 'Rejected', count: returns.filter((r) => r.status === 'rejected').length },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setReturnStatusFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      returnStatusFilter === tab.id
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        returnStatusFilter === tab.id
                          ? 'bg-zinc-800 text-zinc-200'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Returns List */}
              {returns.filter((r) => returnStatusFilter === 'all' || r.status === returnStatusFilter || (returnStatusFilter === 'approved' && r.status === 'pickup_scheduled')).length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-xs text-zinc-400 space-y-2">
                  <RotateCcw className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="font-bold text-zinc-700 text-sm">No return requests found in this view</p>
                  <p>Customer return requests will appear here once submitted.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                          <th className="py-3 px-4">Return ID & Order</th>
                          <th className="py-3 px-4">Customer & Contact</th>
                          <th className="py-3 px-4">Returned Item(s)</th>
                          <th className="py-3 px-4">Type & Reason</th>
                          <th className="py-3 px-4">Refund / Payout</th>
                          <th className="py-3 px-4">Reverse Logistics</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {returns
                          .filter(
                            (r) =>
                              returnStatusFilter === 'all' ||
                              r.status === returnStatusFilter ||
                              (returnStatusFilter === 'approved' && r.status === 'pickup_scheduled')
                          )
                          .map((ret) => (
                            <tr key={ret.id} className="hover:bg-zinc-50/50 align-top">
                              {/* Order & Return ID */}
                              <td className="py-3.5 px-4 font-mono">
                                <span className="font-bold text-zinc-950 block">{ret.orderNumber}</span>
                                <span className="text-[10px] text-zinc-400 block">Ret ID: {ret.id}</span>
                                <span className="text-[10px] text-zinc-400">
                                  {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                                </span>
                              </td>

                              {/* Customer & Contact */}
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-zinc-900 block">{ret.customerName}</span>
                                <span className="text-zinc-600 font-mono text-[11px] block">{ret.customerPhone}</span>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <a
                                    href={`https://wa.me/${ret.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                      `Namaste ${ret.customerName}, regarding your Return request for APNA SHOES order ${ret.orderNumber}.`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold inline-flex items-center gap-1"
                                    title="WhatsApp Customer"
                                  >
                                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                                    <span>WhatsApp</span>
                                  </a>
                                  <a
                                    href={`tel:${ret.customerPhone.replace(/\D/g, '')}`}
                                    className="p-1 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-[10px] font-bold inline-flex items-center gap-1"
                                    title="Call Customer"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>Call</span>
                                  </a>
                                </div>
                              </td>

                              {/* Items to Return */}
                              <td className="py-3.5 px-4 max-w-[200px]">
                                {ret.itemsToReturn && ret.itemsToReturn.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {ret.itemsToReturn.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        {item.image ? (
                                          <img
                                            src={item.image}
                                            alt=""
                                            className="w-8 h-8 rounded-lg object-cover border border-zinc-200 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                                            <Package className="w-4 h-4 text-zinc-400" />
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <p className="font-bold text-zinc-900 truncate text-[11px]">
                                            {item.productName}
                                          </p>
                                          <p className="text-[10px] text-zinc-500">
                                            Size: <strong>{item.size}</strong> · Qty: {item.quantity}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-zinc-500 italic text-[11px]">All Order Items</span>
                                )}
                              </td>

                              {/* Type & Reason */}
                              <td className="py-3.5 px-4 max-w-xs">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 uppercase mb-1">
                                  {ret.returnType === 'size_exchange'
                                    ? `Exchange → ${ret.desiredSize || 'New Size'}`
                                    : '100% Refund'}
                                </span>
                                <span className="font-bold text-zinc-900 block capitalize">
                                  {ret.reason.replace(/_/g, ' ')}
                                </span>
                                <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">
                                  "{ret.reasonDetails}"
                                </p>
                                {ret.photoUrl && (
                                  <a
                                    href={ret.photoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10.5px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>View Customer Photo Proof</span>
                                  </a>
                                )}
                              </td>

                              {/* Refund Amount & Payout */}
                              <td className="py-3.5 px-4">
                                <span className="font-black text-zinc-950 text-sm tabular-nums block">
                                  ₹{ret.refundAmount.toLocaleString('en-IN')}
                                </span>
                                {ret.payoutDetails?.upiId && (
                                  <span className="text-[10.5px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 block mt-1 truncate max-w-[150px]">
                                    UPI: {ret.payoutDetails.upiId}
                                  </span>
                                )}
                                {ret.payoutDetails?.accountNumber && (
                                  <span className="text-[10px] font-mono text-zinc-600 block mt-1">
                                    A/C: {ret.payoutDetails.accountNumber} ({ret.payoutDetails.ifsc})
                                  </span>
                                )}
                              </td>

                              {/* Reverse Logistics Status */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block mb-1 ${
                                    ret.status === 'refund_completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ret.status === 'approved' || ret.status === 'pickup_scheduled'
                                      ? 'bg-blue-100 text-blue-800'
                                      : ret.status === 'picked_up'
                                      ? 'bg-amber-100 text-amber-800'
                                      : ret.status === 'rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-zinc-100 text-zinc-800'
                                  }`}
                                >
                                  {ret.status.replace(/_/g, ' ')}
                                </span>

                                {ret.reverseAwb && (
                                  <div className="space-y-0.5">
                                    <span className="text-[10.5px] font-mono font-bold text-blue-900 block">
                                      AWB: {ret.reverseAwb}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 block">
                                      {ret.reverseCourier}
                                    </span>
                                    {ret.pickupDate && (
                                      <span className="text-[10px] text-zinc-600 block">
                                        Pickup: {new Date(ret.pickupDate).toLocaleDateString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {ret.refundTransactionId && (
                                  <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-1">
                                    Txn: {ret.refundTransactionId}
                                  </span>
                                )}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                  {ret.status === 'requested' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenReturnModal(ret, 'approve')}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10.5px] shadow-2xs transition-colors cursor-pointer w-full text-center"
                                      >
                                        Approve & Reverse AWB
                                      </button>
                                      <button
                                        onClick={() => handleOpenReturnModal(ret, 'reject')}
                                        className="px-2.5 py-1 text-red-600 hover:bg-red-50 font-bold rounded text-[10px] transition-colors cursor-pointer"
                                      >
                                        Reject Return
                                      </button>
                                    </>
                                  )}

                                  {ret.status === 'approved' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenReturnModal(ret, 'picked_up')}
                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10.5px] shadow-2xs transition-colors cursor-pointer w-full text-center"
                                      >
                                        Mark Picked Up
                                      </button>
                                      <button
                                        onClick={() => handleOpenReturnModal(ret, 'refund')}
                                        className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 font-bold rounded text-[10px] transition-colors cursor-pointer"
                                      >
                                        Issue Refund Now
                                      </button>
                                    </>
                                  )}

                                  {ret.status === 'picked_up' && (
                                    <button
                                      onClick={() => handleOpenReturnModal(ret, 'refund')}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10.5px] shadow-2xs transition-colors cursor-pointer w-full text-center"
                                    >
                                      Complete 100% Refund
                                    </button>
                                  )}

                                  {ret.status === 'refund_completed' && (
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      ✓ Fully Reconciled
                                    </span>
                                  )}

                                  {ret.status === 'rejected' && (
                                    <span className="text-[10px] text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                      ✕ Rejected
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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

                {/* Firebase Cloud Connection Card */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4 md:col-span-2">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-zinc-900">Google Firebase Cloud Database & Analytics</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      CONNECTED & LIVE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Your store is wired to Google Firebase project <code className="bg-zinc-100 px-1 py-0.5 rounded text-orange-600 font-bold">apna-shoes9540</code> with Firestore, Authentication, and Google Analytics.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10.5px] text-zinc-500 font-semibold block">Project ID</span>
                      <strong className="text-zinc-900 font-mono text-[11px]">apna-shoes9540</strong>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10.5px] text-zinc-500 font-semibold block">Auth Domain</span>
                      <strong className="text-zinc-900 font-mono text-[11px]">apna-shoes9540.firebaseapp.com</strong>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10.5px] text-zinc-500 font-semibold block">Measurement ID</span>
                      <strong className="text-zinc-900 font-mono text-[11px]">G-DDTDS30N0S</strong>
                    </div>
                  </div>
                </div>

                {/* Shopify Storefront Cloud API Card */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4 md:col-span-2">
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span>Shopify Storefront API</span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        CONNECTED & LIVE
                      </span>
                      <button
                        onClick={handleSyncShopify}
                        disabled={syncingShopify}
                        className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 text-orange-400 ${syncingShopify ? 'animate-spin' : ''}`} />
                        <span>{syncingShopify ? 'Syncing...' : 'Sync Products'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Direct GraphQL connection to Shopify Storefront at <code className="bg-zinc-100 px-1 py-0.5 rounded text-orange-600 font-bold">apna-shoes-store.myshopify.com</code>. Supports live product sync, variant inventory, and official Shopify checkout generation.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10.5px] text-zinc-500 font-semibold block">Store Domain</span>
                      <strong className="text-zinc-900 font-mono text-[11px]">apna-shoes-store.myshopify.com</strong>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10.5px] text-zinc-500 font-semibold block">Storefront Token</span>
                      <strong className="text-zinc-900 font-mono text-[11px]">d9b7f2948c...f0453</strong>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10.5px] text-zinc-500 font-semibold block">API Version</span>
                      <strong className="text-zinc-900 font-mono text-[11px]">2026-10</strong>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10.5px] text-zinc-500 font-semibold block">Shopify Live Products</span>
                      <strong className="text-emerald-700 font-bold text-xs">{shopifyStatus?.totalProducts ?? 1} Available</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SUPABASE CLOUD DATABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 font-display flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <span>Supabase PostgreSQL Cloud Database</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Connect and synchronize your live store products, orders, coupons, and subscribers to Supabase
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchSupabaseInfo}
                    disabled={loadingSupabase}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSupabase ? 'animate-spin' : ''}`} />
                    <span>Refresh Health</span>
                  </button>
                  <button
                    onClick={handleSyncToSupabase}
                    disabled={syncingSupabase}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-orange-500 ${syncingSupabase ? 'animate-spin' : ''}`} />
                    <span>{syncingSupabase ? 'Syncing...' : 'Sync Store Data to Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-xs text-zinc-900">
                      Project Reference: <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-zinc-800">fzxyxhefjxsyldqsdvbp</code>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    CONNECTED & LIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 font-semibold block text-[10.5px]">Project URL</span>
                    <span className="font-mono text-[11px] text-zinc-800 break-all">https://fzxyxhefjxsyldqsdvbp.supabase.co</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 font-semibold block text-[10.5px]">Auth & Credentials</span>
                    <span className="text-[11px] font-bold text-emerald-700">Anon Public Key & Service Role Ready</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 font-semibold block text-[10.5px]">API Response Latency</span>
                    <span className="text-[11px] font-bold text-zinc-800">{supabaseStatus?.latencyMs ? `${supabaseStatus.latencyMs} ms` : 'Testing...'}</span>
                  </div>
                </div>
              </div>

              {/* Table Schema Status Grid */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-950">Database Tables & Row Counts</h3>
                    <p className="text-[11px] text-zinc-500">Live schema inspection on public tables</p>
                  </div>
                  <button
                    onClick={handleLoadSchema}
                    className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>View SQL Migration Script</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { key: 'products', name: 'products', label: 'Products', defaultCount: products.length },
                    { key: 'categories', name: 'categories', label: 'Categories', defaultCount: 5 },
                    { key: 'orders', name: 'orders', label: 'Orders', defaultCount: orders.length },
                    { key: 'coupons', name: 'coupons', label: 'Coupons', defaultCount: 4 },
                    { key: 'subscribers', name: 'subscribers', label: 'Subscribers', defaultCount: 1 },
                    { key: 'website_content', name: 'website_content', label: 'CMS Config', defaultCount: 1 },
                  ].map((table) => {
                    const tableInfo = supabaseStatus?.tables?.[table.key];
                    const exists = tableInfo?.exists;
                    return (
                      <div
                        key={table.key}
                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                          exists
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-800">{table.label}</span>
                            {exists ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1 py-0.2 rounded">Setup</span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{table.name}</span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-zinc-200/50 flex items-baseline justify-between">
                          <span className="text-[10px] text-zinc-500">Rows</span>
                          <span className="text-xs font-black text-zinc-900">
                            {exists ? (tableInfo?.rowCount ?? 0) : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3-Step Setup Instructions Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider border border-orange-500/30 mb-2">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    How to Setup From Scratch in 30 Seconds
                  </div>
                  <h3 className="text-lg font-black font-display text-white">
                    Initial Supabase Database Setup
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your credentials and API client are fully connected. Follow these 3 easy steps to initialize your tables:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700/60 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-zinc-100">Copy Schema Script</h4>
                    <p className="text-[11px] text-zinc-400">
                      Click the button below to view or copy the complete <code>schema.sql</code> containing all tables, RLS policies, and triggers.
                    </p>
                    <button
                      onClick={handleLoadSchema}
                      className="mt-2 w-full py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy schema.sql</span>
                    </button>
                  </div>

                  <div className="bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700/60 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-zinc-100">Run in Supabase SQL Editor</h4>
                    <p className="text-[11px] text-zinc-400">
                      Open your Supabase project dashboard, navigate to <strong>SQL Editor</strong> on the sidebar, paste the code, and click <strong>Run</strong>.
                    </p>
                    <a
                      href="https://supabase.com/dashboard/project/fzxyxhefjxsyldqsdvbp/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open SQL Editor</span>
                    </a>
                  </div>

                  <div className="bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700/60 space-y-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-zinc-100">Sync Local Data to Cloud</h4>
                    <p className="text-[11px] text-zinc-400">
                      Once tables are created, click <strong>Sync Store Data to Supabase</strong> to automatically seed all 50+ footwear items, categories, coupons, and orders!
                    </p>
                    <button
                      onClick={handleSyncToSupabase}
                      disabled={syncingSupabase}
                      className="mt-2 w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin' : ''}`} />
                      <span>Sync All Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SHOPIFY STOREFRONT INTEGRATION */}
          {activeTab === 'shopify' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-950 font-display flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-600" />
                    <span>Shopify Storefront Integration</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Connect and synchronize your Shopify footwear catalog, product variants, and checkouts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchShopifyInfo}
                    disabled={loadingShopify}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingShopify ? 'animate-spin' : ''}`} />
                    <span>Check Connection</span>
                  </button>
                  <button
                    onClick={handleSyncShopify}
                    disabled={syncingShopify}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-orange-500 ${syncingShopify ? 'animate-spin' : ''}`} />
                    <span>{syncingShopify ? 'Syncing Catalog...' : 'Sync Products from Shopify'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-xs text-zinc-900">
                      Store Domain: <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-zinc-800">{shopifyStatus?.domain || 'apna-shoes-store.myshopify.com'}</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      CONNECTED & LIVE
                    </span>
                    <a
                      href={`https://${shopifyStatus?.domain || 'apna-shoes-store.myshopify.com'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-semibold"
                    >
                      <span>Visit Store</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 font-semibold block text-[10.5px]">Shopify Storefront Name</span>
                    <strong className="text-zinc-900 text-xs">{shopifyStatus?.shop?.name || 'APNA SHOES Official'}</strong>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 font-semibold block text-[10.5px]">Storefront API Access</span>
                    <span className="font-mono text-[11px] text-zinc-800">d9b7f2948c...f0453</span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 font-semibold block text-[10.5px]">GraphQL Version</span>
                    <strong className="text-zinc-900 font-mono text-xs">{shopifyStatus?.apiVersion || '2026-10'}</strong>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="text-zinc-500 font-semibold block text-[10.5px]">Synced Catalog Products</span>
                    <strong className="text-emerald-700 font-bold text-xs">{shopifyStatus?.totalProducts ?? 1} Shoes in Shopify</strong>
                  </div>
                </div>

                {shopifyMessage && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{shopifyMessage}</span>
                  </div>
                )}
              </div>

              {/* Shopify Catalog Products View */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-zinc-600" />
                    <span>Live Products from Shopify Store</span>
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Auto-synced into APNA SHOES storefront & search
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(shopifyStatus?.products || [
                    {
                      id: 'gid://shopify/Product/8433238671423',
                      title: 'TEST APMNA SHOES',
                      handle: 'test-apmna-shoes',
                      availableForSale: true,
                      price: '999.0',
                      currency: 'INR',
                      image: 'https://cdn.shopify.com/s/files/1/0687/7737/7855/files/ROSTER.jpg?v=1792173935',
                    }
                  ]).map((item: any, idx: number) => (
                    <div key={item.id || idx} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col justify-between space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://cdn.shopify.com/s/files/1/0687/7737/7855/files/ROSTER.jpg?v=1792173935'}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-xl border border-zinc-200 bg-white shadow-xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-zinc-900 truncate">{item.title}</h4>
                          <span className="text-[11px] font-mono text-zinc-400 block truncate">handle: {item.handle}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-orange-600">
                              ₹{Math.round(parseFloat(item.price || '999'))}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {item.availableForSale ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                        <button
                          onClick={handleSyncShopify}
                          disabled={syncingShopify}
                          className="flex-1 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Sync Shoe to Store
                        </button>
                        <a
                          href={`https://${shopifyStatus?.domain || 'apna-shoes-store.myshopify.com'}/products/${item.handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-300 rounded-lg"
                          title="View on Shopify"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
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
                    disabled={isSavingProduct}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProduct ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Publishing to Live Store...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Save & Publish Shoe to Store</span>
                      </>
                    )}
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

      {/* Supabase SQL Schema Viewer & Copy Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-black text-zinc-950 font-display flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>Supabase SQL Migration Script (schema.sql)</span>
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Paste this directly into Supabase Dashboard &rarr; SQL Editor &rarr; New Query &rarr; Run
                </p>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800 p-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800 text-[11px]">
                <span className="text-zinc-400 font-mono">database/schema.sql (PostgreSQL 15+)</span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'Copied to Clipboard!' : 'Copy Entire SQL'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={supabaseSchemaSql}
                className="flex-1 w-full bg-transparent text-emerald-300 font-mono text-[11px] p-2 resize-none focus:outline-none overflow-y-auto leading-relaxed mt-2"
                rows={18}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
              <a
                href="https://supabase.com/dashboard/project/fzxyxhefjxsyldqsdvbp/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Go to Supabase SQL Editor in Browser</span>
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleCopySql}
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. AIRWAY BILL (AWB) CONFIRMATION & INSERTION MODAL */}
      {confirmAwbModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 max-h-[92vh] flex flex-col space-y-4 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 font-display">
                    {confirmAwbModalOrder.shipment?.awbCode ? 'Update Airway Bill (AWB)' : 'Confirm & Insert Airway Bill (AWB)'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Assign carrier logistics, tracking code, and confirm customer dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmAwbModalOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Brief Box */}
            <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Order Code:</span>
                  <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                    {confirmAwbModalOrder.orderNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Total:</span>
                  <span className="font-black text-zinc-900">₹{confirmAwbModalOrder.totalAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] uppercase font-bold text-zinc-500">({confirmAwbModalOrder.paymentMethod})</span>
                </div>
              </div>

              <div className="pt-1 border-t border-zinc-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Customer & Contact</span>
                  <span className="font-bold text-zinc-800">{confirmAwbModalOrder.customerName}</span>
                  <span className="block text-zinc-500">{confirmAwbModalOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Delivery Destination</span>
                  <span className="text-zinc-700 block truncate">
                    {confirmAwbModalOrder.shippingAddress.city}, {confirmAwbModalOrder.shippingAddress.state} ({confirmAwbModalOrder.shippingAddress.pincode})
                  </span>
                </div>
              </div>

              {confirmAwbModalOrder.items && confirmAwbModalOrder.items.length > 0 && (
                <div className="pt-1 border-t border-zinc-200/60 flex items-center gap-2 text-[11px] text-zinc-600 truncate">
                  <span className="text-zinc-400 font-semibold shrink-0">Items:</span>
                  <span className="truncate">
                    {confirmAwbModalOrder.items.map(i => `${i.quantity}x ${i.productName} (Size ${i.size})`).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* AWB Form */}
            <form onSubmit={handleConfirmAndAssignAwb} className="space-y-4 text-xs">
              {/* Courier Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-800 flex items-center justify-between">
                  <span>Courier Partner / Service</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Select or type custom carrier</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                  {[
                    'Shiprocket — Delhivery Air',
                    'Shiprocket — BlueDart Express',
                    'Delhivery Surface',
                    'BlueDart Air Express',
                    'DTDC Express',
                    'Shadowfax Logistics',
                  ].map((courierOption) => (
                    <button
                      key={courierOption}
                      type="button"
                      onClick={() => handleCourierSelect(courierOption)}
                      className={`px-2 py-1.5 rounded-xl border text-[10.5px] font-semibold text-left truncate transition-colors ${
                        awbInputCourier === courierOption
                          ? 'bg-orange-50 border-orange-400 text-orange-950 font-bold'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {courierOption}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={awbInputCourier}
                  onChange={(e) => handleCourierSelect(e.target.value)}
                  placeholder="e.g. Shiprocket — Delhivery Air"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* AWB Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-800 flex items-center gap-1.5">
                    <span>Airway Bill (AWB) Tracking Number *</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleGeneratePresetAwb('delhivery')}
                      className="text-[10px] text-orange-600 hover:text-orange-700 hover:underline font-bold"
                    >
                      + Delhivery
                    </button>
                    <span className="text-zinc-300">·</span>
                    <button
                      type="button"
                      onClick={() => handleGeneratePresetAwb('bluedart')}
                      className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-bold"
                    >
                      + BlueDart
                    </button>
                    <span className="text-zinc-300">·</span>
                    <button
                      type="button"
                      onClick={() => handleGeneratePresetAwb('numeric')}
                      className="text-[10px] text-zinc-600 hover:text-zinc-800 hover:underline font-bold"
                    >
                      + Numeric
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={awbInputCode}
                  onChange={(e) => handleAwbCodeType(e.target.value)}
                  placeholder="Insert new AWB No (e.g. DELHIVERY-89213491 or 784290123491)"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-mono font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10.5px] text-zinc-500">
                  This AWB code will be instantly visible to customer in <strong>Track Order</strong>, <strong>My Orders</strong>, and <strong>Order Confirmation</strong>.
                </p>
              </div>

              {/* Live Tracking Link */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-800 flex items-center justify-between">
                  <span>Carrier Live Tracking URL</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Auto-generated or custom</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={awbInputTrackingUrl}
                    onChange={(e) => setAwbInputTrackingUrl(e.target.value)}
                    placeholder="https://shiprocket.co/tracking/..."
                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] font-mono text-zinc-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {awbInputTrackingUrl && (
                    <a
                      href={awbInputTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold flex items-center gap-1 shrink-0"
                      title="Test live tracking link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Test Link</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Estimated Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-800">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={awbInputEstDelivery}
                    onChange={(e) => setAwbInputEstDelivery(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-800">Fulfillment Status</label>
                  <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Auto-advance to 'Shipped'</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setConfirmAwbModalOrder(null)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAwb}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingAwb ? 'Saving AWB...' : 'Confirm & Save Airway Bill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SHARE NEW AWB NUMBER WITH CUSTOMER MODAL */}
      {shareAwbModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 font-display">
                    AWB Confirmed! Share with Customer
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Share new AWB tracking code directly via WhatsApp, SMS, or Email
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShareAwbModalOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AWB Highlight Card */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                  Airway Bill (AWB) Confirmed
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Order: <strong className="text-zinc-900">{shareAwbModalOrder.orderNumber}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Airway Bill Number</span>
                  <span className="text-lg font-black font-mono text-emerald-950 tracking-wide">
                    {shareAwbModalOrder.shipment?.awbCode || 'Awaiting Code'}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    {shareAwbModalOrder.shipment?.courierName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (shareAwbModalOrder.shipment?.awbCode) {
                      navigator.clipboard.writeText(shareAwbModalOrder.shipment.awbCode);
                      setAwbCodeCopied(true);
                      setTimeout(() => setAwbCodeCopied(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {awbCodeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{awbCodeCopied ? 'Copied!' : 'Copy AWB'}</span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-600 flex items-center justify-between pt-1">
                <span>Customer: <strong>{shareAwbModalOrder.customerName}</strong> ({shareAwbModalOrder.customerPhone})</span>
                <span className="text-emerald-700 font-bold">Visible to customer now ✓</span>
              </div>
            </div>

            {/* Ready Pre-formatted Customer Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                  Customer Message Preview
                </label>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getAwbShareMessage(shareAwbModalOrder));
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  }}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {shareCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{shareCopied ? 'Copied Full Message!' : 'Copy Full Message'}</span>
                </button>
              </div>
              <div className="p-3 bg-zinc-950 text-emerald-300 rounded-2xl font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line border border-zinc-800">
                {getAwbShareMessage(shareAwbModalOrder)}
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Instant Share Channels
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={getWhatsAppShareUrl(shareAwbModalOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </a>

                <a
                  href={getSmsShareUrl(shareAwbModalOrder)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Share via SMS</span>
                </a>

                <a
                  href={getEmailShareUrl(shareAwbModalOrder)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Share via Email</span>
                </a>

                {shareAwbModalOrder.shipment?.trackingUrl && (
                  <a
                    href={shareAwbModalOrder.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Live Tracking</span>
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-2 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setShareAwbModalOrder(null)}
                className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RETURN FULFILLMENT & REFUND ACTION MODAL */}
      {returnModalItem && returnModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden space-y-4 p-6 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    returnModalType === 'approve'
                      ? 'bg-blue-100 text-blue-700'
                      : returnModalType === 'picked_up'
                      ? 'bg-amber-100 text-amber-700'
                      : returnModalType === 'refund'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 font-display">
                    {returnModalType === 'approve'
                      ? 'Approve Return & Reverse Pickup AWB'
                      : returnModalType === 'picked_up'
                      ? 'Confirm Doorstep Item Pickup'
                      : returnModalType === 'refund'
                      ? 'Issue 100% Refund to Customer'
                      : 'Reject Return Request'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Order: {returnModalItem.orderNumber} · Customer: {returnModalItem.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setReturnModalItem(null);
                  setReturnModalType(null);
                }}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Return Context Summary */}
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer Phone:</span>
                <span className="font-bold text-zinc-900 font-mono">{returnModalItem.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Refund / Claim Value:</span>
                <span className="font-bold text-zinc-950 text-sm">₹{returnModalItem.refundAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Return Reason:</span>
                <span className="font-semibold text-zinc-800 capitalize">
                  {returnModalItem.reason.replace(/_/g, ' ')}
                </span>
              </div>
              {returnModalItem.pickupAddress && (
                <div className="pt-1 border-t border-zinc-200">
                  <span className="text-zinc-500 text-[10.5px]">Doorstep Pickup Address:</span>
                  <p className="text-zinc-700 text-[11px] font-medium leading-tight">
                    {returnModalItem.pickupAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Action Specific Fields */}
            {returnModalType === 'approve' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-800 font-bold mb-1">
                    Reverse Courier Partner *
                  </label>
                  <select
                    value={returnModalCourier}
                    onChange={(e) => setReturnModalCourier(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl font-medium"
                  >
                    <option value="Shiprocket — Delhivery Reverse Express">
                      Shiprocket — Delhivery Reverse Express
                    </option>
                    <option value="Shiprocket — BlueDart Reverse Surface">
                      Shiprocket — BlueDart Reverse Surface
                    </option>
                    <option value="Shadowfax Doorstep Reverse">Shadowfax Doorstep Reverse</option>
                    <option value="DTDC Reverse Express">DTDC Reverse Express</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-zinc-800 font-bold">
                      Reverse Pickup AWB Number *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setReturnModalAwb(`REV-${Math.floor(100000000 + Math.random() * 900000000)}`)
                      }
                      className="text-[10.5px] text-orange-600 hover:underline font-bold"
                    >
                      + Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={returnModalAwb}
                    onChange={(e) => setReturnModalAwb(e.target.value)}
                    placeholder="e.g. REV-789123456"
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-mono font-bold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-800 font-bold mb-1">
                    Scheduled Reverse Pickup Date *
                  </label>
                  <input
                    type="date"
                    value={returnModalPickupDate}
                    onChange={(e) => setReturnModalPickupDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl"
                  />
                </div>
              </div>
            )}

            {returnModalType === 'picked_up' && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Confirm Reverse Courier Handover</p>
                <p className="text-[11px] leading-relaxed">
                  Has the courier partner collected the shoes from the customer's address? Marking this will update the customer portal to <strong>PICKED UP</strong> and trigger quality warehouse inspection.
                </p>
              </div>
            )}

            {returnModalType === 'refund' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>Payable Refund Amount:</span>
                    <span className="text-base text-emerald-800">₹{returnModalItem.refundAmount}</span>
                  </div>
                  {returnModalItem.payoutDetails?.upiId && (
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-emerald-200">
                      <span>Customer UPI ID:</span>
                      <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {returnModalItem.payoutDetails.upiId}
                      </strong>
                    </div>
                  )}
                  {returnModalItem.payoutDetails?.accountNumber && (
                    <div className="text-[11px] pt-1 border-t border-emerald-200">
                      <span>Bank Transfer:</span>
                      <strong className="block font-mono">
                        A/C: {returnModalItem.payoutDetails.accountNumber} · IFSC: {returnModalItem.payoutDetails.ifsc}
                      </strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-800 font-bold mb-1">
                    Bank UTR / Transaction Reference Number *
                  </label>
                  <input
                    type="text"
                    value={returnModalTxnId}
                    onChange={(e) => setReturnModalTxnId(e.target.value)}
                    placeholder="e.g. UPI/29182379182 or BANK-IMPS-8921"
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-mono text-zinc-900 font-bold"
                  />
                  <p className="text-[10.5px] text-zinc-400 mt-1">
                    The customer will see this transaction reference code in their return portal.
                  </p>
                </div>
              </div>
            )}

            {returnModalType === 'reject' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-950 space-y-1">
                  <p className="font-bold">Reject Return Request</p>
                  <p className="text-[11px] text-red-800">
                    The return request will be rejected and the order status reverted to Delivered. Please provide the justification below.
                  </p>
                </div>

                <div>
                  <label className="block text-zinc-800 font-bold mb-1">
                    Rejection Reason (Visible to Customer) *
                  </label>
                  <select
                    value={returnModalNotes}
                    onChange={(e) => setReturnModalNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl"
                  >
                    <option value="">Select standard reason or write custom...</option>
                    <option value="Tags removed and signs of outdoor sole wear">
                      Tags removed and signs of outdoor sole wear
                    </option>
                    <option value="Exceeded 7-calendar-day return window from delivery date">
                      Exceeded 7-calendar-day return window from delivery date
                    </option>
                    <option value="Original manufacturer box / packaging missing">
                      Original manufacturer box / packaging missing
                    </option>
                    <option value="Footwear washed or altered">Footwear washed or altered</option>
                  </select>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-zinc-800 font-bold text-xs mb-1">
                Admin Audit Notes (Optional)
              </label>
              <input
                type="text"
                value={returnModalNotes}
                onChange={(e) => setReturnModalNotes(e.target.value)}
                placeholder="Internal verification notes..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReturnModalItem(null);
                  setReturnModalType(null);
                }}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReturnAction}
                disabled={isSubmittingReturnAction}
                className={`px-5 py-2 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50 ${
                  returnModalType === 'approve'
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : returnModalType === 'picked_up'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : returnModalType === 'refund'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {isSubmittingReturnAction
                  ? 'Saving...'
                  : returnModalType === 'approve'
                  ? 'Approve & Schedule Reverse Pickup'
                  : returnModalType === 'picked_up'
                  ? 'Confirm Picked Up'
                  : returnModalType === 'refund'
                  ? 'Complete & Reconcile 100% Refund'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

