import { Product, ProductVariant } from '../types/store.js';

export interface ShopifyConfig {
  domain: string;
  storefrontToken: string;
  apiVersion: string;
}

export interface ShopifyShopInfo {
  name: string;
  domain: string;
  url: string;
  description?: string | null;
  currencyCode?: string;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: { url: string; altText?: string | null } | null;
  productsCount?: number;
}

export interface ShopifyProductVariantNode {
  id: string;
  title: string;
  sku?: string | null;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  productType: string;
  vendor: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string | null;
        width?: number;
        height?: number;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariantNode;
    }>;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    product: {
      id: string;
      title: string;
      handle: string;
      images: { edges: Array<{ node: { url: string } }> };
    };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
  lines: ShopifyCartLine[];
}

export interface ShopifyCustomerOrder {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  statusUrl?: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: Array<{
    title: string;
    quantity: number;
    originalTotalPrice: { amount: string; currencyCode: string };
  }>;
}

export interface ShopifyCustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string | null;
  defaultAddress?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
    phone?: string;
  } | null;
  addresses?: Array<{
    id: string;
    address1?: string;
    city?: string;
    province?: string;
    zip?: string;
  }>;
  orders: ShopifyCustomerOrder[];
}

export function getShopifyConfig(): ShopifyConfig {
  const domain =
    (import.meta as any).env?.VITE_SHOPIFY_STORE_DOMAIN ||
    'apna-shoes-store.myshopify.com';
  const storefrontToken =
    (import.meta as any).env?.VITE_SHOPIFY_STOREFRONT_TOKEN ||
    'd9b7f2948c1872dc3c33fb58ec1f0453';
  const apiVersion =
    (import.meta as any).env?.VITE_SHOPIFY_API_VERSION ||
    '2026-10';

  return { domain, storefrontToken, apiVersion };
}

/**
 * Core GraphQL fetch function against Shopify Storefront API
 */
export async function shopifyStorefrontQuery<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const { domain, storefrontToken, apiVersion } = getShopifyConfig();
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(`Shopify GraphQL error: ${json.errors.map((e: any) => e.message).join(', ')}`);
  }

  return json.data as T;
}

/**
 * Test connectivity & fetch shop metadata
 */
