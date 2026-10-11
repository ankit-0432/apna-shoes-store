import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertCircle, CheckCircle2, Truck, Clock, ShieldCheck, Upload } from 'lucide-react';
import { api } from '../services/api.js';
import { ReturnRequest, Order } from '../types/store.js';

interface ReturnsPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const ReturnsPage: React.FC<ReturnsPageProps> = ({ onNavigate }) => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [reason, setReason] = useState<ReturnRequest['reason']>('wrong_size');
  const [details, setDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allReturns, allOrders] = await Promise.all([
        api.getReturns(),
        api.getOrders(),
      ]);
      setReturns(allReturns);
      const deliveredOnes = allOrders.filter(o => o.orderStatus === 'delivered');
      setOrders(deliveredOnes);
      if (deliveredOnes.length > 0 && !selectedOrderId) {
        setSelectedOrderId(deliveredOnes[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      setMessage({ type: 'error', text: 'Please select an eligible delivered order.' });
      return;
    }
    if (!details.trim()) {
      setMessage({ type: 'error', text: 'Please provide details or size replacement requirement.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await api.createReturn({
        orderId: selectedOrderId,
        reason,
        reasonDetails: details.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });

      setMessage({
        type: 'success',
        text: 'Return request submitted successfully! Our logistics team will review and schedule free doorstep reverse pickup within 24–48 hours.',
      });
      setDetails('');
      setPhotoUrl('');
      fetchData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to submit return request. Please verify that the 7-day return window is active.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Policy Kicker */}
      <div className="bg-orange-50 border border-orange-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded">
            HASSLE-FREE PROMISE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            7-Day Return & Size Exchange Portal
          </h1>
          <p className="text-xs text-zinc-600 max-w-xl leading-relaxed">
            Every customer gets a 7-calendar-day return window beginning from the exact recorded delivery date. Unworn footwear with tags and original packaging is eligible for zero-fee reverse pickup and instant size replacement or 100% refund.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-200 text-xs shadow-xs shrink-0 space-y-1">
          <div className="flex items-center gap-2 font-bold text-zinc-900">
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Doorstep Courier Pickup</span>
          </div>
          <p className="text-zinc-500 text-[11px]">Free pan-India reverse logistics</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid: Return Request Form + Return Requests History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Request Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
            Submit Return / Exchange
          </h2>

          <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Delivered Order *</label>
              {orders.length === 0 ? (
                <p className="text-zinc-400 italic text-[11px] bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  No delivered orders found eligible for return at this moment. Orders must be marked Delivered to activate the 7-day return window.
                </p>
              ) : (
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — ₹{o.totalAmount} ({o.items[0]?.productName})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Reason for Return *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
              >
                <option value="wrong_size">Wrong Size (Need replacement size)</option>
                <option value="damaged_item">Transit Damage or Scuff Marks</option>
                <option value="defective_stitching">Defective Stitching or Sole Glazing</option>
                <option value="not_as_pictured">Different than Website Photos</option>
                <option value="color_mismatch">Color Shade Mismatch</option>
                <option value="other">Other Preference</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Description / Requested Size *
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. Shoe is slightly tight in toe box, please send UK 9 instead of UK 8."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Photo URL (Optional photo proof)
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/shoe-photo.jpg"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || orders.length === 0}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: '#FF5A1F' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit 7-Day Return Request'}</span>
            </button>
          </form>
        </div>

        {/* Right: Return Requests History */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-200">
            Active Return Requests & Refund Status
          </h2>

          {loading ? (
            <div className="text-xs text-zinc-400 p-8 text-center">Loading return history...</div>
          ) : returns.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center text-xs text-zinc-500 space-y-2">
              <RotateCcw className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="font-semibold text-zinc-800">No Return Requests Found</p>
              <p>You have not requested any returns yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((ret) => (
                <div
                  key={ret.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-zinc-900">{ret.orderNumber}</span>
                      <span className="text-zinc-400 ml-2">· Reason: {ret.reason.replace('_', ' ')}</span>
                      <p className="text-[11px] text-zinc-500 mt-1">{ret.reasonDetails}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      ret.status === 'refund_completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ret.status === 'pickup_scheduled' || ret.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ret.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-xs text-zinc-600 flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <span>Refund Amount: <strong className="text-zinc-900">₹{ret.refundAmount}</strong></span>
                      {ret.pickupDate && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Pickup Date: {new Date(ret.pickupDate).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>

                    {ret.refundTransactionId && (
                      <span className="text-[11px] text-emerald-700 font-mono font-bold">
                        Txn ID: {ret.refundTransactionId}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
