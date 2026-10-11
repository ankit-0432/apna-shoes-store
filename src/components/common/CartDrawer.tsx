import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useStoreConfig } from '../../context/StoreConfigContext.js';
import { SneakerGraphic } from './SneakerGraphic.js';

interface CartDrawerProps {
  onCheckout: () => void;
  onNavigate: (view: string, param?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onNavigate }) => {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { config } = useStoreConfig();
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isDrawerOpen) return null;

  const freeThreshold = config.freeShippingThreshold || 999;
  const amountToFreeShipping = Math.max(0, freeThreshold - (subtotal - discountAmount));
  const progressPercent = Math.min(100, Math.round(((subtotal - discountAmount) / freeThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim());
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 font-display">Shopping Bag</h2>
              <span className="text-xs text-zinc-500 font-medium">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-zinc-50 p-4 border-b border-zinc-200 text-xs">
            {amountToFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-medium text-zinc-700">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-orange-600" />
                    Add <span className="font-bold text-zinc-900">₹{amountToFreeShipping}</span> more for FREE Express Shipping
                  </span>
                  <span className="text-zinc-500 font-bold tabular-nums">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>You unlocked FREE Express Delivery across India! ⚡</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-zinc-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <Truck className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-zinc-800">Your bag is empty</p>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Discover fresh drops and bestsellers from India’s favorite footwear collection.
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('all');
                  }}
                  className="mt-2 px-5 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Explore Footwear
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Sneaker Thumbnail */}
                  <div className="w-20 h-20 bg-zinc-100 rounded-lg p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    <SneakerGraphic
                      type={item.graphicType}
                      accentColor={item.colorHex || '#FF5A1F'}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">{item.productName}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-400 hover:text-red-500 p-0.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1 text-[11px] text-zinc-500 flex items-center gap-2">
                        <span className="font-semibold text-zinc-800">Size: {item.size}</span>
                        <span>·</span>
                        <span className="truncate">{item.color}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-zinc-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.stockAvailable}
                          className="p-1 hover:bg-zinc-100 text-zinc-600 transition-colors disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-zinc-900 tabular-nums">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Module */}
          {items.length > 0 && (
            <div className="border-t border-zinc-200 p-4 sm:p-5 bg-white space-y-4">
              {/* Coupon Section */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span>applied (Saved ₹{discountAmount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-emerald-700 hover:text-red-600 font-semibold underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount coupon (e.g. APNA10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="px-3.5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900 tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span className="tabular-nums">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-medium text-zinc-900 tabular-nums">
                    {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex justify-between text-sm font-extrabold text-zinc-950">
                  <span>Total Payable</span>
                  <span className="tabular-nums">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-zinc-400">Inclusive of all Indian taxes (18% GST)</p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95 active:scale-98"
                style={{ backgroundColor: config.brandPrimaryColor || '#FF5A1F' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-zinc-400 flex items-center justify-center gap-2">
                <span>🔒 256-Bit Razorpay & COD Security</span>
                <span>·</span>
                <span>7-Day Return Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
