export type Gender = 'men' | 'women' | 'kids' | 'unisex';

export type CategorySlug = 
  | 'all'
  | 'mens-sneakers'
  | 'womens-sneakers'
  | 'kids-shoes'
  | 'running-shoes'
  | 'casual-sneakers'
  | 'sports-shoes'
  | 'high-top-sneakers'
  | 'low-top-sneakers'
  | 'walking-shoes'
  | 'new-arrivals'
  | 'bestsellers'
  | 'sale';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  displayOrder: number;
  showOnHome: boolean;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string; // e.g. "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"
  colorName: string;
  colorHex: string;
  stockQuantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  gender: Gender;
  categorySlug: string;
  originalPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  variants: ProductVariant[];
  images: string[];
  graphicType?: 'air-glide' | 'high-top' | 'aero-runner' | 'retro-dunk' | 'street-chunky' | 'junior-bolt' | 'campus-pulse' | 'velocity-pro' | 'flex-slipon';
  badge?: 'Bestseller' | 'New Drop' | 'Hot Deal' | 'Trending';
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  weightGrams: number;
  dimensionsCm: { length: number; width: number; height: number };
  isActive: boolean;
  isFeatured: boolean;
  returnEligible: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  brand: string;
  variantId: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image?: string;
  graphicType?: Product['graphicType'];
  stockAvailable: number;
}

export interface Address {
  id: string;
  profileId?: string;
  name: string;
  phone: string;
  email?: string;
  flatHouse: string;
  streetLocality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: 'home' | 'work' | 'other';
  isDefault?: boolean;
  deliveryInstructions?: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'order_placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'return_approved'
  | 'return_picked_up'
  | 'refund_processing'
  | 'refunded';

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  graphicType?: Product['graphicType'];
}

export interface ShipmentEvent {
  id: string;
  statusCode: string;
  statusTitle: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  courierName: string; // e.g. "Shiprocket - Delhivery Surface"
  shipmentId: string;
  awbCode: string;
  status: 'manifested' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  trackingUrl: string;
  pickupScheduledAt?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  events: ShipmentEvent[];
}

export interface Order {
  id: string;
  orderNumber: string; // "APNA-2026-XXXX"
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxAmount: number; // 18% GST in India
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shipment?: Shipment;
  returnDeadline?: string; // 7 calendar days after actualDelivery
  deliveredAt?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reason: 'wrong_size' | 'damaged_item' | 'defective_stitching' | 'not_as_pictured' | 'color_mismatch' | 'other';
  reasonDetails: string;
  photoUrl?: string;
  status: 'requested' | 'approved' | 'pickup_scheduled' | 'picked_up' | 'rejected' | 'refund_completed';
  returnDeadline: string;
  pickupDate?: string;
  refundAmount: number;
  adminNotes?: string;
  refundTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export interface HeroBanner {
  id: string;
  headline: string;
  subheadline: string;
  offerBadge: string; // e.g. "FLAT 40% OFF", "BUY 1 GET 1", "FESTIVE SALE"
  badge: string; // e.g. "EDITION 2026", "LIMITED DROP"
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  accentColor?: string;
  graphicType?: 'air-glide' | 'high-top' | 'aero-runner' | 'retro-dunk' | 'street-chunky' | 'junior-bolt' | 'campus-pulse' | 'velocity-pro' | 'flex-slipon';
  isActive: boolean;
  displayOrder: number;
}

export interface StoreCMSConfig {
  storeName: string;
  tagline: string;
  logoText: string;
  announcementText: string;
  brandPrimaryColor: string;
  brandDarkColor: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroBadge: string;
  promoBannerTitle: string;
  promoBannerSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  whatsappNumber: string;
  gstNumber: string;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  heroBanners?: HeroBanner[];
  aboutContent: string;
  faqList: Array<{ question: string; answer: string }>;
  returnPolicyContent: string;
  shippingPolicyContent: string;
  privacyPolicyContent: string;
  termsContent: string;
  lastUpdated: string;
}

export interface FlipkartMapping {
  id: string;
  internalSku: string;
  productName: string;
  flipkartFsn: string;
  flipkartListingId: string;
  stockSync: boolean;
  internalStock: number;
  flipkartStock: number;
  lastSyncedAt: string;
  status: 'synced' | 'pending' | 'error';
}

export interface IntegrationStatus {
  razorpay: {
    enabled: boolean;
    mode: 'sandbox' | 'live';
    keyId: string;
    hasSecret: boolean;
  };
  shiprocket: {
    enabled: boolean;
    mode: 'sandbox' | 'live';
    email: string;
    tokenActive: boolean;
  };
  flipkart: {
    connected: boolean;
    sellerId: string;
    totalMappedSkus: number;
  };
  googleMaps: {
    configured: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
}
