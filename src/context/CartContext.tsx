import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types/store.js';
import { useStoreConfig } from './StoreConfigContext.js';
import { api } from '../services/api.js';
import { createShopifyCart } from '../services/shopify.js';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  totalItemsCount: number;
  toastMessage: string | null;
  isCheckingOut: boolean;
  shopifyCheckoutUrl: string | null;
  proceedToShopifyCheckout: (customerAccessToken?: string) => Promise<string | null>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  shippingFee: 0,
  totalAmount: 0,
  appliedCoupon: null,
  couponError: null,
  applyCoupon: async () => false,
  removeCoupon: () => {},
  totalItemsCount: 0,
  toastMessage: null,
  isCheckingOut: false,
  shopifyCheckoutUrl: null,
  proceedToShopifyCheckout: async () => null,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useStoreConfig();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('apna_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((i: any) => i && i.id !== 'ci-init-1');
        }
      }
    } catch (e) {}
    return [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shopifyCheckoutUrl, setShopifyCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('apna_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  /**
   * Generates a live Shopify Cart with all items and redirects customer to Shopify secure checkout
   */
  const proceedToShopifyCheckout = async (customerAccessToken?: string): Promise<string | null> => {
    if (items.length === 0) {
      showToast('Your shopping bag is empty!');
      return null;
    }

    setIsCheckingOut(true);
    try {
      // Map line items to Shopify variants
      const lines = items.map((i) => {
        const isShopifyGid =
          typeof i.variantId === 'string' &&
          i.variantId.startsWith('gid://shopify/ProductVariant/');

        // If it already has a Shopify Variant GID, use it. Otherwise use the primary Shopify active variant.
        const merchandiseId = isShopifyGid
          ? i.variantId
          : 'gid://shopify/ProductVariant/44133447958591';

        return {
          merchandiseId,
          quantity: Math.max(1, i.quantity),
        };
      });

      const token =
        customerAccessToken ||
        localStorage.getItem('shopify_customer_token') ||
        undefined;

      const cart = await createShopifyCart(lines, token);
      setShopifyCheckoutUrl(cart.checkoutUrl);

      // Redirect immediately to Shopify's secure checkout
      window.location.href = cart.checkoutUrl;
      return cart.checkoutUrl;
    } catch (err: any) {
      console.error('[Shopify Checkout Redirection Error]:', err);
      showToast(err.message || 'Unable to open Shopify checkout. Please try again.');
      return null;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    // Find matching variant
    const variant = product.variants.find(
      v => v.size === size && (v.colorName === color || !color)
    ) || product.variants[0];

    const stock = variant ? variant.stockQuantity : 10;
    const cartItemId = `${product.id}-${size}-${color}`;

    setItems(prev => {
      const existing = prev.find(i => i.id === cartItemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, stock);
        return prev.map(i => (i.id === cartItemId ? { ...i, quantity: newQty } : i));
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          brand: product.brand,
          variantId: variant ? variant.id : 'v-default',
          size,
          color: variant ? variant.colorName : color,
          colorHex: variant ? variant.colorHex : '#FF5A1F',
          price: product.sellingPrice,
          originalPrice: product.originalPrice,
          quantity: Math.min(quantity, stock),
          graphicType: product.graphicType,
          stockAvailable: stock,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added ${product.name} (${size}) to cart!`);
    setIsDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => {
          if (i.id === cartItemId) {
            const nextQty = i.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...i, quantity: Math.min(nextQty, i.stockAvailable) };
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(res.discountAmount || 0);
        showToast(`Coupon ${code.toUpperCase()} applied! Saved ₹${res.discountAmount}`);
        return true;
      } else {
        setCouponError(res.message || 'Invalid coupon code');
        return false;
      }
    } catch (e: any) {
      setCouponError(e.message || 'Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  // Re-calculate coupon discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.minOrderValue) {
        removeCoupon();
        setCouponError(`Coupon removed: minimum order value of ₹${appliedCoupon.minOrderValue} required`);
      } else {
        let disc = 0;
        if (appliedCoupon.discountType === 'percentage') {
          disc = (subtotal * appliedCoupon.discountValue) / 100;
          if (appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount) disc = appliedCoupon.maxDiscount;
        } else {
          disc = appliedCoupon.discountValue;
        }
        setCouponDiscount(Math.round(disc * 100) / 100);
      }
    }
  }, [subtotal, appliedCoupon]);

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  // GST 18% inclusive
  const taxAmount = Math.round((discountedSubtotal * 0.18 / 1.18) * 100) / 100;
  const freeThreshold = config.freeShippingThreshold || 999;
  const shippingFee = items.length === 0 ? 0 : discountedSubtotal >= freeThreshold ? 0 : (config.defaultShippingFee || 99);
  const totalAmount = items.length === 0 ? 0 : Math.round((discountedSubtotal + shippingFee) * 100) / 100;
  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        subtotal,
        discountAmount: couponDiscount,
        taxAmount,
        shippingFee,
        totalAmount,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        totalItemsCount,
        toastMessage,
        isCheckingOut,
        shopifyCheckoutUrl,
        proceedToShopifyCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
