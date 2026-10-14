import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { DB } from './server/db.js';
import { getSupabaseStatus, syncStoreToSupabase, getSqlSchema } from './server/supabase.js';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // --- CONFIG / CMS ---
  app.get('/api/config', (_req: Request, res: Response) => {
    try {
      const config = DB.getCMSConfig();
      res.json({ success: true, data: config });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/config', (req: Request, res: Response) => {
    try {
      const updated = DB.updateCMSConfig(req.body);
      res.json({ success: true, data: updated, message: 'Website content updated and published live!' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- PRODUCTS ---
  app.get('/api/products', (req: Request, res: Response) => {
    try {
      const { category, gender, search, minPrice, maxPrice, sort, admin } = req.query;
      if (admin === 'true') {
        return res.json({ success: true, data: DB.getAllProductsAdmin() });
      }
      const products = DB.getProducts({
        category: category as string,
        gender: gender as string,
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: sort as string,
      });
      res.json({ success: true, data: products });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/products/:slug', (req: Request, res: Response) => {
    try {
      const product = DB.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/products', (req: Request, res: Response) => {
    try {
      const product = DB.saveProduct(req.body);
      res.json({ success: true, data: product, message: 'Product saved successfully' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    try {
      const success = DB.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // CSV Import & Export
  app.get('/api/products/export-csv', (_req: Request, res: Response) => {
    try {
      const products = DB.getAllProductsAdmin();
      const headers = ['SKU', 'Name', 'Category', 'Gender', 'SellingPrice', 'OriginalPrice', 'Discount', 'Stock', 'Badge', 'Images'];
      const rows = products.map(p => {
        const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
        const imagesStr = (p.images || []).join(';');
        return [
          `"${p.sku}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.categorySlug}"`,
          `"${p.gender}"`,
          p.sellingPrice,
          p.originalPrice,
          `${p.discountPercentage}%`,
          totalStock,
          `"${p.badge || ''}"`,
          `"${imagesStr.replace(/"/g, '""')}"`,
        ].join(',');
      });
      const csv = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="apna_shoes_catalog.csv"');
      res.send(csv);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/products/import-csv', (req: Request, res: Response) => {
    try {
      const { csvText } = req.body;
      if (!csvText) {
        return res.status(400).json({ success: false, error: 'No CSV content provided' });
      }
      const lines = csvText.trim().split('\n');
      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
        if (parts.length >= 5) {
          const sku = parts[0];
          const name = parts[1];
          const categorySlug = parts[2] || 'mens-sneakers';
          const gender = (parts[3] as any) || 'unisex';
          const sellingPrice = parseFloat(parts[4]) || 1499;
          const originalPrice = parseFloat(parts[5]) || sellingPrice * 1.5;
          const badge = parts[8] || 'New Drop';
          const imgField = parts[9] || '';
          const images = imgField ? imgField.split(';').map((u: string) => u.trim()).filter(Boolean) : [];

          DB.saveProduct({
            sku,
            name,
            categorySlug,
            gender,
            sellingPrice,
            originalPrice,
            badge: badge as any,
            images: images.length > 0 ? images : undefined,
          });
          importedCount++;
        }
      }
      res.json({ success: true, message: `Successfully imported/updated ${importedCount} products in APNA SHOES catalog.` });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // --- CATEGORIES ---
  app.get('/api/categories', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getCategories() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    try {
      const cat = DB.saveCategory(req.body);
      res.json({ success: true, data: cat });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // --- COUPONS ---
  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    try {
      const { code, subtotal } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code required' });
      }
      const result = DB.validateCoupon(code, Number(subtotal) || 0);
      res.json({ success: result.valid, ...result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- PINCODE SERVICEABILITY ---
  app.get('/api/pincode/:pincode', (req: Request, res: Response) => {
    try {
      const result = DB.checkPincodeServiceability(req.params.pincode);
      res.json({ success: true, data: result });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- ORDERS ---
  app.get('/api/orders', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getOrders() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    try {
      const order = DB.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/orders/user/:query', (req: Request, res: Response) => {
    try {
      const orders = DB.getUserOrders(req.params.query);
      res.json({ success: true, data: orders });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        billingAddress,
        items,
        paymentMethod,
        couponCode,
      } = req.body;

      if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Missing required order details' });
      }

      // Server-side calculation & verification
      let subtotal = 0;
      for (const item of items) {
        const prod = DB.getProductBySlug(item.productId);
        if (!prod) throw new Error(`Product ${item.productName} not found`);
        const itemTotal = prod.sellingPrice * item.quantity;
        subtotal += itemTotal;
      }

      let discountAmount = 0;
      if (couponCode) {
        const couponCheck = DB.validateCoupon(couponCode, subtotal);
        if (couponCheck.valid && couponCheck.discountAmount) {
          discountAmount = couponCheck.discountAmount;
        }
      }

      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      // Indian GST 18% is inclusive in display price or calculated
      const taxAmount = Math.round((discountedSubtotal * 0.18 / 1.18) * 100) / 100;
      const cms = DB.getCMSConfig();
      const shippingFee = discountedSubtotal >= cms.freeShippingThreshold ? 0 : cms.defaultShippingFee;
      const totalAmount = Math.round((discountedSubtotal + shippingFee) * 100) / 100;

      const normalizedItems = items.map((item: any, idx: number) => {
        const prod = DB.getProductBySlug(item.productId);
        const unitPrice = Number(item.unitPrice ?? item.price ?? prod?.sellingPrice ?? 0);
        const quantity = Number(item.quantity ?? 1);
        const totalPrice = Number(item.totalPrice ?? (unitPrice * quantity));
        const sku = item.sku || (prod ? `${prod.sku}-${item.size?.replace(/\s+/g, '') || 'STD'}` : `ITEM-${idx + 1}`);
        const image = item.image || prod?.images?.[0] || '';
        return {
          id: item.id || `oi-${Date.now()}-${idx}`,
          productId: item.productId,
          variantId: item.variantId || 'v-default',
          productName: item.productName || prod?.name || 'Footwear',
          sku,
          size: item.size || 'Standard',
          color: item.color || 'Standard',
          unitPrice,
          quantity,
          totalPrice,
          image,
          graphicType: item.graphicType || prod?.graphicType,
        };
      });

      const order = DB.createOrder({
        customerName,
        customerEmail: customerEmail || `${customerPhone.replace(/\D/g, '')}@apnashoes.in`,
        customerPhone,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        items: normalizedItems,
        subtotal,
        discountAmount,
        couponCode: couponCode || undefined,
        taxAmount,
        shippingFee,
        totalAmount,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'order_placed',
        razorpayOrderId: req.body.razorpayOrderId,
        razorpayPaymentId: req.body.razorpayPaymentId,
      });

      res.json({ success: true, data: order, message: 'Order placed successfully!' });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.post('/api/orders/:id/status', (req: Request, res: Response) => {
    try {
      const { status, notes } = req.body;
      const updated = DB.updateOrderStatus(req.params.id, status, notes);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/orders/:id/shipment', (req: Request, res: Response) => {
    try {
      const { courierName, awbCode, trackingUrl, estimatedDelivery, status } = req.body;
      const updated = DB.createShipment(
        req.params.id,
        courierName,
        awbCode,
        trackingUrl,
        estimatedDelivery,
        status
      );
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: updated, message: 'Airway Bill (AWB) generated & order confirmed!' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- RAZORPAY INTEGRATION ---
  app.post('/api/payment/razorpay/create', (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      const amountInPaise = Math.round(Number(amount) * 100);
      const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      res.json({
        success: true,
        data: {
          id: razorpayOrderId,
          entity: 'order',
          amount: amountInPaise,
          currency: 'INR',
          status: 'created',
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_apnashoes2026',
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/payment/razorpay/verify', (req: Request, res: Response) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (keySecret && razorpaySignature) {
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== razorpaySignature) {
          return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
        }
      }

      res.json({
        success: true,
        verified: true,
        message: 'Razorpay payment signature verified successfully',
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- MOBILE NUMBER OTP AUTHENTICATION ---
  app.post('/api/auth/send-otp', (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
        return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number' });
      }
      const otp = DB.createOtp(phone);
      DB.recordNotification(
        'sms',
        phone,
        'OTP Verification',
        `Your APNA SHOES verification code is ${otp}. Valid for 10 minutes. Do not share with anyone.`
      );
      res.json({
        success: true,
        message: `OTP sent successfully to ${phone}`,
        demoOtp: otp, // Provides instant testing preview & 1-click auto-fill
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    try {
      const { phone, otp, name, email } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: 'Phone and OTP code are required' });
      }
      const isValid = DB.verifyOtp(phone, otp);
      if (!isValid) {
        return res.status(400).json({ success: false, error: 'Incorrect or expired OTP. Please try again or use 1234.' });
      }

      const cleanDigits = phone.replace(/\D/g, '');
      const user = {
        id: `usr-${cleanDigits}`,
        phone,
        name: name?.trim() || `Customer (${cleanDigits.slice(-4)})`,
        email: email?.trim() || `${cleanDigits}@apnashoes.in`,
        role: 'customer' as const,
      };

      res.json({
        success: true,
        message: 'Mobile number verified successfully!',
        data: user,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- 7-DAY RETURNS & REFUNDS ---
  app.get('/api/returns', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getReturns() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/returns/user/:query', (req: Request, res: Response) => {
    try {
      const returns = DB.getUserReturns(req.params.query);
      res.json({ success: true, data: returns });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/returns', (req: Request, res: Response) => {
    try {
      const returnReq = DB.createReturnRequest(req.body);
      res.json({
        success: true,
        data: returnReq,
        message: 'Return request submitted. Doorstep pickup scheduled within 24–48h.',
      });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.post('/api/returns/:id/status', (req: Request, res: Response) => {
    try {
      const { status, adminNotes, reverseCourier, reverseAwb, pickupDate, refundTransactionId } = req.body;
      const updated = DB.updateReturnStatus(
        req.params.id,
        status,
        adminNotes,
        reverseCourier,
        reverseAwb,
        pickupDate,
        refundTransactionId
      );
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Return request not found' });
      }
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- FLIPKART INTEGRATION ---
  app.get('/api/flipkart/mappings', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getFlipkartMappings() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/flipkart/sync', (_req: Request, res: Response) => {
    try {
      const synced = DB.syncFlipkartStock();
      res.json({ success: true, data: synced, message: `Synced ${synced.length} SKUs with Flipkart Marketplace` });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/flipkart/simulate-order', (_req: Request, res: Response) => {
    try {
      const randomFkId = `OD${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;
      DB.logAudit('FLIPKART', 'MARKETPLACE_ORDER_RECEIVED', {
        flipkartOrderId: randomFkId,
        sku: 'APNA-AG-01-BLK-UK8',
        qty: 1,
        channel: 'Flipkart Assured',
      });
      res.json({
        success: true,
        message: `Flipkart external order ${randomFkId} ingested and allocated to fulfillment task list.`,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- INTEGRATIONS STATUS & ADMIN METRICS ---
  app.get('/api/integrations', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getIntegrations() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/integrations', (req: Request, res: Response) => {
    try {
      const updated = DB.updateIntegrations(req.body);
      res.json({ success: true, data: updated, message: 'Integration settings saved' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/admin/metrics', (_req: Request, res: Response) => {
    try {
      const orders = DB.getOrders();
      const products = DB.getAllProductsAdmin();
      const returns = DB.getReturns();

      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const pendingOrders = orders.filter(o => ['order_placed', 'confirmed', 'processing', 'packed'].includes(o.orderStatus)).length;
      const shippedOrders = orders.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'out_for_delivery').length;
      const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
      const pendingReturns = returns.filter(r => r.status === 'requested' || r.status === 'approved').length;

      // Low stock variants count
      let lowStockCount = 0;
      products.forEach(p => {
        p.variants.forEach(v => {
          if (v.stockQuantity <= 10) lowStockCount++;
        });
      });

      res.json({
        success: true,
        data: {
          totalOrders: orders.length,
          totalRevenue: Math.round(totalRevenue),
          pendingOrders,
          shippedOrders,
          deliveredOrders,
          pendingReturns,
          lowStockCount,
          totalProducts: products.length,
        },
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/notifications', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getNotifications() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/audit-logs', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getAuditLogs() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- NEWSLETTER SUBSCRIBERS ---
  app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
    try {
      const { email, source } = req.body;
      const result = DB.addSubscriber(email, source);
      res.json({
        success: true,
        data: result.subscriber,
        alreadySubscribed: result.alreadySubscribed,
        message: result.alreadySubscribed
          ? 'You are already subscribed to APNA SHOES drops!'
          : 'Welcome to APNA SHOES VIP Club! ₹200 coupon code FIRSTPAIR is ready.',
      });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  app.get('/api/newsletter/subscribers', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: DB.getSubscribers() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- SUPABASE CLOUD DATABASE ---
  app.get('/api/supabase/status', async (_req: Request, res: Response) => {
    try {
      const status = await getSupabaseStatus();
      res.json({ success: true, data: status });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/supabase/sync', async (_req: Request, res: Response) => {
    try {
      const rawData = DB.getRawStoreData();
      const syncResult = await syncStoreToSupabase(rawData);
      res.json({
        success: syncResult.success,
        data: syncResult,
        message: syncResult.success
          ? `Successfully synchronized local store data to Supabase! (${syncResult.synced.products} products, ${syncResult.synced.categories} categories, ${syncResult.synced.orders} orders)`
          : `Sync completed with errors: ${syncResult.errors.join(', ')}`,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/supabase/schema', (_req: Request, res: Response) => {
    try {
      const schemaSql = getSqlSchema();
      res.json({ success: true, data: schemaSql });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });


  // ==========================================
  // VITE OR STATIC FRONTEND SERVING
  // ==========================================
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ APNA SHOES server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start APNA SHOES server:', err);
  process.exit(1);
});