export async function checkShopifyConnection(): Promise<{
  connected: boolean;
  shop?: ShopifyShopInfo;
  error?: string;
}> {
  try {
    const data = await shopifyStorefrontQuery<{
      shop: {
        name: string;
        primaryDomain: { host: string; url: string };
        description?: string | null;
        paymentSettings?: { currencyCode: string };
      };
    }>(`
      query GetShopInfo {
        shop {
          name
          primaryDomain {
            host
            url
          }
          description
          paymentSettings {
            currencyCode
          }
        }
      }
    `);

    return {
      connected: true,
      shop: {
        name: data.shop.name,
        domain: data.shop.primaryDomain.host,
        url: data.shop.primaryDomain.url,
        description: data.shop.description,
        currencyCode: data.shop.paymentSettings?.currencyCode || 'INR',
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Failed to connect to Shopify Storefront API',
    };
  }
}

/**
 * Fetch all Shopify Collections
 */
export async function fetchShopifyCollections(first = 20): Promise<ShopifyCollection[]> {
  const query = `
    query GetCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            products(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    collections: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          description: string;
          image?: { url: string; altText?: string | null } | null;
          products: { edges: Array<{ node: { id: string } }> };
        };
      }>;
    };
  }>(query, { first });

  return data.collections.edges.map((e) => ({
    id: e.node.id,
    title: e.node.title,
    handle: e.node.handle,
    description: e.node.description,
    image: e.node.image,
    productsCount: e.node.products.edges.length,
  }));
}

/**
 * Fetch raw products from Shopify
 */
export async function fetchShopifyProducts(first = 50): Promise<ShopifyProductNode[]> {
  const query = `
    query GetProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            tags
            productType
            vendor
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 8) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 25) {
              edges {
                node {
                  id
                  title
                  sku
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    products: { edges: Array<{ node: ShopifyProductNode }> };
  }>(query, { first });

  return data.products.edges.map((e) => e.node);
}

/**
 * Fetch a single Shopify product by handle
 */
export async function fetchShopifyProductByHandle(handle: string): Promise<ShopifyProductNode | null> {
  const query = `
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        tags
        productType
        vendor
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              sku
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              availableForSale
              quantityAvailable
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    product: ShopifyProductNode | null;
  }>(query, { handle });

  return data.product;
}

/**
 * Convert Shopify Product Node to the internal APNA SHOES `Product` model
 */
export function mapShopifyProductToStoreProduct(node: ShopifyProductNode): Product {
  const rawId = node.id.split('/').pop() || String(Date.now());
  const id = `shopify-${rawId}`;

  const minPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || '999');
  const sellingPrice = Math.round(minPrice);

  const firstVariant = node.variants?.edges?.[0]?.node;
  const compareAt = firstVariant?.compareAtPrice?.amount
    ? parseFloat(firstVariant.compareAtPrice.amount)
    : Math.round(sellingPrice * 1.45);
  const originalPrice = Math.max(compareAt, sellingPrice);
  const discountPercentage = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  const images = node.images?.edges?.map((e) => e.node.url) || [];
  if (images.length === 0) {
    images.push('https://cdn.shopify.com/s/files/1/0687/7737/7855/files/ROSTER.jpg?v=1792173935');
  }

  const storeVariants: ProductVariant[] = [];
  if (node.variants?.edges?.length) {
    node.variants.edges.forEach((edge, idx) => {
      const v = edge.node;
      const sizeOpt = v.selectedOptions.find((o) =>
        o.name.toUpperCase().includes('SIZE')
      );
      const sizeVal = sizeOpt?.value || v.title || `UK ${6 + idx}`;
      const formattedSize = sizeVal.toUpperCase().startsWith('UK')
        ? sizeVal
        : `UK ${sizeVal}`;

      const colorOpt = v.selectedOptions.find((o) =>
        o.name.toUpperCase().includes('COLOR') || o.name.toUpperCase().includes('COLOUR')
      );

      storeVariants.push({
        id: v.id,
        sku: v.sku || `SHP-${rawId}-${idx + 1}`,
        size: formattedSize,
        colorName: colorOpt?.value || 'Classic Roster',
        colorHex: '#FF5A1F',
        stockQuantity: v.availableForSale ? (v.quantityAvailable ?? 25) : 0,
      });
    });
  }

  if (storeVariants.length === 0) {
    storeVariants.push(
      { id: `v-${id}-6`, sku: `SHP-${rawId}-6`, size: 'UK 6', colorName: 'Classic Roster', colorHex: '#FF5A1F', stockQuantity: 20 },
      { id: `v-${id}-7`, sku: `SHP-${rawId}-7`, size: 'UK 7', colorName: 'Classic Roster', colorHex: '#FF5A1F', stockQuantity: 20 },
      { id: `v-${id}-8`, sku: `SHP-${rawId}-8`, size: 'UK 8', colorName: 'Classic Roster', colorHex: '#FF5A1F', stockQuantity: 20 },
      { id: `v-${id}-9`, sku: `SHP-${rawId}-9`, size: 'UK 9', colorName: 'Classic Roster', colorHex: '#FF5A1F', stockQuantity: 20 }
    );
  }

  const textBlob = `${node.title} ${node.description} ${node.tags.join(' ')} ${node.productType}`.toLowerCase();
  let gender: Product['gender'] = 'unisex';
  if (textBlob.includes('women') || textBlob.includes('female') || textBlob.includes('ladies')) {
    gender = 'women';
  } else if (textBlob.includes('kid') || textBlob.includes('child') || textBlob.includes('boy') || textBlob.includes('girl')) {
    gender = 'kids';
  } else if (textBlob.includes('men') || textBlob.includes('male') || textBlob.includes('gent')) {
    gender = 'men';
  }

  let categorySlug = 'mens-sneakers';
  if (gender === 'women') categorySlug = 'womens-sneakers';
  if (gender === 'kids') categorySlug = 'kids-shoes';
  if (textBlob.includes('run') || textBlob.includes('jog') || textBlob.includes('sport')) categorySlug = 'running-shoes';
  if (textBlob.includes('casual') || textBlob.includes('street')) categorySlug = 'casual-sneakers';

  return {
    id,
    sku: node.variants?.edges?.[0]?.node?.sku || `APNA-SHP-${rawId}`,
    name: node.title,
    slug: node.handle || `shopify-${rawId}`,
    brand: node.vendor || 'APNA SHOES',
    description: node.description || `${node.title} — Official product synced from APNA SHOES Shopify Store.`,
    gender,
    categorySlug,
    originalPrice,
    sellingPrice,
    discountPercentage,
    variants: storeVariants,
    images,
    badge: 'New Drop',
    rating: 4.9,
    reviewCount: 38,
    specifications: {
      'Source': 'Shopify Storefront Connected',
      'Store Domain': 'apna-shoes-store.myshopify.com',
      'Sole Material': 'Dual-Density EVA Foam',
      'Upper': 'Engineered Breathable Mesh',
      'Origin': 'Made in India',
      'Fit': 'Standard Indian UK Fit',
    },
    weightGrams: 650,
    dimensionsCm: { length: 32, width: 20, height: 12 },
    isActive: node.availableForSale,
    isFeatured: true,
    returnEligible: true,
    createdAt: new Date().toISOString(),
  };
}

// ==========================================
// SHOPIFY CART API (MUTATIONS & QUERIES)
// ==========================================

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            product {
              id
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

function formatCartResponse(cartData: any): ShopifyCart {
  return {
    id: cartData.id,
    checkoutUrl: cartData.checkoutUrl,
    totalQuantity: cartData.totalQuantity || 0,
    cost: {
      totalAmount: cartData.cost?.totalAmount || { amount: '0.0', currencyCode: 'INR' },
      subtotalAmount: cartData.cost?.subtotalAmount || { amount: '0.0', currencyCode: 'INR' },
    },
    lines: (cartData.lines?.edges || []).map((e: any) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      merchandise: e.node.merchandise,
    })),
  };
}

/**
 * Create a new cart in Shopify
 */
export async function createShopifyCart(
  lines: Array<{ merchandiseId: string; quantity: number }>,
  customerAccessToken?: string
): Promise<ShopifyCart> {
  const mutation = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input: any = { lines };
  if (customerAccessToken) {
    input.buyerIdentity = { customerAccessToken };
  }

  const data = await shopifyStorefrontQuery<{
    cartCreate: {
      cart: any;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, { input });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
  }

  return formatCartResponse(data.cartCreate.cart);
}

/**
 * Add items to an existing Shopify cart
 */
export async function addLinesToShopifyCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart> {
  const mutation = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    cartLinesAdd: {
      cart: any;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, { cartId, lines });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '));
  }

  return formatCartResponse(data.cartLinesAdd.cart);
}

/**
 * Update line item quantities in Shopify cart
 */
export async function updateLinesInShopifyCart(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart> {
  const mutation = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    cartLinesUpdate: {
      cart: any;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, { cartId, lines });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(', '));
  }

  return formatCartResponse(data.cartLinesUpdate.cart);
}

/**
 * Remove line items from Shopify cart
 */
export async function removeLinesFromShopifyCart(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const mutation = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    cartLinesRemove: {
      cart: any;
      userErrors: Array<{ field: string; message: string }>;
    };
  }>(mutation, { cartId, lineIds });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '));
  }

  return formatCartResponse(data.cartLinesRemove.cart);
}

/**
 * Retrieve current cart from Shopify
 */
export async function getShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_FRAGMENT}
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{ cart: any }>(query, { cartId });
  if (!data.cart) return null;
  return formatCartResponse(data.cart);
}

/**
 * Create a live Shopify Checkout URL for cart items
 */
export async function createShopifyCheckoutUrl(
  items: Array<{ merchandiseId: string; quantity: number }>,
  customerAccessToken?: string
): Promise<string> {
  const cart = await createShopifyCart(items, customerAccessToken);
  return cart.checkoutUrl;
}

// ==========================================
// SHOPIFY CUSTOMER ACCOUNT API
// ==========================================

/**
 * Authenticate customer with email and password via Storefront API
 */
export async function shopifyCustomerLogin(
  email: string,
  password: string
): Promise<{ accessToken: string; expiresAt: string }> {
  const mutation = `
    mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: Array<{ code: string; field: string[]; message: string }>;
    };
  }>(mutation, { input: { email, password } });

  const errors = data.customerAccessTokenCreate.customerUserErrors;
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(', '));
  }

  if (!data.customerAccessTokenCreate.customerAccessToken) {
    throw new Error('Unable to log in to Shopify Customer Account');
  }

  return data.customerAccessTokenCreate.customerAccessToken;
}

