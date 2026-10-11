import React, { useState, useEffect } from 'react';
import { Package, Truck, FileText, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Order } from '../types/store.js';
import { InvoiceModal } from '../components/common/InvoiceModal.js';

interface OrdersPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (user?.email) {
        const data = await api.getUserOrders(user.email);
        setOrders(data);
      } else {
        const all = await api.getOrders();
        setOrders(all.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
          My Footwear Orders
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Review previous orders, track shipments, download tax invoices, and initiate 7-day returns.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900">No Orders Placed Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You haven’t placed any orders yet. Discover our fresh collection of sneakers and running kicks.
          </p>
          <button
            onClick={() => onNavigate('all')}
            className="mt-2 px-5 py-2.5 bg-zinc-950 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Shop Now
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
                  <div className="text-zinc-500">
                    <span>Delivering to: <strong>{order.shippingAddress.name}</strong> ({order.shippingAddress.city}, {order.shippingAddress.pincode})</span>
                    {order.shipment?.awbCode && (
                      <span className="block text-[11px] text-zinc-400 font-mono mt-0.5">
                        Shiprocket AWB: {order.shipment.awbCode}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onNavigate('track-order', order.orderNumber)}
                      className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Tax Invoice</span>
                    </button>

                    {canReturn && (
                      <button
                        onClick={() => onNavigate('returns')}
                        className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Return</span>
                      </button>
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
