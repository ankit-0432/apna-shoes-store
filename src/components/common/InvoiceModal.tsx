import React, { useState } from 'react';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types/store.js';
import { useStoreConfig } from '../../context/StoreConfigContext.js';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { config } = useStoreConfig();
  const [sizeMode, setSizeMode] = useState<'compact' | 'mini' | 'standard'>('compact');

  const invoiceNumber = `INV-${order.orderNumber.replace('APNA-', '')}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 16px;
      font-size: 10px;
      line-height: 1.3;
    }
    .invoice-card {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 20px 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #ea580c;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
    }
    .inv-tag {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      color: #ea580c;
      background: #ffedd5;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #fed7aa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .inv-meta {
      text-align: right;
    }
    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f1f5f9;
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 9.5px;
    }
    .grid-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8.5px;
      color: #475569;
      margin-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9.5px;
    }
    th {
      text-align: left;
      padding: 6px 4px;
      border-bottom: 1.5px solid #0f172a;
      font-size: 8.5px;
      text-transform: uppercase;
      font-weight: 800;
      color: #0f172a;
    }
    td {
      padding: 6px 4px;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals-box {
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-bottom: 12px;
    }
    .totals-table {
      width: 220px;
      font-size: 9.5px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      color: #475569;
    }
    .totals-final {
      display: flex;
      justify-content: space-between;
      border-top: 1.5px solid #0f172a;
      padding-top: 4px;
      margin-top: 4px;
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
    }
    .footer-note {
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #64748b;
    }
    @media print {
      body { background: #fff; padding: 0; font-size: 9px; }
      .invoice-card { border: none; box-shadow: none; max-width: 100%; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">${config.storeName || 'APNA SHOES'}</div>
        <div class="brand-sub">${config.tagline || 'Har Kadam, Apna Style.'}</div>
        <div style="font-size: 8.5px; color: #475569; margin-top: 4px; line-height: 1.3;">
          ${config.contactAddress || 'Plot 42, Sector 63, Noida, NCR Delhi 201301'}<br>
          GSTIN: <strong>${config.gstNumber || '07AAACA1234F1Z8'}</strong> · Care: ${config.contactEmail || 'care@apnashoes.in'}
        </div>
      </div>
      <div class="inv-meta">
        <span class="inv-tag">Tax Invoice</span>
        <div style="font-weight: 800; font-family: monospace; font-size: 10px; margin-top: 4px;">${invoiceNumber}</div>
        <div style="color: #64748b; font-size: 9px;">Order: ${order.orderNumber}</div>
        <div style="color: #64748b; font-size: 9px;">Date: ${invoiceDate}</div>
        ${order.shipment?.awbCode ? `<div style="font-family: monospace; font-size: 8.5px; font-weight: 700; margin-top: 2px;">AWB: ${order.shipment.awbCode}</div>` : ''}
      </div>
    </div>

    <div class="grid-info">
      <div>
        <div class="grid-title">Billed & Shipped To:</div>
        <div style="font-weight: 800; color: #0f172a;">${order.shippingAddress.name}</div>
        <div>${order.shippingAddress.flatHouse}, ${order.shippingAddress.streetLocality}</div>
        <div>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</div>
        <div>Phone: ${order.shippingAddress.phone}</div>
      </div>
      <div>
        <div class="grid-title">Payment & Dispatch:</div>
        <div>Mode: <strong style="text-transform: uppercase;">${order.paymentMethod}</strong></div>
        <div>Status: <strong style="color: #059669; text-transform: uppercase;">${order.paymentStatus}</strong></div>
        ${order.razorpayPaymentId ? `<div style="font-family: monospace; font-size: 8.5px; color: #64748b;">Txn ID: ${order.razorpayPaymentId}</div>` : ''}
        <div style="color: #64748b; font-size: 8.5px; margin-top: 3px;">Supply State: ${order.shippingAddress.state} (India)</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>HSN</th>
          <th>Size / Color</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || [])
          .map((item: any) => {
            const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
            const qty = Number(item.quantity ?? 1);
            const totalPrice = Number(item.totalPrice ?? (unitPrice * qty));
            const sku = item.sku || 'APNA-STD';
            return `<tr>
            <td style="font-weight: 700; color: #0f172a;">
              ${item.productName || 'Footwear Item'}
              <div style="font-size: 8px; font-weight: 400; color: #94a3b8; font-family: monospace;">SKU: ${sku}</div>
            </td>
            <td style="font-family: monospace; color: #64748b;">6404</td>
            <td style="color: #475569;">${item.size || 'STD'} / ${item.color || 'Default'}</td>
            <td style="text-align: center; font-weight: 700;">${qty}</td>
            <td style="text-align: right;">₹${unitPrice.toLocaleString('en-IN')}</td>
            <td style="text-align: right; font-weight: 800; color: #0f172a;">₹${totalPrice.toLocaleString('en-IN')}</td>
          </tr>`;
          })
          .join('')}
      </tbody>
    </table>

    <div class="totals-box">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>₹${Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
        </div>
        ${
          Number(order.discountAmount || 0) > 0
            ? `<div class="totals-row" style="color: #059669; font-weight: 700;">
            <span>Discount (${order.couponCode || 'Promo'}):</span>
            <span>-₹${Number(order.discountAmount).toLocaleString('en-IN')}</span>
          </div>`
            : ''
        }
        <div class="totals-row">
          <span>Shipping:</span>
          <span>${Number(order.shippingFee || 0) === 0 ? 'FREE' : `₹${Number(order.shippingFee).toLocaleString('en-IN')}`}</span>
        </div>
        <div class="totals-row" style="font-size: 8.5px; color: #94a3b8;">
          <span>Integrated GST (18% incl):</span>
          <span>₹${Number(order.taxAmount || 0).toLocaleString('en-IN')}</span>
        </div>
        <div class="totals-final">
          <span>Total Payable:</span>
          <span>₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <div>
        <strong>7-Day Doorstep Return Policy:</strong> Return unworn with original box within 7 calendar days.
      </div>
      <div style="text-align: right;">
        <strong>APNA SHOES RETAIL INDIA</strong><br>
        Digitally signed tax invoice.
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ApnaShoes-Invoice-${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Print stylesheet to guarantee clean single-page compact A4 fit without overflow */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 9px !important;
            line-height: 1.25 !important;
          }
          header, footer, nav, button, .print\\:hidden {
            display: none !important;
          }
          #printable-invoice {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 9px !important;
            line-height: 1.25 !important;
          }
          #printable-invoice * {
            box-sizing: border-box !important;
          }
          table {
            page-break-inside: avoid !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 print:border-none print:shadow-none print:max-w-none print:w-full transition-all duration-200 ${
          sizeMode === 'mini'
            ? 'w-full max-w-md'
            : sizeMode === 'compact'
            ? 'w-full max-w-xl'
            : 'w-full max-w-2xl'
        }`}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-zinc-950 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 print:hidden border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold tracking-tight">Tax Invoice & Packing Slip</span>
            <span className="text-[11px] text-zinc-400 font-mono">({order.orderNumber})</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Size / Scale Preset Selector */}
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
              <button
                onClick={() => setSizeMode('compact')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sizeMode === 'compact' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Fit standard single A4 page"
              >
                Compact A4
              </button>
              <button
                onClick={() => setSizeMode('mini')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sizeMode === 'mini' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Slim slip format"
              >
                Mini Slip
              </button>
              <button
                onClick={() => setSizeMode('standard')}
                className={`px-2 py-1 rounded font-semibold transition-colors ${
                  sizeMode === 'standard' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Standard view"
              >
                Standard
              </button>
            </div>

            {/* Direct Download HTML File */}
            <button
              onClick={handleDownloadInvoice}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Download standalone invoice HTML slip"
            >
              <Download className="w-3 h-3 text-orange-400" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors ml-0.5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet (Compact single-page fit) */}
        <div
          id="printable-invoice"
          className={`text-zinc-800 bg-white transition-all ${
            sizeMode === 'mini'
              ? 'p-4 space-y-2.5 text-[9.5px]'
              : sizeMode === 'compact'
              ? 'p-5 sm:p-6 space-y-3 text-[10px]'
              : 'p-6 sm:p-8 space-y-4 text-xs'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                  A
                </div>
                <h1 className="text-lg font-black text-zinc-950 font-display tracking-tight">
                  {config.storeName || 'APNA SHOES'}
                </h1>
              </div>
              <p className="text-[9.5px] text-zinc-500 font-medium italic mt-0.5">
                {config.tagline || 'Har Kadam, Apna Style.'}
              </p>
              <p className="text-[9px] text-zinc-600 mt-0.5 max-w-sm leading-tight">
                {config.contactAddress || 'Plot 42, Sector 63, Noida, NCR Delhi 201301'}
                <br />
                GSTIN: <span className="font-semibold text-zinc-900">{config.gstNumber || '07AAACA1234F1Z8'}</span> · Care: {config.contactEmail || 'care@apnashoes.in'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-black text-orange-600 tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                TAX INVOICE
              </span>
              <p className="text-xs font-black text-zinc-950 mt-1 font-mono">{invoiceNumber}</p>
              <p className="text-[9.5px] text-zinc-500">Order: {order.orderNumber}</p>
              <p className="text-[9.5px] text-zinc-500">Date: {invoiceDate}</p>
              {order.shipment?.awbCode && (
                <p className="text-[9.5px] font-semibold text-zinc-800 mt-0.5 font-mono">
                  AWB: {order.shipment.awbCode}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Billing Info (Compact Two-Column Box) */}
          <div className="grid grid-cols-2 gap-3 text-[9.5px] bg-zinc-50/90 p-2.5 rounded-lg border border-zinc-200">
            <div>
              <p className="font-bold text-zinc-900 uppercase tracking-wider text-[8.5px] mb-0.5">
                Billed & Shipped To:
              </p>
              <p className="font-bold text-zinc-950">{order.shippingAddress.name}</p>
              <p className="text-zinc-600 leading-tight">
                {order.shippingAddress.flatHouse}, {order.shippingAddress.streetLocality}
              </p>
              {order.shippingAddress.landmark && (
                <p className="text-zinc-500">Landmark: {order.shippingAddress.landmark}</p>
              )}
              <p className="text-zinc-700 font-medium">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-zinc-700 mt-0.5">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="text-right sm:text-left">
              <p className="font-bold text-zinc-900 uppercase tracking-wider text-[8.5px] mb-0.5">
                Payment Details:
              </p>
              <p className="text-zinc-700">
                Mode: <span className="font-bold text-zinc-950 uppercase">{order.paymentMethod}</span>
              </p>
              <p className="text-zinc-700">
                Status: <span className="font-bold text-emerald-700 uppercase">{order.paymentStatus}</span>
              </p>
              {order.razorpayPaymentId && (
                <p className="text-zinc-500 font-mono text-[8.5px]">Txn: {order.razorpayPaymentId}</p>
              )}
              <p className="text-zinc-500 mt-0.5 text-[8.5px]">
                Place of Supply: <span className="font-medium text-zinc-900">{order.shippingAddress.state} (India)</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left text-[9.5px] border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-zinc-900 font-bold uppercase text-[8.5px]">
                <th className="py-1 px-1">Description</th>
                <th className="py-1 px-1">HSN</th>
                <th className="py-1 px-1">Size/Color</th>
                <th className="py-1 px-1 text-center">Qty</th>
                <th className="py-1 px-1 text-right">Rate</th>
                <th className="py-1 px-1 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {(order.items || []).map((item: any, idx) => {
                const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                const qty = Number(item.quantity ?? 1);
                const totalPrice = Number(item.totalPrice ?? (unitPrice * qty));
                const sku = item.sku || 'APNA-STD';
                return (
                  <tr key={item.id || idx}>
                    <td className="py-1.5 px-1 font-semibold text-zinc-950">
                      {item.productName || 'Footwear'}
                      <div className="text-[8.5px] text-zinc-400 font-normal font-mono">SKU: {sku}</div>
                    </td>
                    <td className="py-1.5 px-1 text-zinc-600 font-mono">6404</td>
                    <td className="py-1.5 px-1 text-zinc-600 font-medium">{item.size || 'STD'} / {item.color || 'Default'}</td>
                    <td className="py-1.5 px-1 text-center font-bold tabular-nums">{qty}</td>
                    <td className="py-1.5 px-1 text-right tabular-nums">₹{unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-1.5 px-1 text-right font-bold text-zinc-950 tabular-nums">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Box */}
          <div className="border-t border-zinc-300 pt-1.5 flex justify-end">
            <div className="w-48 sm:w-56 space-y-0.5 text-[9.5px]">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="tabular-nums">₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span className="tabular-nums">-₹{Number(order.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Shipping:</span>
                <span className="tabular-nums">{Number(order.shippingFee || 0) === 0 ? 'FREE' : `₹${Number(order.shippingFee).toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[8.5px]">
                <span>Integrated GST (18% incl):</span>
                <span className="tabular-nums">₹{Number(order.taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-zinc-900 pt-1 flex justify-between text-xs font-black text-zinc-950">
                <span>Total Amount:</span>
                <span className="tabular-nums">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Notice & Signatory */}
          <div className="pt-2 border-t border-zinc-200 grid grid-cols-2 gap-3 text-[8.5px] text-zinc-500">
            <div>
              <p className="font-bold text-zinc-800">7-DAY RETURN POLICY NOTICE:</p>
              <p className="leading-tight mt-0.5 text-zinc-600">
                Free doorstep reverse pickup available within 7 calendar days of delivery.
                Shoes must be unworn with original tags and box intact.
              </p>
            </div>
            <div className="text-right flex flex-col justify-between items-end">
              <div>
                <p className="font-bold text-zinc-900">For APNA SHOES RETAIL INDIA</p>
                <div className="mt-0.5 font-mono text-[8px] text-zinc-400">
                  [DIGITALLY SIGNED & VERIFIED]
                </div>
              </div>
              <p className="text-[7.5px] text-zinc-400 mt-0.5">
                Computer-generated tax invoice. No physical signature required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
