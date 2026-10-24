import React, { useState, useEffect } from 'react';
import { Package, Truck, FileText, RotateCcw, AlertCircle, Clock, Copy, Check, ExternalLink, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Order } from '../types/store.js';
import { InvoiceModal } from '../components/common/InvoiceModal.js';

interface OrdersPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { user, openLoginModal, shopifyCustomer, logoutFromShopify } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = user.phone || user.email;
      const data = await api.getUserOrders(query);
      setOrders(data);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const shopifyOrders = shopifyCustomer?.orders || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            My Footwear Orders & Account
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review previous orders, track shipments, inspect Shopify profile addresses, and initiate 7-day returns.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <div className="bg-orange-50 border border-orange-200 text-orange-950 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{shopifyCustomer ? `Shopify: ${shopifyCustomer.displayName}` : `Account: ${user.phone || user.name}`}</span>
            </div>
            {shopifyCustomer && (
              <button
                onClick={() => logoutFromShopify()}
                className="text-xs text-zinc-500 hover:text-red-600 underline font-medium px-2 py-1"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shopify Customer Profile & Saved Addresses Card */}
      {shopifyCustomer && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-zinc-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-orange-600 text-white">
                  Shopify Customer Account
                </span>
                <span className="text-xs text-zinc-400 font-mono">ID: {shopifyCustomer.id.split('/').pop()}</span>
              </div>
              <h2 className="text-lg font-black mt-1 font-display">{shopifyCustomer.displayName}</h2>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-400 mt-1">
                <span>📧 {shopifyCustomer.email}</span>
                {shopifyCustomer.phone && <span>📱 {shopifyCustomer.phone}</span>}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Saved Delivery Addresses ({shopifyCustomer.addresses?.length || (shopifyCustomer.defaultAddress ? 1 : 0)})
            </h3>
            {shopifyCustomer.defaultAddress ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-800/80 p-3.5 rounded-xl border border-zinc-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-400 text-[11px] uppercase">Default Shipping Address</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="font-semibold text-zinc-100">{shopifyCustomer.defaultAddress.address1}</p>
                  {shopifyCustomer.defaultAddress.address2 && <p className="text-zinc-300">{shopifyCustomer.defaultAddress.address2}</p>}
                  <p className="text-zinc-400">
                    {shopifyCustomer.defaultAddress.city}, {shopifyCustomer.defaultAddress.province} {shopifyCustomer.defaultAddress.zip}
                  </p>
                  <p className="text-zinc-400">{shopifyCustomer.defaultAddress.country}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No saved address yet. Your address will be saved upon checkout.</p>
            )}
          </div>
        </div>
      )}

      {/* Official Shopify Orders Section */}
      {shopifyCustomer && shopifyOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-zinc-950 font-display">
              Shopify Storefront Orders ({shopifyOrders.length})
            </h2>
            <span className="text-xs text-zinc-500">Synced in real-time from Shopify</span>
          </div>

          <div className="space-y-4">
            {shopifyOrders.map((sOrder) => (
              <div
                key={sOrder.id}
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 text-xs">
                  <div>
                    <span className="font-mono font-bold text-zinc-900 text-sm">{sOrder.name}</span>
                    <span className="text-zinc-400 ml-2">
                      · {new Date(sOrder.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-zinc-100 text-zinc-800">
                      Payment: {sOrder.financialStatus}
                    </span>
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-orange-100 text-orange-800">
                      Fulfillment: {sOrder.fulfillmentStatus}
                    </span>
                    <span className="text-xs font-black text-zinc-950 tabular-nums">
                      {sOrder.totalPrice.currencyCode} {parseFloat(sOrder.totalPrice.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-zinc-100">
                  {sOrder.lineItems.map((li, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-zinc-900">{li.title}</h4>
                        <p className="text-[11px] text-zinc-500">Qty: {li.quantity}</p>
                      </div>
                      <span className="font-semibold text-zinc-900 tabular-nums">
                        {li.originalTotalPrice.currencyCode} {parseFloat(li.originalTotalPrice.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end">
                  {sOrder.statusUrl && (
                    <a
                      href={sOrder.statusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Official Order & Tracking</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!user ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-orange-50 border border-orange-200 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-950 font-display">Sign In Required to View Orders</h3>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              To protect customer privacy and security, order history and saved delivery addresses are only visible after logging in to your verified account.
            </p>
          </div>
          <button
            onClick={() => openLoginModal('my-orders', 'Sign in to access your order history and live delivery tracking')}
            className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            <span>Sign In to Your Account</span>
          </button>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading your verified orders...</div>
      ) : orders.length === 0 && shopifyOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900">No Orders Placed Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Logged in as <strong>{shopifyCustomer?.email || user.phone || user.name}</strong>. No orders have been placed on this account yet.
          </p>
          <button
            onClick={() => onNavigate('all')}
            className="mt-2 px-5 py-2.5 bg-zinc-950 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Explore Footwear Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isDelivered = order.orderStatus === 'delivered';
            const canReturn = isDelivered && order.returnDeadline && new Date() <= new Date(order.returnDeadline);

            return (
              <div
                key={order.id}
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4 overflow-hidden"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 text-xs">
                  <div>
                    <span className="font-mono font-bold text-zinc-900 text-sm">{order.orderNumber}</span>
                    <span className="text-zinc-400 ml-2">
                      · Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${
                      isDelivered ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-black text-zinc-950 tabular-nums">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-zinc-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-zinc-900">{item.productName}</h4>
                        <p className="text-[11px] text-zinc-500">
                          Size: <strong>{item.size}</strong> · Color: {item.color} · Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-zinc-900 tabular-nums">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Return Details */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="text-zinc-500 space-y-1">
                    <div>
                      Delivering to: <strong>{order.shippingAddress.name}</strong> ({order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode})
                    </div>
                    {order.shipment?.awbCode ? (
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-[11px] font-bold">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AWB: {order.shipment.awbCode}</span>
                        </span>
                        <button
                          onClick={() => {
                            if (order.shipment?.awbCode) {
                              navigator.clipboard.writeText(order.shipment.awbCode);
                              setCopiedAwb(order.shipment.awbCode);
                              setTimeout(() => setCopiedAwb(null), 2000);
                            }
                          }}
                          className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10.5px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy AWB Number"
                        >
                          {copiedAwb === order.shipment.awbCode ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-500" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <span className="text-[11px] text-zinc-400">
                          via {order.shipment.courierName}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10.5px] font-semibold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>AWB: Awaiting Warehouse Dispatch (Within 24 Hours)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onNavigate('track-order', order.orderNumber)}
                      className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{order.shipment?.awbCode ? 'Track AWB' : 'Track Order'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Tax Invoice</span>
                    </button>

                    {canReturn ? (
                      <button
                        onClick={() => onNavigate('returns', order.orderNumber)}
                        className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request 7-Day Return</span>
                      </button>
                    ) : isDelivered ? (
                      <span className="px-2 py-1 text-zinc-400 text-[10.5px]">
                        Return period ended
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-zinc-100 text-zinc-500 rounded-lg text-[10.5px]" title="Return unlocks only after delivery">
                        Return unlocks after delivery
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
};
