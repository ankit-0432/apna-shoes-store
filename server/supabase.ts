import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanSupabaseUrl(url?: string): string {
  if (!url || url.includes('jruuseaphdynzichenzp') || !url.startsWith('http')) {
    return 'https://fzxyxhefjxsyldqsdvbp.supabase.co';
  }
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export const SUPABASE_URL = cleanSupabaseUrl(process.env.SUPABASE_URL);

function getJwtRef(token?: string): string | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return payload.ref || null;
    }
  } catch {
    return null;
  }
  return null;
}

function cleanSupabaseKey(key: string | undefined, fallback: string): string {
  if (!key || key.includes('your-') || key.length < 40) {
    return fallback;
  }
  const ref = getJwtRef(key);
  if (ref && ref !== 'fzxyxhefjxsyldqsdvbp') {
    return fallback;
  }
  return key;
}

export const SUPABASE_SERVICE_ROLE_KEY = cleanSupabaseKey(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eHl4aGVmanhzeWxkcXNkdmJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTgwMzM3MSwiZXhwIjoyMTA3Mzc5MzcxfQ.d54TM6NO-Y6ht8BuRM9W_JqG5OOq6fKoeh-3GkO2tT4'
);

export const SUPABASE_ANON_KEY = cleanSupabaseKey(
  process.env.SUPABASE_ANON_KEY,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eHl4aGVmanhzeWxkcXNkdmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDMzNzEsImV4cCI6MjEwNzM3OTM3MX0.QJPQAOxF6vZwTE18sGDoO4QfwO64k0FVOWP3B1tXeYA'
);

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});


export interface SupabaseStatusResult {
  connected: boolean;
  projectUrl: string;
  projectRef: string;
  latencyMs: number;
  tables: Record<string, { exists: boolean; rowCount?: number; error?: string }>;
  message: string;
  needsSchemaSetup: boolean;
}

/**
 * Checks connection to Supabase and verifies existence of store tables
 */
export async function getSupabaseStatus(): Promise<SupabaseStatusResult> {
  const start = Date.now();
  const projectRef = 'fzxyxhefjxsyldqsdvbp';
  const targetTables = ['products', 'categories', 'coupons', 'orders', 'subscribers', 'website_content'];
  const tablesResult: Record<string, { exists: boolean; rowCount?: number; error?: string }> = {};

  let anyTableMissing = false;

  try {
    for (const table of targetTables) {
      try {
        const { count, data, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          anyTableMissing = true;
          if (error.code === 'PGRST205') {
            tablesResult[table] = { exists: false, error: 'Table not created yet' };
          } else {
            tablesResult[table] = { exists: false, error: error.message || 'Table not found' };
          }
        } else {
          tablesResult[table] = { exists: true, rowCount: count ?? data?.length ?? 0 };
        }
      } catch (tableErr: any) {
        tablesResult[table] = { exists: false, error: tableErr.message };
        anyTableMissing = true;
      }
    }

    const latencyMs = Date.now() - start;

    return {
      connected: true,
      projectUrl: SUPABASE_URL,
      projectRef,
      latencyMs,
      tables: tablesResult,
      message: anyTableMissing
        ? 'Connected to Supabase! Some tables need to be created using the provided SQL schema.'
        : 'Connected to Supabase! All tables are active and responding.',
      needsSchemaSetup: anyTableMissing,
    };
  } catch (err: any) {
    return {
      connected: false,
      projectUrl: SUPABASE_URL,
      projectRef,
      latencyMs: Date.now() - start,
      tables: tablesResult,
      message: `Failed to connect to Supabase: ${err.message}`,
      needsSchemaSetup: true,
    };
  }
}

/**
 * Reads SQL schema file for display and setup
 */
export function getSqlSchema(): string {
  const candidatePaths = [
    path.resolve(process.cwd(), 'database/schema.sql'),
    path.resolve(__dirname, 'database/schema.sql'),
    path.resolve(__dirname, '../database/schema.sql'),
  ];
  for (const schemaPath of candidatePaths) {
    if (fs.existsSync(schemaPath)) {
      return fs.readFileSync(schemaPath, 'utf-8');
    }
  }
  return '-- Schema file not found';
}

/**
 * Asynchronously pushes a new newsletter subscriber to Supabase
 */
