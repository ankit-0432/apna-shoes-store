import React, { useState } from 'react';
import { CheckCircle2, Truck, FileText, ArrowRight, RotateCcw, MessageSquare, MapPin } from 'lucide-react';
import { Order } from '../types/store.js';
import { InvoiceModal } from '../components/common/InvoiceModal.js';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, onNavigate }) => {
  const [showInvoice, setShowInvoice] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Hero Header */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded">
            ORDER CONFIRMED & VERIFIED
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-zinc-950 font-display">
            Thank You, {order.customerName}!
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Order <span className="font-bold text-zinc-900 font-mono">{order.orderNumber}</span> has been received and allocated to our warehouse fulfillment team.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('track-order', order.orderNumber)}
            className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow flex items-center gap-2 transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order (Shiprocket AWB)</span>
          </button>

          <button
            onClick={() => setShowInvoice(true)}
            className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>View GST Tax Invoice</span>
          </button>
        </div>

        {/* WhatsApp notification badge */}
        <div className="pt-4 max-w-md mx-auto text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200 flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Confirmation & tracking updates dispatched to <strong>{order.customerPhone}</strong>
          </span>
        </div>
      </div>

      {/* Order Summary & Delivery Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Delivery Destination</span>
          </div>

          <div className="text-xs text-zinc-700 space-y-1">
            <p className="font-bold text-zinc-900 text-sm">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.flatHouse}, {order.shippingAddress.streetLocality}</p>
            {order.shippingAddress.landmark && <p className="text-zinc-500">Landmark: {order.shippingAddress.landmark}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="font-medium text-zinc-900 mt-2">Mobile: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment & 7-Day Guarantee Details */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            <RotateCcw className="w-4 h-4 text-orange-600" />
            <span>Payment & 7-Day Return Policy</span>
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
            <div className="flex justify-between">
              <span>Total Paid / Payable:</span>
              <span className="font-black text-sm text-zinc-950 tabular-nums">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
              🛡️ Your 7-day return/size-exchange window begins on the confirmed delivery date.
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Line Items */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
          Purchased Items ({order.items.length})
        </h3>

        <div className="divide-y divide-zinc-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-zinc-900">{item.productName}</h4>
                <p className="text-[11px] text-zinc-500">
                  Size: <span className="font-semibold text-zinc-800">{item.size}</span> · Color: {item.color} · Qty: {item.quantity}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">SKU: {item.sku}</p>
              </div>

              <span className="font-bold text-zinc-900 tabular-nums">
                ₹{item.totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
    </div>
  );
};
