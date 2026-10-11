import React, { useState } from 'react';
import { CheckCircle2, Truck, FileText, ArrowRight, RotateCcw, MessageSquare, MapPin, Copy, Check, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '../types/store.js';
import { InvoiceModal } from '../components/common/InvoiceModal.js';
import { SneakerGraphic } from '../components/common/SneakerGraphic.js';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, onNavigate }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const hasAWB = Boolean(order.shipment?.awbCode);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* 1. MANDATORY UPPERCASE CONFIRMATION BANNER */}
      <div className="bg-zinc-950 text-white border-2 border-orange-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Store Order Completed · APNA SHOES</span>
          </div>

          {/* EXACT REQUESTED UPPERCASE TEXT */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wide font-display uppercase leading-tight text-balance">
            YOUR ORDER IS CONFIRMED IN LESS THAN 24 HOURS THANK YOU
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto font-medium">
            Namaste <strong className="text-white">{order.customerName}</strong>! Your purchase from{' '}
            <strong className="text-orange-400">APNA SHOES</strong> is successfully booked and synchronized with our centralized warehouse.
          </p>
        </div>
      </div>

      {/* 2. UNIQUE ORDER CODE & AWB TRACKING CARD */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Unique Order Code (Saved in Admin Panel)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-zinc-950 tracking-tight">
                {order.orderNumber}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors flex items-center gap-1 text-[11px] font-bold"
                title="Copy unique code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('track-order', order.orderNumber)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Status</span>
            </button>

            <button
              onClick={() => setShowInvoice(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download Invoice</span>
            </button>
          </div>
        </div>

        {/* AWB NUMBER STATUS DISPLAY */}
        <div className={`p-5 rounded-2xl border ${hasAWB ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'} space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              {hasAWB ? (
                <>
                  <PackageCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-emerald-900">AWB Tracking Number Confirmed by Admin</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span className="text-amber-900">AWB Number: Awaiting Admin Confirmation (Within 24 Hours)</span>
                </>
              )}
            </span>

            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${hasAWB ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
              {hasAWB ? 'DISPATCHED' : 'IN REVIEW'}
            </span>
          </div>

          {hasAWB ? (
            <div className="pt-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="text-xs text-zinc-600">Airway Bill (AWB) Code:</span>
                <span className="font-mono text-base font-black text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  {order.shipment?.awbCode}
                </span>
                <span className="text-xs text-zinc-500">
                  via {order.shipment?.courierName || 'Shiprocket Delhivery Express'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Your package is manifested and ready for pickup from our central logistics hub.
              </p>
            </div>
          ) : (
            <p className="text-xs text-amber-900 leading-relaxed">
              Your unique order <strong className="font-mono font-bold">{order.orderNumber}</strong> has been logged in our system. Once our warehouse administrator confirms and verifies your shoe inventory, your official <strong>AWB NO. (Airway Bill Number)</strong> will be generated and displayed right here within <strong>less than 24 hours</strong>. You will also receive an SMS and WhatsApp notification on <strong>{order.customerPhone}</strong>.
            </p>
          )}
        </div>
      </div>

      {/* 3. SHOW WHAT ORDER YOU HAVE DONE IN APNA SHOES */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-base font-black text-zinc-950 font-display">
              What You Have Ordered in APNA SHOES
            </h2>
            <p className="text-xs text-zinc-500">
              Total {order.items.reduce((acc, it) => acc + it.quantity, 0)} Pairs · Verified Authentic Footwear
            </p>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
            APNA SHOES Official
          </span>
        </div>

        {/* Item Cards */}
        <div className="divide-y divide-zinc-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Shoe Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 p-1">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <SneakerGraphic
                      type={item.graphicType || 'air-glide'}
                      accentColor="#FF5A1F"
                      className="w-full h-full"
                    />
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                    APNA SHOES ORIGINAL
                  </span>
                  <h3 className="font-bold text-sm text-zinc-950">{item.productName}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 mt-0.5">
                    <span className="font-medium bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                      Size: {item.size}
                    </span>
                    <span>·</span>
                    <span>Color: {item.color}</span>
                    <span>·</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">SKU: {item.sku}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-zinc-400 block">Item Total</span>
                <span className="text-base font-black text-zinc-950 tabular-nums">
                  ₹{item.totalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  (₹{item.unitPrice.toLocaleString('en-IN')} / pair)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-zinc-200 pt-4 flex justify-end">
          <div className="w-full sm:w-72 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="tabular-nums font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount ({order.couponCode || 'Promo'}):</span>
                <span className="tabular-nums">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Charges:</span>
              <span className="tabular-nums font-semibold">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>GST (18% inclusive):</span>
              <span className="tabular-nums">₹{order.taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-zinc-900 pt-2 flex justify-between text-sm font-black text-zinc-950">
              <span>Total Paid / Payable:</span>
              <span className="tabular-nums text-base text-orange-600">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DELIVERY DESTINATION & POLICY SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Shipping Address</span>
          </div>
          <div className="text-xs text-zinc-700 space-y-1">
            <p className="font-bold text-zinc-950 text-sm">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.flatHouse}, {order.shippingAddress.streetLocality}</p>
            {order.shippingAddress.landmark && <p className="text-zinc-500">Landmark: {order.shippingAddress.landmark}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="font-semibold text-zinc-950 pt-1">Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            <RotateCcw className="w-4 h-4 text-orange-600" />
            <span>APNA SHOES 7-Day Guarantee</span>
          </div>
          <div className="text-xs text-zinc-700 space-y-2">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase text-zinc-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className={`font-bold uppercase ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 pt-1 leading-relaxed border-t border-zinc-100">
              🛡️ Need a size swap? Once delivered, you have 7 calendar days to request a free doorstep reverse pickup directly from your order dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </div>
  );
};
