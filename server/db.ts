import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  Product,
  Category,
  Order,
  ReturnRequest,
  Coupon,
  StoreCMSConfig,
  FlipkartMapping,
  Address,
  IntegrationStatus,
} from '../src/types/store.js';
import {
  initialCategories,
  initialProducts,
  initialCoupons,
  initialCMSConfig,
  initialOrders,
  initialReturns,
  initialFlipkartMappings,
} from './seedData.js';
import { syncSubscriberToSupabase, syncOrderToSupabase } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveDataStorage(): { dataDir: string; dbFile: string } {
  // Try project root data directory first (e.g. process.cwd()/data or ./data)
  const candidateDirs = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, 'data'),
    path.resolve(__dirname, '../data'),
  ];

  for (const dir of candidateDirs) {
    // Avoid root system directory (/data) which triggers EACCES on container platforms
    if (dir === '/data' || dir === '\\data') continue;

    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.accessSync(dir, fs.constants.W_OK);
      return { dataDir: dir, dbFile: path.join(dir, 'store.json') };
    } catch {
      // Try next candidate
    }
  }

  // Fallback to writable temporary directory in restricted/read-only environments
  const tmpDir = path.resolve(process.env.TMPDIR || '/tmp', 'apna-shoes-data');
  const tmpFile = path.join(tmpDir, 'store.json');
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    // If a seeded store.json exists in ./data, copy it to tmpDir
    const localStore = path.resolve(process.cwd(), 'data', 'store.json');
    if (fs.existsSync(localStore) && !fs.existsSync(tmpFile)) {
      try {
        fs.copyFileSync(localStore, tmpFile);
      } catch {
        // Ignore copy error
      }
    }
  } catch (err) {
    console.warn('[DB] Could not create fallback tmp data dir:', err);
  }

  return { dataDir: tmpDir, dbFile: tmpFile };
}

const { dataDir: DATA_DIR, dbFile: DB_FILE } = resolveDataStorage();

interface DatabaseStore {
  products: Product[];
  categories: Category[];
  orders: Order[];
  returns: ReturnRequest[];
  coupons: Coupon[];
  cmsConfig: StoreCMSConfig;
  flipkartMappings: FlipkartMapping[];
  addresses: Record<string, Address[]>; // userId -> addresses
  auditLogs: Array<{ id: string; timestamp: string; actor: string; action: string; details: any }>;
  notifications: Array<{ id: string; timestamp: string; channel: string; recipient: string; title: string; message: string }>;
  subscribers?: Array<{ id: string; email: string; subscribedAt: string; source: string }>;
  deletedProductIds?: string[];
  integrations?: any;
}

interface OtpEntry {
  phone: string;
  code: string;
  expiresAt: number;
}
const activeOtps = new Map<string, OtpEntry>();

let db: DatabaseStore;

