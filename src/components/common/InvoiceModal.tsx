import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types/store.js';
import { useStoreConfig } from '../../context/StoreConfigContext.js';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { config } = useStoreConfig();

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber.replace('APNA-', '')}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 print:border-none print:shadow-none print:w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Tax Invoice & Packing Slip</span>
            <span className="text-xs text-zinc-400">({order.orderNumber})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 space-y-6 text-zinc-800 bg-white" id="printable-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-orange-600 text-white flex items-center justify-center font-black text-sm">
                  A
                </div>
                <h1 className="text-2xl font-black text-zinc-950 font-display">
                  {config.storeName || 'APNA SHOES'}
                </h1>
              </div>
              <p className="text-xs text-zinc-500 mt-1 font-medium italic">
                {config.tagline || 'Har Kadam, Apna Style.'}
              </p>
              <p className="text-xs text-zinc-600 mt-2 max-w-xs leading-relaxed">
                {config.contactAddress || 'Plot 42, Sector 63, Noida, NCR Delhi 201301'}
                <br />
                GSTIN: <span className="font-semibold text-zinc-900">{config.gstNumber || '07AAACA1234F1Z8'}</span>
                <br />
                Email: {config.contactEmail || 'care@apnashoes.in'} | Phone: {config.contactPhone}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-extrabold text-orange-600 tracking-wider">
                ORIGINAL TAX INVOICE
              </span>
              <p className="text-sm font-black text-zinc-900 mt-1">Invoice: {invoiceNumber}</p>
              <p className="text-xs text-zinc-500">Order ID: {order.orderNumber}</p>
              <p className="text-xs text-zinc-500">Date: {invoiceDate}</p>
              {order.shipment?.awbCode && (
                <p className="text-xs font-semibold text-zinc-700 mt-1">
                  AWB: {order.shipment.awbCode} ({order.shipment.courierName})
                </p>
              )}
            </div>
          </div>

          {/* Customer & Billing Info */}
          <div className="grid grid-cols-2 gap-6 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <div>
              <p className="font-bold text-zinc-900 uppercase tracking-wide text-[11px] mb-1">
                Ship To / Delivery Address:
              </p>
              <p className="font-semibold text-zinc-900">{order.shippingAddress.name}</p>
              <p className="text-zinc-600">{order.shippingAddress.flatHouse}, {order.shippingAddress.streetLocality}</p>
              {order.shippingAddress.landmark && (
                <p className="text-zinc-500">Landmark: {order.shippingAddress.landmark}</p>
              )}
              <p className="text-zinc-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-zinc-700 mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="text-right sm:text-left">
              <p className="font-bold text-zinc-900 uppercase tracking-wide text-[11px] mb-1">
                Payment & Billing Details:
              </p>
              <p className="text-zinc-600">
                Method: <span className="font-semibold text-zinc-900 uppercase">{order.paymentMethod}</span>
              </p>
              <p className="text-zinc-600">
                Payment Status: <span className="font-semibold text-emerald-600 uppercase">{order.paymentStatus}</span>
              </p>
              {order.razorpayPaymentId && (
                <p className="text-zinc-500">Txn ID: {order.razorpayPaymentId}</p>
              )}
              <p className="text-zinc-500 mt-2 text-[11px]">
                Place of Supply: <span className="font-medium text-zinc-800">{order.shippingAddress.state}</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-zinc-900 font-bold uppercase text-[11px]">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5">HSN Code</th>
                <th className="py-2.5">Size/Color</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Rate</th>
                <th className="py-2.5 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-semibold text-zinc-900">
                    {item.productName}
                    <div className="text-[10px] text-zinc-400 font-normal">SKU: {item.sku}</div>
                  </td>
                  <td className="py-3 text-zinc-600">6404</td>
                  <td className="py-3 text-zinc-600">{item.size} / {item.color}</td>
                  <td className="py-3 text-center font-medium tabular-nums">{item.quantity}</td>
                  <td className="py-3 text-right tabular-nums">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right font-bold text-zinc-900 tabular-nums">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t-2 border-zinc-200 pt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="tabular-nums">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span className="tabular-nums">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Shipping Fee:</span>
                <span className="tabular-nums">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Integrated GST (18% incl):</span>
                <span className="tabular-nums">₹{order.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-zinc-900 pt-2 flex justify-between text-sm font-black text-zinc-950">
                <span>Total Amount:</span>
                <span className="tabular-nums">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Signatory */}
          <div className="pt-8 border-t border-zinc-200 grid grid-cols-2 gap-6 text-[11px] text-zinc-500">
            <div>
              <p className="font-bold text-zinc-700">7-DAY RETURN POLICY NOTICE:</p>
              <p className="mt-1 leading-relaxed">
                Eligible for free doorstep return / exchange within 7 calendar days of delivery date.
                Footwear must be in original unworn condition with tags and box intact.
              </p>
            </div>
            <div className="text-right flex flex-col justify-between items-end">
              <div>
                <p className="font-bold text-zinc-900">For APNA SHOES RETAIL INDIA</p>
                <div className="mt-4 font-mono text-[10px] text-zinc-400">
                  [DIGITALLY SIGNED & VERIFIED]
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">
                This is a computer-generated tax invoice. No physical signature required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
