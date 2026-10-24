import React, { useState, useEffect } from 'react';
import { Search, Truck, CheckCircle2, Clock, MapPin, Package, ArrowRight, RotateCcw, Copy, Check, ExternalLink, RefreshCw, Share2, Radio } from 'lucide-react';
import { api } from '../services/api.js';
import { subscribeToLiveOrder, syncOrderToFirestore } from '../services/firebaseSync.js';
import { Order, ShipmentEvent } from '../types/store.js';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderNumber, onNavigate }) => {
  const [query, setQuery] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awbCopied, setAwbCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [lastLiveUpdateAt, setLastLiveUpdateAt] = useState<string | null>(null);

  const fetchOrderTracking = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Try search by order ID or AWB
      const res = await api.getOrder(q.trim());
      setOrder(res);
      syncOrderToFirestore(res).catch(() => {});
    } catch (e: any) {
      // Try search across orders list
      try {
        const orders = await api.getOrders();
        const found = orders.find(
          o => o.orderNumber.toLowerCase() === q.trim().toLowerCase() ||
               (o.shipment?.awbCode && o.shipment.awbCode.toLowerCase() === q.trim().toLowerCase())
        );
        if (found) {
          setOrder(found);
          syncOrderToFirestore(found).catch(() => {});
        } else {
          setError('Order or AWB number not found. Please check your order details.');
        }
      } catch (err) {
        setError('Could not locate tracking information for this order.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!order) return;
    setRefreshing(true);
    try {
      const refreshed = await api.getOrder(order.id);
      setOrder(refreshed);
      syncOrderToFirestore(refreshed).catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrderTracking(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  // Real-time Firestore onSnapshot listener for live order updates
  useEffect(() => {
    if (!order?.id && !order?.orderNumber) return;

    // Listen to real-time changes by document ID
    const unsubDoc = subscribeToLiveOrder(order.id, (liveOrder) => {
      setOrder(liveOrder);
      setIsLiveStreamActive(true);
      setLastLiveUpdateAt(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    });

    // Also listen by order number
    const unsubNum = subscribeToLiveOrder(order.orderNumber, (liveOrder) => {
      setOrder(liveOrder);
      setIsLiveStreamActive(true);
      setLastLiveUpdateAt(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    });

    setIsLiveStreamActive(true);

    return () => {
      unsubDoc();
      unsubNum();
    };
  }, [order?.id, order?.orderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderTracking(query);
  };

  // Status mapping
  const statusSteps = [
    { key: 'order_placed', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status: Order['orderStatus']) => {
    if (status === 'order_placed') return 0;
    if (status === 'confirmed' || status === 'processing') return 1;
    if (status === 'packed') return 2;
    if (status === 'shipped') return 3;
    if (status === 'out_for_delivery') return 4;
    if (status === 'delivered') return 5;
    return 1;
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;
  const hasAwb = Boolean(order?.shipment?.awbCode);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Search Bar Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 mb-1">
          <Truck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
          Track Your Apna Shoes Shipment
        </h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Enter your unique Order Number (e.g. APNA-2026-7842) or Airway Bill (AWB) number for live courier dispatch updates.
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 pt-2">
          <input
            type="text"
            required
            placeholder="Order ID or Airway Bill (AWB) No"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-zinc-950 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      </div>

      {/* Tracking Result Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden divide-y divide-zinc-100">
          {/* Top Shipment Summary */}
          <div className="p-6 sm:p-8 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  {order.shipment?.courierName || 'Shiprocket Logistics'}
                </span>
                <span>·</span>
                <span className="text-xs font-semibold text-zinc-500">
                  Order Code: <strong className="text-zinc-900 font-mono">{order.orderNumber}</strong>
                </span>
                {isLiveStreamActive && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-3" />
                      <span>Live Firestore Stream</span>
                      {lastLiveUpdateAt && (
                        <span className="text-emerald-700/80 font-normal">({lastLiveUpdateAt})</span>
                      )}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-black text-zinc-950 mt-1 font-display flex items-center gap-2">
                <span>Shipment for {order.customerName}</span>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200/60 transition-colors"
                  title="Refresh order status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
                </button>
              </h2>
              <p className="text-xs text-zinc-500">
                Destination: <strong className="text-zinc-800">{order.shippingAddress.city}, {order.shippingAddress.state}</strong> ({order.shippingAddress.pincode})
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-zinc-500 block">Current Status</span>
              <span className={`text-sm font-extrabold uppercase px-2.5 py-1 rounded-md inline-block mt-0.5 ${
                order.orderStatus === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {order.orderStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* DEDICATED AIRWAY BILL (AWB) HIGHLIGHT CARD */}
          <div className={`p-6 sm:p-7 border-t border-b ${hasAwb ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'} space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${hasAwb ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {hasAwb ? 'Airway Bill (AWB) Confirmed by Admin' : 'Airway Bill (AWB) Status'}
                </span>
                {hasAwb ? (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xl sm:text-2xl font-black font-mono text-emerald-950 tracking-tight bg-white px-3 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                      {order.shipment?.awbCode}
                    </span>
                    <button
                      onClick={() => {
                        if (order.shipment?.awbCode) {
                          navigator.clipboard.writeText(order.shipment.awbCode);
                          setAwbCopied(true);
                          setTimeout(() => setAwbCopied(false), 2000);
                        }
                      }}
                      className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {awbCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{awbCopied ? 'Copied!' : 'Copy AWB'}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-900 mt-1 font-medium">
                    Awaiting Admin AWB Assignment (Dispatched within less than 24 hours)
                  </p>
                )}
              </div>

              {hasAwb && order.shipment?.trackingUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={order.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Track on Courier Site</span>
                  </a>
                </div>
              )}
            </div>

            {hasAwb && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 pt-1">
                <span>Courier: <strong className="text-zinc-900">{order.shipment?.courierName}</strong></span>
                {order.shipment?.estimatedDelivery && (
                  <span>
                    Est. Delivery:{' '}
                    <strong className="text-zinc-900">
                      {new Date(order.shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stepper Progress Bar */}
          <div className="p-6 sm:p-8">
            <div className="relative flex justify-between">
              {/* Connecting line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 -z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-orange-600 transition-all duration-500 -z-0"
                style={{
                  width: `${(currentStepIdx / (statusSteps.length - 1)) * 100}%`,
                }}
              />

              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center z-10 w-20">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] mt-2 font-medium leading-tight ${
                      isCurrent ? 'font-bold text-orange-600' : isPassed ? 'text-zinc-800' : 'text-zinc-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Return Notification If Delivered */}
          {order.orderStatus === 'delivered' && (
            <div className="p-4 sm:p-6 bg-emerald-50/60 border-t border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>7-Day Return Window Active:</strong> You can request a size exchange or return until{' '}
                  <strong>{order.returnDeadline ? new Date(order.returnDeadline).toLocaleDateString('en-IN') : '7 days from delivery'}</strong>.
                </span>
              </div>
              <button
                onClick={() => onNavigate('returns')}
                className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                Request Return / Exchange
              </button>
            </div>
          )}

          {/* Courier Milestones Timeline */}
          <div className="p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Shipment Activity Log
            </h3>

            {order.shipment?.events && order.shipment.events.length > 0 ? (
              <div className="space-y-4 border-l-2 border-zinc-200 ml-2 pl-4 text-xs">
                {order.shipment.events.map((ev, i) => (
                  <div key={ev.id || i} className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-orange-600 ring-4 ring-white" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-900">{ev.statusTitle || 'Milestone Reached'}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(ev.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-zinc-600">{ev.description}</p>
                    <p className="text-[11px] text-zinc-400 font-medium">{ev.location}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Awaiting carrier pickup scan from Apna Shoes Noida Warehouse. Updates will appear shortly.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