function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (err) {
      console.warn('[DB] Could not create DATA_DIR in initDb:', err);
    }
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      if (!db.deletedProductIds) db.deletedProductIds = [];
      // Ensure all 52+ products exist in catalog and have photos
      const existingMap = new Map((db.products || []).map((p: any) => [p.id, p]));
      let hasChanges = false;
      const mergedProducts: Product[] = [];

      for (const initProd of initialProducts) {
        if (db.deletedProductIds?.includes(initProd.id)) {
          continue; // Admin explicitly deleted this shoe
        }
        const existing = existingMap.get(initProd.id);
        if (!existing) {
          mergedProducts.push(initProd);
          hasChanges = true;
        } else {
          if ((!existing.images || existing.images.length === 0) && initProd.images && initProd.images.length > 0) {
            existing.images = initProd.images;
            hasChanges = true;
          }
          mergedProducts.push(existing);
        }
      }

      // Keep any custom products created by admin that aren't in initialProducts
      for (const p of (db.products || [])) {
        if (!initialProducts.some((init) => init.id === p.id)) {
          mergedProducts.push(p);
        }
      }

      if (hasChanges || !db.products || db.products.length < initialProducts.length) {
        db.products = mergedProducts;
        saveDb();
      }
      if (!db.categories) db.categories = initialCategories;
      if (!db.coupons) db.coupons = initialCoupons;
      if (!db.cmsConfig) {
        db.cmsConfig = initialCMSConfig;
      } else if (!db.cmsConfig.heroBanners || db.cmsConfig.heroBanners.length === 0) {
        db.cmsConfig.heroBanners = initialCMSConfig.heroBanners;
        saveDb();
      }
      if (!db.orders) db.orders = initialOrders;
      if (!db.returns) db.returns = initialReturns;
      if (!db.flipkartMappings) db.flipkartMappings = initialFlipkartMappings;
      if (!db.addresses) db.addresses = {};
      if (!db.auditLogs) db.auditLogs = [];
      if (!db.notifications) db.notifications = [];
      if (!db.subscribers) db.subscribers = [];
      if (!db.integrations) {
        db.integrations = {
          razorpay: {
            enabled: true,
            mode: 'sandbox',
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_apnashoes2026',
            hasSecret: Boolean(process.env.RAZORPAY_KEY_SECRET),
          },
          shiprocket: {
            enabled: true,
            mode: 'sandbox',
            email: 'logistics@apnashoes.in',
            tokenActive: true,
          },
          flipkart: {
            connected: true,
            sellerId: 'APNA_SHOES_RETAIL_IN',
            totalMappedSkus: 3,
          },
          googleMaps: {
            configured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
          },
        };
      }
      return;
    } catch (e) {
      console.warn('Error reading db file, falling back to seed data:', e);
    }
  }

  db = {
    products: initialProducts,
    categories: initialCategories,
    orders: initialOrders,
    returns: initialReturns,
    coupons: initialCoupons,
    cmsConfig: initialCMSConfig,
    flipkartMappings: initialFlipkartMappings,
    addresses: {},
    integrations: {
      razorpay: {
        enabled: true,
        mode: 'sandbox',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_apnashoes2026',
        hasSecret: Boolean(process.env.RAZORPAY_KEY_SECRET),
      },
      shiprocket: {
        enabled: true,
        mode: 'sandbox',
        email: 'logistics@apnashoes.in',
        tokenActive: true,
      },
      flipkart: {
        connected: true,
        sellerId: 'APNA_SHOES_RETAIL_IN',
        totalMappedSkus: 3,
      },
      googleMaps: {
        configured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      },
    },
    auditLogs: [],
    notifications: [],
  };
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database:', err);
  }
}

initDb();

