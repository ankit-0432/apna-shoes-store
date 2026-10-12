-- ==============================================================================
-- APNA SHOES — POSTGRESQL / SUPABASE DATABASE SCHEMA & MIGRATIONS
-- Store: APNA SHOES | Tagline: "Har Kadam, Apna Style."
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER ROLES & PROFILES
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO user_roles (role_name, description) VALUES
    ('admin', 'Super administrator with full catalog, order, and CMS control'),
    ('customer', 'Registered retail shopper')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer' REFERENCES user_roles(role_name),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    address_type VARCHAR(20) DEFAULT 'home', -- 'home', 'work', 'other'
    is_default BOOLEAN DEFAULT FALSE,
    delivery_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    display_order INT DEFAULT 0,
    show_on_home BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100) DEFAULT 'APNA SHOES',
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    gender VARCHAR(20) DEFAULT 'unisex', -- 'men', 'women', 'kids', 'unisex'
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    badge VARCHAR(50), -- 'Bestseller', 'New Arrival', 'Trending'
    rating NUMERIC(2, 1) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    weight_grams INT DEFAULT 750,
    dimensions_cm JSONB DEFAULT '{"length": 32, "width": 20, "height": 12}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    return_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRODUCT VARIANTS & INVENTORY
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(20) NOT NULL, -- 'UK 6', 'UK 7', 'UK 8', etc.
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'flat'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    usage_limit INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE
);

-- 8. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'APNA-2026-8941'
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'razorpay', 'cod'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    order_status VARCHAR(50) DEFAULT 'order_placed', 
    -- 'pending_payment', 'order_placed', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'
    delivered_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    product_image TEXT
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    gateway VARCHAR(50) DEFAULT 'razorpay',
    transaction_id VARCHAR(150),
    razorpay_order_id VARCHAR(150),
    razorpay_payment_id VARCHAR(150),
    razorpay_signature VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SHIPMENTS & TRACKING
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    courier_name VARCHAR(100) DEFAULT 'Shiprocket',
    shipment_id VARCHAR(150),
    awb_code VARCHAR(150),
    status VARCHAR(50) DEFAULT 'manifested',
    tracking_url TEXT,
    pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    location VARCHAR(150),
    status_code VARCHAR(50),
    description TEXT NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. RETURNS & REFUNDS (7-DAY POLICY)
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    return_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'requested', 
    -- 'requested', 'approved', 'rejected', 'pickup_scheduled', 'item_received', 'refund_processed'
    reason VARCHAR(100) NOT NULL,
    reason_details TEXT,
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    return_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    refund_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    amount NUMERIC(10, 2) NOT NULL,
    method VARCHAR(50) DEFAULT 'original_payment_method',
    refund_reference VARCHAR(150),
    status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. REVIEWS & WISHLISTS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id),
    author_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_buyer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, product_id)
);

-- 13. WEBSITE CONTENT & CMS CONFIGURATION
CREATE TABLE IF NOT EXISTS website_content (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'current_config',
    store_name VARCHAR(100) DEFAULT 'APNA SHOES',
    tagline VARCHAR(200) DEFAULT 'Har Kadam, Apna Style.',
    announcement_text VARCHAR(255) DEFAULT '⚡ FREE Express Shipping across India on orders above ₹999 | 7-Day Hassle-Free Returns',
    brand_primary_color VARCHAR(20) DEFAULT '#FF5A1F',
    hero_headline VARCHAR(255) DEFAULT 'Har Kadam, Apna Style.',
    hero_subheadline TEXT DEFAULT 'Discover India’s freshest streetwear, high-performance running shoes, and everyday sneakers built for endurance, comfort, and undeniable swagger.',
    hero_cta_text VARCHAR(50) DEFAULT 'Explore Collection',
    contact_email VARCHAR(100) DEFAULT 'care@apnashoes.in',
    contact_phone VARCHAR(50) DEFAULT '+91 98765 43210',
    contact_address TEXT DEFAULT 'Apna Shoes HQ, Sector 62, Noida, NCR Delhi 201301',
    policies JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. FLIPKART INTEGRATION TABLE
CREATE TABLE IF NOT EXISTS flipkart_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_sku VARCHAR(100) UNIQUE NOT NULL,
    flipkart_fsn VARCHAR(100) NOT NULL,
    flipkart_listing_id VARCHAR(100),
    is_synced BOOLEAN DEFAULT TRUE,
    stock_override INT,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. AUDIT LOGS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID,
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp'
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) DEFAULT 'footer_newsletter',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY POLICIES (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Profiles: user reads and updates their own
CREATE POLICY profiles_user_policy ON profiles
    FOR ALL USING (auth.uid() = user_id);

-- Addresses: user reads and updates their own
CREATE POLICY addresses_user_policy ON addresses
    FOR ALL USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Orders: customer can see own orders, admins can see all
CREATE POLICY orders_customer_policy ON orders
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Public read access for products, categories, reviews, content
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_public_read ON products FOR SELECT USING (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_read ON categories FOR SELECT USING (true);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupons_public_read ON coupons FOR SELECT USING (true);

ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_public_read ON website_content FOR SELECT USING (true);

-- Subscribers: Allow public signup and admin read
CREATE POLICY subscribers_insert_policy ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY subscribers_select_policy ON subscribers FOR SELECT USING (true);