export async function syncSubscriberToSupabase(email: string, source: string = 'footer_newsletter') {
  try {
    const { error } = await supabaseAdmin.from('subscribers').upsert(
      {
        email: email.trim().toLowerCase(),
        source,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
    if (error && error.code !== 'PGRST205') {
      console.warn('[Supabase] Warning syncing subscriber:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase] Non-fatal error syncing subscriber:', err.message);
  }
}

/**
 * Asynchronously pushes an order to Supabase
 */
export async function syncOrderToSupabase(order: any) {
  try {
    const { error } = await supabaseAdmin.from('orders').upsert({
      order_number: order.id,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      shipping_address: order.shippingAddress,
      billing_address: order.billingAddress,
      subtotal: order.subtotal,
      discount_amount: order.discountAmount || 0,
      coupon_code: order.couponCode || null,
      tax_amount: order.taxAmount || 0,
      shipping_fee: order.shippingFee || 0,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus || 'pending',
      order_status: order.orderStatus || 'order_placed',
      notes: order.notes || null,
      created_at: order.createdAt || new Date().toISOString(),
    });
    if (error && error.code !== 'PGRST205') {
      console.warn('[Supabase] Warning syncing order:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase] Non-fatal error syncing order:', err.message);
  }
}

/**
 * Syncs all local store data (products, categories, coupons, orders, subscribers) to Supabase tables
 */
export async function syncStoreToSupabase(storeData: {
  products: any[];
  categories: any[];
  coupons: any[];
  orders: any[];
  subscribers?: any[];
  cmsConfig?: any;
}): Promise<{
  success: boolean;
  synced: {
    categories: number;
    products: number;
    coupons: number;
    orders: number;
    subscribers: number;
  };
  errors: string[];
}> {
  const result = {
    success: true,
    synced: {
      categories: 0,
      products: 0,
      coupons: 0,
      orders: 0,
      subscribers: 0,
    },
    errors: [] as string[],
  };

  // 1. Sync Categories
  if (storeData.categories?.length) {
    try {
      const formattedCategories = storeData.categories.map((c, idx) => ({
        slug: c.id,
        name: c.name,
        description: c.description || '',
        image_url: c.image || '',
        display_order: idx,
        is_active: true,
      }));

      const { error } = await supabaseAdmin
        .from('categories')
        .upsert(formattedCategories, { onConflict: 'slug' });

      if (error) {
        result.errors.push(`Categories: ${error.message}`);
      } else {
        result.synced.categories = formattedCategories.length;
      }
    } catch (e: any) {
      result.errors.push(`Categories error: ${e.message}`);
    }
  }

  // 2. Sync Products
  if (storeData.products?.length) {
    try {
      const formattedProducts = storeData.products.map(p => ({
        sku: p.sku || `SKU-${p.id}`,
        name: p.name,
        slug: p.slug || p.id,
        brand: p.brand || 'APNA SHOES',
        description: p.description || '',
        gender: p.gender || 'unisex',
        original_price: p.originalPrice || p.price || 1999,
        selling_price: p.sellingPrice || p.price || 1499,
        discount_percentage: p.discountPercentage || 0,
        images: p.images || [p.image],
        badge: p.badge || null,
        rating: p.rating || 4.5,
        review_count: p.reviewCount || 0,
        is_active: true,
        is_featured: !!p.isFeatured,
      }));

      const { error } = await supabaseAdmin
        .from('products')
        .upsert(formattedProducts, { onConflict: 'sku' });

      if (error) {
        result.errors.push(`Products: ${error.message}`);
      } else {
        result.synced.products = formattedProducts.length;
      }
    } catch (e: any) {
      result.errors.push(`Products error: ${e.message}`);
    }
  }

  // 3. Sync Coupons
  if (storeData.coupons?.length) {
    try {
      const formattedCoupons = storeData.coupons.map(c => ({
        code: c.code.toUpperCase(),
        description: c.description || '',
        discount_type: c.discountType,
        discount_value: c.discountValue,
        min_order_value: c.minOrderValue || 0,
        max_discount: c.maxDiscount || null,
        is_active: c.isActive !== false,
      }));

      const { error } = await supabaseAdmin
        .from('coupons')
        .upsert(formattedCoupons, { onConflict: 'code' });

      if (error) {
        result.errors.push(`Coupons: ${error.message}`);
      } else {
        result.synced.coupons = formattedCoupons.length;
      }
    } catch (e: any) {
      result.errors.push(`Coupons error: ${e.message}`);
    }
  }

  // 4. Sync Orders
  if (storeData.orders?.length) {
    try {
      const formattedOrders = storeData.orders.map(o => ({
        order_number: o.id,
        customer_name: o.customerName,
        customer_email: o.customerEmail,
        customer_phone: o.customerPhone,
        shipping_address: o.shippingAddress,
        billing_address: o.billingAddress,
        subtotal: o.subtotal,
        discount_amount: o.discountAmount || 0,
        coupon_code: o.couponCode || null,
        tax_amount: o.taxAmount || 0,
        shipping_fee: o.shippingFee || 0,
        total_amount: o.totalAmount,
        payment_method: o.paymentMethod,
        payment_status: o.paymentStatus || 'pending',
        order_status: o.orderStatus || 'order_placed',
        created_at: o.createdAt || new Date().toISOString(),
      }));

      const { error } = await supabaseAdmin
        .from('orders')
        .upsert(formattedOrders, { onConflict: 'order_number' });

      if (error) {
        result.errors.push(`Orders: ${error.message}`);
      } else {
        result.synced.orders = formattedOrders.length;
      }
    } catch (e: any) {
      result.errors.push(`Orders error: ${e.message}`);
    }
  }

  // 5. Sync Subscribers
  if (storeData.subscribers?.length) {
    try {
      const formattedSubscribers = storeData.subscribers.map(s => ({
        email: s.email.toLowerCase(),
        source: s.source || 'footer_newsletter',
        created_at: s.subscribedAt || new Date().toISOString(),
      }));

      const { error } = await supabaseAdmin
        .from('subscribers')
        .upsert(formattedSubscribers, { onConflict: 'email' });

      if (error) {
        result.errors.push(`Subscribers: ${error.message}`);
      } else {
        result.synced.subscribers = formattedSubscribers.length;
      }
    } catch (e: any) {
      result.errors.push(`Subscribers error: ${e.message}`);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}