/**
 * Register a new customer in Shopify
 */
export async function shopifyCustomerRegister(params: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ id: string; email: string }> {
  const mutation = `
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const input: any = {
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
    email: params.email.trim(),
    password: params.password,
  };
  if (params.phone) {
    input.phone = params.phone.trim();
  }

  const data = await shopifyStorefrontQuery<{
    customerCreate: {
      customer: { id: string; email: string } | null;
      customerUserErrors: Array<{ code: string; field: string[]; message: string }>;
    };
  }>(mutation, { input });

  const errors = data.customerCreate.customerUserErrors;
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(', '));
  }

  if (!data.customerCreate.customer) {
    throw new Error('Failed to create customer account');
  }

  return data.customerCreate.customer;
}

/**
 * Fetch customer profile, addresses, and real order history from Shopify
 */
export async function fetchShopifyCustomerProfile(
  customerAccessToken: string
): Promise<ShopifyCustomerProfile | null> {
  const query = `
    query GetCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        displayName
        email
        phone
        defaultAddress {
          address1
          address2
          city
          province
          zip
          country
          phone
        }
        addresses(first: 10) {
          edges {
            node {
              id
              address1
              city
              province
              zip
            }
          }
        }
        orders(first: 25, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              name
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              statusUrl
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalTotalPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyStorefrontQuery<{
    customer: any | null;
  }>(query, { customerAccessToken });

  if (!data.customer) return null;

  const c = data.customer;
  const orders: ShopifyCustomerOrder[] = (c.orders?.edges || []).map((e: any) => ({
    id: e.node.id,
    name: e.node.name,
    orderNumber: e.node.orderNumber,
    processedAt: e.node.processedAt,
    financialStatus: e.node.financialStatus,
    fulfillmentStatus: e.node.fulfillmentStatus,
    statusUrl: e.node.statusUrl,
    totalPrice: e.node.totalPrice,
    lineItems: (e.node.lineItems?.edges || []).map((li: any) => ({
      title: li.node.title,
      quantity: li.node.quantity,
      originalTotalPrice: li.node.originalTotalPrice,
    })),
  }));

  return {
    id: c.id,
    firstName: c.firstName || '',
    lastName: c.lastName || '',
    displayName: c.displayName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer',
    email: c.email || '',
    phone: c.phone,
    defaultAddress: c.defaultAddress,
    addresses: (c.addresses?.edges || []).map((e: any) => e.node),
    orders,
  };
}

/**
 * Log out customer token in Shopify
 */
export async function shopifyCustomerLogout(customerAccessToken: string): Promise<boolean> {
  try {
    const mutation = `
      mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
        customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
          deletedAccessToken
          userErrors {
            field
            message
          }
        }
      }
    `;
    await shopifyStorefrontQuery(mutation, { customerAccessToken });
    return true;
  } catch {
    return false;
  }
}