export const DB = {
  // PRODUCTS
  getProducts(filters?: { category?: string; gender?: string; search?: string; minPrice?: number; maxPrice?: number; sort?: string }) {
    let list = db.products.filter(p => p.isActive);

    if (filters?.category && filters.category !== 'all') {
      if (filters.category === 'new-arrivals') {
        list = list.filter(p => p.badge === 'New Drop');
      } else if (filters.category === 'bestsellers') {
        list = list.filter(p => p.badge === 'Bestseller' || p.rating >= 4.7);
      } else if (filters.category === 'sale') {
        list = list.filter(p => p.discountPercentage >= 40);
      } else {
        list = list.filter(p => p.categorySlug === filters.category);
      }
    }

    if (filters?.gender && filters.gender !== 'all') {
      list = list.filter(p => p.gender === filters.gender || p.gender === 'unisex');
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categorySlug.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice) {
      list = list.filter(p => p.sellingPrice >= filters.minPrice!);
    }
    if (filters?.maxPrice) {
      list = list.filter(p => p.sellingPrice <= filters.maxPrice!);
    }

    if (filters?.sort) {
      if (filters.sort === 'price-low') list.sort((a, b) => a.sellingPrice - b.sellingPrice);
      if (filters.sort === 'price-high') list.sort((a, b) => b.sellingPrice - a.sellingPrice);
      if (filters.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
      if (filters.sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  },

  getAllProductsAdmin() {
    return db.products;
  },

  getProductBySlug(slug: string) {
    return db.products.find(p => p.slug === slug || p.id === slug);
  },

  saveProduct(product: Partial<Product> & { name: string; sellingPrice: number }) {
    const isNew = !product.id;
    const id = product.id || `prod-${Date.now()}`;
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sku = product.sku || `APNA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const completeProduct: Product = {
      id,
      sku,
      name: product.name,
      slug,
      brand: product.brand || 'APNA SHOES',
      description: product.description || '',
      gender: product.gender || 'unisex',
      categorySlug: product.categorySlug || 'mens-sneakers',
      originalPrice: product.originalPrice || product.sellingPrice * 1.5,
      sellingPrice: product.sellingPrice,
      discountPercentage: product.discountPercentage || Math.round((1 - product.sellingPrice / (product.originalPrice || product.sellingPrice * 1.5)) * 100),
      variants: product.variants || [
        { id: `v-${id}-1`, sku: `${sku}-UK7`, size: 'UK 7', colorName: 'Black / Orange', colorHex: '#FF5A1F', stockQuantity: 20 },
        { id: `v-${id}-2`, sku: `${sku}-UK8`, size: 'UK 8', colorName: 'Black / Orange', colorHex: '#FF5A1F', stockQuantity: 25 },
        { id: `v-${id}-3`, sku: `${sku}-UK9`, size: 'UK 9', colorName: 'Black / Orange', colorHex: '#FF5A1F', stockQuantity: 15 },
      ],
      images: product.images || [],
      graphicType: product.graphicType || 'air-glide',
      badge: product.badge,
      rating: product.rating || 4.7,
      reviewCount: product.reviewCount || 1,
      specifications: product.specifications || {},
      weightGrams: product.weightGrams || 700,
      dimensionsCm: product.dimensionsCm || { length: 32, width: 20, height: 12 },
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: Boolean(product.isFeatured),
      returnEligible: product.returnEligible !== undefined ? product.returnEligible : true,
      createdAt: product.createdAt || new Date().toISOString(),
    };

    if (isNew) {
      db.products.unshift(completeProduct);
      DB.logAudit('ADMIN', 'CREATE_PRODUCT', { id, name: completeProduct.name });
    } else {
      const idx = db.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        db.products[idx] = completeProduct;
        DB.logAudit('ADMIN', 'UPDATE_PRODUCT', { id, name: completeProduct.name });
      }
    }
    saveDb();
    return completeProduct;
  },

  deleteProduct(id: string) {
    db.deletedProductIds = db.deletedProductIds || [];
    if (!db.deletedProductIds.includes(id)) {
      db.deletedProductIds.push(id);
    }
    const idx = db.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = db.products.splice(idx, 1)[0];
      DB.logAudit('ADMIN', 'DELETE_PRODUCT', { id, name: deleted.name });
      saveDb();
      return true;
    }
    return false;
  },

  // CATEGORIES
  getCategories() {
    return db.categories;
  },

  saveCategory(cat: Partial<Category> & { name: string; slug: string }) {
    const id = cat.id || `cat-${Date.now()}`;
    const newCat: Category = {
      id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description || '',
      displayOrder: cat.displayOrder || db.categories.length + 1,
      showOnHome: cat.showOnHome !== undefined ? cat.showOnHome : true,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    };
    const idx = db.categories.findIndex(c => c.id === id || c.slug === cat.slug);
    if (idx !== -1) {
      db.categories[idx] = newCat;
    } else {
      db.categories.push(newCat);
    }
    saveDb();
    return newCat;
  },

  // ORDERS
  getOrders() {
    return db.orders;
  },

  getOrderById(id: string) {
    const clean = id.trim();
    return db.orders.find(
      o =>
        o.id === clean ||
        o.orderNumber.toLowerCase() === clean.toLowerCase() ||
        (o.shipment?.awbCode && o.shipment.awbCode.toLowerCase() === clean.toLowerCase())
    );
  },

  getUserOrders(emailOrPhone: string) {
    const query = emailOrPhone.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, '');
    return db.orders.filter(o => {
      if (o.customerEmail && o.customerEmail.toLowerCase() === query) return true;
      if (queryDigits.length >= 7) {
        const orderPhoneDigits = o.customerPhone.replace(/\D/g, '');
        return (
          orderPhoneDigits.endsWith(queryDigits) ||
          queryDigits.endsWith(orderPhoneDigits) ||
          orderPhoneDigits === queryDigits
        );
      }
      return o.customerPhone.toLowerCase().includes(query);
    });
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) {
    // 1. Concurrency-safe inventory decrement
    for (const item of orderData.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          if (variant.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${variant.stockQuantity}`);
          }
          variant.stockQuantity -= item.quantity;
        }
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `APNA-${new Date().getFullYear()}-${randomSuffix}`;
    const id = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    // If online Razorpay payment, set initial tracking or shipment placeholder
    db.orders.unshift(newOrder);

    // Record notification
    DB.recordNotification(
      'whatsapp',
      newOrder.customerPhone,
      `Order Placed: ${orderNumber}`,
      `Namaste ${newOrder.customerName}! Your order ${orderNumber} for APNA SHOES is placed successfully. Total: ₹${newOrder.totalAmount}. We are packing your fresh sneakers!`
    );

    DB.logAudit('SYSTEM', 'ORDER_CREATED', { orderNumber, total: newOrder.totalAmount });
    saveDb();
    syncOrderToSupabase(newOrder).catch(() => {});
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: Order['orderStatus'], notes?: string) {
    const order = db.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    if (notes) order.notes = notes;

    // If marked delivered, record deliveredAt and calculate 7-day return deadline!
    if (status === 'delivered') {
      const now = new Date();
      order.deliveredAt = now.toISOString();
      const returnDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      order.returnDeadline = returnDeadline.toISOString();
      if (order.shipment) {
        order.shipment.status = 'delivered';
        order.shipment.actualDelivery = now.toISOString();
        order.shipment.events.unshift({
          id: `ev-${Date.now()}`,
          statusCode: 'DL',
          statusTitle: 'Delivered',
          location: `${order.shippingAddress.city} Delivery Hub`,
          timestamp: now.toISOString(),
          description: 'Package delivered to recipient. 7-day return window started.',
        });
      }
      DB.recordNotification(
        'whatsapp',
        order.customerPhone,
        `Order Delivered: ${order.orderNumber}`,
        `Your APNA SHOES order ${order.orderNumber} is delivered! Step in style. Your 7-day return/size-exchange window is open until ${new Date(order.returnDeadline).toLocaleDateString('en-IN')}.`
      );
    }

    DB.logAudit('ADMIN', 'UPDATE_ORDER_STATUS', { orderNumber: order.orderNumber, status });
    saveDb();
    return order;
  },

  createShipment(
    orderId: string,
    courierName: string = 'Shiprocket — Delhivery Air',
    customAwb?: string,
    customTrackingUrl?: string,
    estimatedDelivery?: string,
    customStatus?: 'manifested' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered'
  ) {
    const order = db.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const awbCode = customAwb?.trim() ? customAwb.trim() : `${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    const shipmentId = order.shipment?.shipmentId || `SR-${courierName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const estDate = estimatedDelivery || order.shipment?.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    // Determine smart tracking URL if not provided
    let trackingUrl = customTrackingUrl?.trim();
    if (!trackingUrl) {
      const lowerCourier = courierName.toLowerCase();
      if (lowerCourier.includes('delhivery')) {
        trackingUrl = `https://www.delhivery.com/track/package/${awbCode}`;
      } else if (lowerCourier.includes('bluedart') || lowerCourier.includes('blue dart')) {
        trackingUrl = `https://www.bluedart.com/tracking?trackNumber=${awbCode}`;
      } else if (lowerCourier.includes('dtdc')) {
        trackingUrl = `https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${awbCode}`;
      } else if (lowerCourier.includes('shadowfax')) {
        trackingUrl = `https://tracker.shadowfax.in/#/track/${awbCode}`;
      } else if (lowerCourier.includes('xpressbees')) {
        trackingUrl = `https://www.xpressbees.com/track?awb=${awbCode}`;
      } else {
        trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
      }
    }

    const currentEvents = order.shipment?.events || [];
    const newEvent = {
      id: `ev-${Date.now()}`,
      statusCode: 'AWB_CONFIRMED',
      statusTitle: 'Airway Bill (AWB) Confirmed & Assigned',
      location: 'Apna Shoes Noida Central Warehouse',
      timestamp: new Date().toISOString(),
      description: `Dispatched via ${courierName}. Airway Bill Tracking Number: ${awbCode}`,
    };

    const shipment = {
      id: order.shipment?.id || `ship-${Date.now()}`,
      orderId: order.id,
      courierName,
      shipmentId,
      awbCode,
      status: customStatus || (order.shipment?.status === 'delivered' ? 'delivered' : 'manifested'),
      trackingUrl,
      pickupScheduledAt: order.shipment?.pickupScheduledAt || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      estimatedDelivery: estDate,
      actualDelivery: order.shipment?.actualDelivery,
      events: [...currentEvents, newEvent],
    };

    order.shipment = shipment;
    if (order.orderStatus === 'order_placed' || order.orderStatus === 'confirmed' || order.orderStatus === 'processing' || order.orderStatus === 'packed') {
      order.orderStatus = 'shipped';
    }
    order.updatedAt = new Date().toISOString();

    DB.recordNotification(
      'whatsapp',
      order.customerPhone,
      `AWB Confirmed: ${order.orderNumber}`,
      `Your APNA SHOES order ${order.orderNumber} has been confirmed with Airway Bill (AWB) ${awbCode} via ${courierName}. Track here: ${shipment.trackingUrl}`
    );

    DB.logAudit('ADMIN', 'AWB_CONFIRMED', { orderNumber: order.orderNumber, awbCode, courierName });
    saveDb();
    return order;
  },

  // 7-DAY RETURNS & REFUNDS
  getReturns() {
    return db.returns;
  },

  getUserReturns(emailOrPhone: string) {
    const query = emailOrPhone.toLowerCase().trim();
    const queryDigits = query.replace(/\D/g, '');
    return db.returns.filter(r => {
      if (r.customerEmail && r.customerEmail.toLowerCase() === query) return true;
      if (queryDigits.length >= 7) {
        const returnPhoneDigits = r.customerPhone.replace(/\D/g, '');
        return (
          returnPhoneDigits.endsWith(queryDigits) ||
          queryDigits.endsWith(returnPhoneDigits) ||
          returnPhoneDigits === queryDigits
        );
      }
      return r.customerPhone.toLowerCase().includes(query);
    });
  },

  createReturnRequest(req: {
    orderId: string;
    reason: ReturnRequest['reason'];
    reasonDetails: string;
    photoUrl?: string;
    itemsToReturn?: Array<{
      itemId?: string;
      productName: string;
      size: string;
      quantity: number;
      image?: string;
      price?: number;
    }>;
    returnType?: 'refund' | 'size_exchange';
    desiredSize?: string;
    payoutDetails?: {
      method: 'upi' | 'bank_transfer';
      upiId?: string;
      accountNumber?: string;
      ifsc?: string;
      accountHolder?: string;
    };
    pickupAddress?: string;
  }) {
    const order = db.orders.find(o => o.id === req.orderId || o.orderNumber === req.orderId);
    if (!order) throw new Error('Order not found');

    if (order.orderStatus !== 'delivered') {
      throw new Error(`Only delivered orders are eligible for return. Current status: ${order.orderStatus}`);
    }

    if (!order.deliveredAt) {
      order.deliveredAt = order.updatedAt || new Date().toISOString();
    }

    const deliveryTime = new Date(order.deliveredAt).getTime();
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    if (now - deliveryTime > sevenDaysMs) {
      throw new Error('The 7-calendar-day return window for this order has expired as per Apna Shoes Return Policy.');
    }

    const returnNumber = `RET-${Math.floor(10000 + Math.random() * 90000)}`;
    const deadline = new Date(deliveryTime + sevenDaysMs).toISOString();

    let refundAmount = order.totalAmount;
    if (req.itemsToReturn && req.itemsToReturn.length > 0) {
      const calc = req.itemsToReturn.reduce(
        (acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)),
        0
      );
      if (calc > 0) refundAmount = Math.min(order.totalAmount, calc);
    }

    const pickupAddress = req.pickupAddress || `${order.shippingAddress.flatHouse}, ${order.shippingAddress.streetLocality}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}`;

    const returnRequest: ReturnRequest = {
      id: `ret-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      itemsToReturn: req.itemsToReturn,
      returnType: req.returnType || 'refund',
      desiredSize: req.desiredSize,
      payoutDetails: req.payoutDetails,
      pickupAddress,
      reason: req.reason,
      reasonDetails: req.reasonDetails,
      photoUrl: req.photoUrl,
      status: 'requested',
      returnDeadline: deadline,
      refundAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.returns.unshift(returnRequest);
    order.orderStatus = 'return_requested';

    DB.recordNotification(
      'whatsapp',
      order.customerPhone,
      `Return Requested: ${order.orderNumber}`,
      `We received your return request ${returnNumber} for order ${order.orderNumber} (${returnRequest.returnType === 'size_exchange' ? 'Size Exchange' : '100% Refund'}). Our team will review within 24 hours to schedule doorstep pickup.`
    );

    DB.logAudit('CUSTOMER', 'RETURN_REQUESTED', { returnNumber, orderNumber: order.orderNumber });
    saveDb();
    return returnRequest;
  },

  updateReturnStatus(
    returnId: string,
    status: ReturnRequest['status'],
    adminNotes?: string,
    reverseCourier?: string,
    reverseAwb?: string,
    pickupDate?: string,
    refundTransactionId?: string
  ) {
    const ret = db.returns.find(r => r.id === returnId);
    if (!ret) return null;

    ret.status = status;
    ret.updatedAt = new Date().toISOString();
    if (adminNotes) ret.adminNotes = adminNotes;
    if (reverseCourier) ret.reverseCourier = reverseCourier;
    if (reverseAwb) ret.reverseAwb = reverseAwb;
    if (pickupDate) ret.pickupDate = pickupDate;
    if (refundTransactionId) ret.refundTransactionId = refundTransactionId;

    const order = db.orders.find(o => o.id === ret.orderId);

    if (status === 'approved') {
      if (!ret.pickupDate) {
        ret.pickupDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }
      if (!ret.reverseCourier) {
        ret.reverseCourier = 'Shiprocket — Delhivery Reverse Express';
      }
      if (!ret.reverseAwb) {
        ret.reverseAwb = `REV-${Math.floor(100000000 + Math.random() * 900000000)}`;
      }
      if (order) order.orderStatus = 'return_approved';
    } else if (status === 'picked_up') {
      if (order) order.orderStatus = 'return_picked_up';
    } else if (status === 'refund_completed') {
      if (!ret.refundTransactionId) {
        ret.refundTransactionId = `RFND-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      }
      if (order) {
        order.orderStatus = 'refunded';
        order.paymentStatus = 'refunded';
      }
    } else if (status === 'rejected') {
      if (order) order.orderStatus = 'delivered'; // revert to delivered
    }

    DB.logAudit('ADMIN', 'UPDATE_RETURN_STATUS', { returnId, status, reverseAwb: ret.reverseAwb });
    saveDb();
    return ret;
  },

  // COUPONS
  validateCoupon(code: string, subtotal: number) {
    const c = db.coupons.find(
      coupon => coupon.code.toUpperCase() === code.toUpperCase() && coupon.isActive
    );
    if (!c) {
      return { valid: false, message: 'Invalid or expired coupon code' };
    }
    if (subtotal < c.minOrderValue) {
      return { valid: false, message: `Minimum order amount of ₹${c.minOrderValue} required for coupon ${c.code}` };
    }

    let discount = 0;
    if (c.discountType === 'percentage') {
      discount = (subtotal * c.discountValue) / 100;
      if (c.maxDiscount && discount > c.maxDiscount) discount = c.maxDiscount;
    } else {
      discount = c.discountValue;
    }

    return {
      valid: true,
      coupon: c,
      discountAmount: Math.round(discount * 100) / 100,
    };
  },

  // PINCODE SERVICEABILITY
  checkPincodeServiceability(pincode: string) {
    const pin = pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      return { serviceable: false, message: 'Please enter a valid 6-digit Indian PIN code' };
    }

    // Realistic Indian postal prefix routing
    const prefix = pin.substring(0, 2);
    const pinMap: Record<string, { city: string; state: string; days: number }> = {
      '11': { city: 'New Delhi', state: 'Delhi', days: 2 },
      '20': { city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', days: 2 },
      '12': { city: 'Gurugram / Faridabad', state: 'Haryana', days: 2 },
      '40': { city: 'Mumbai', state: 'Maharashtra', days: 3 },
      '41': { city: 'Pune', state: 'Maharashtra', days: 3 },
      '56': { city: 'Bengaluru', state: 'Karnataka', days: 3 },
      '60': { city: 'Chennai', state: 'Tamil Nadu', days: 3 },
      '50': { city: 'Hyderabad', state: 'Telangana', days: 3 },
      '70': { city: 'Kolkata', state: 'West Bengal', days: 3 },
      '38': { city: 'Ahmedabad', state: 'Gujarat', days: 3 },
      '30': { city: 'Jaipur', state: 'Rajasthan', days: 3 },
      '16': { city: 'Chandigarh', state: 'Punjab', days: 2 },
    };

    const info = pinMap[prefix] || { city: 'Regional Hub', state: 'India', days: 4 };

    return {
      serviceable: true,
      pincode: pin,
      city: info.city,
      state: info.state,
      estimatedDeliveryDays: info.days,
      codAvailable: true,
      courierPartner: 'Shiprocket — Express Surface',
      message: `Delivery available in ${info.days} business days to ${info.city}, ${info.state}`,
    };
  },

  // CMS CONFIG
  getCMSConfig() {
    return db.cmsConfig;
  },

  updateCMSConfig(config: Partial<StoreCMSConfig>) {
    db.cmsConfig = {
      ...db.cmsConfig,
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    DB.logAudit('ADMIN', 'UPDATE_WEBSITE_CONFIG', { updatedFields: Object.keys(config) });
    saveDb();
    return db.cmsConfig;
  },

  // FLIPKART INTEGRATION
  getFlipkartMappings() {
    return db.flipkartMappings;
  },

  syncFlipkartStock() {
    for (const mapping of db.flipkartMappings) {
      // Find matching product variant
      for (const prod of db.products) {
        const v = prod.variants.find(item => item.sku === mapping.internalSku);
        if (v) {
          mapping.internalStock = v.stockQuantity;
          mapping.flipkartStock = v.stockQuantity;
          mapping.lastSyncedAt = new Date().toISOString();
          mapping.status = 'synced';
        }
      }
    }
    DB.logAudit('SYSTEM', 'FLIPKART_STOCK_SYNC', { count: db.flipkartMappings.length });
    saveDb();
    return db.flipkartMappings;
  },

  // INTEGRATION STATUS
  getIntegrations() {
    return db.integrations;
  },

  updateIntegrations(data: Partial<IntegrationStatus>) {
    db.integrations = {
      ...db.integrations,
      ...data,
    };
    saveDb();
    return db.integrations;
  },

  // AUDIT & NOTIFICATIONS
  logAudit(actor: string, action: string, details: any) {
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
    });
    if (db.auditLogs.length > 200) db.auditLogs.pop();
  },

  recordNotification(channel: string, recipient: string, title: string, message: string) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      channel,
      recipient,
      title,
      message,
    });
    if (db.notifications.length > 100) db.notifications.pop();
  },

  getNotifications() {
    return db.notifications;
  },

  getAuditLogs() {
    return db.auditLogs;
  },

  // NEWSLETTER SUBSCRIBERS
  getSubscribers() {
    return db.subscribers || [];
  },

  addSubscriber(email: string, source: string = 'footer_newsletter') {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
    if (!db.subscribers) db.subscribers = [];
    const exists = db.subscribers.find(s => s.email === cleanEmail);
    if (exists) {
      return { success: true, alreadySubscribed: true, subscriber: exists };
    }
    const newSub = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      source,
    };
    db.subscribers.unshift(newSub);
    DB.logAudit('USER', 'NEWSLETTER_SUBSCRIBE', { email: cleanEmail });
    saveDb();
    syncSubscriberToSupabase(cleanEmail, source).catch(() => {});
    return { success: true, alreadySubscribed: false, subscriber: newSub };
  },

  // MOBILE NUMBER OTP AUTHENTICATION
  createOtp(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    activeOtps.set(cleanPhone, {
      phone,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return code;
  },

  verifyOtp(phone: string, inputCode: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    // Allow standard testing demo code "1234"
    if (inputCode.trim() === '1234') return true;
    const entry = activeOtps.get(cleanPhone);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      activeOtps.delete(cleanPhone);
      return false;
    }
    if (entry.code === inputCode.trim()) {
      activeOtps.delete(cleanPhone);
      return true;
    }
    return false;
  },

  getRawStoreData() {
    return {
      products: db.products || [],
      categories: db.categories || [],
      coupons: db.coupons || [],
      orders: db.orders || [],
      subscribers: db.subscribers || [],
      cmsConfig: db.cmsConfig,
    };
  },
};

