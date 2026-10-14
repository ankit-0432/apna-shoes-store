import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Truck,
  Clock,
  ShieldCheck,
  Phone,
  Package,
  Check,
  ArrowRight,
  ExternalLink,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { syncReturnToFirestore } from '../services/firebaseSync.js';
import { useAuth } from '../context/AuthContext.js';
import { ReturnRequest, Order, OrderItem } from '../types/store.js';

interface ReturnsPageProps {
  onNavigate: (view: string, param?: string) => void;
  initialOrderNumber?: string;
}

export const ReturnsPage: React.FC<ReturnsPageProps> = ({ onNavigate, initialOrderNumber }) => {
  const { user, openLoginModal } = useAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [allUserOrders, setAllUserOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [returnType, setReturnType] = useState<'refund' | 'size_exchange'>('refund');
  const [desiredSize, setDesiredSize] = useState('UK 9');
  const [reason, setReason] = useState<ReturnRequest['reason']>('wrong_size');
  const [details, setDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    if (!user) {
      setReturns([]);
      setDeliveredOrders([]);
      setAllUserOrders([]);
      return;
    }

    setLoading(true);
    try {
      const query = user.phone || user.email;
      const [userOrders, userReturns] = await Promise.all([
        api.getUserOrders(query),
        api.getUserReturns(query),
      ]);

      setAllUserOrders(userOrders);
      setReturns(userReturns);

      // Rule: ONLY orders that have been marked 'delivered' are eligible for returns!
      const delivered = userOrders.filter((o) => o.orderStatus === 'delivered');
      setDeliveredOrders(delivered);

      if (delivered.length > 0) {
        const target = initialOrderNumber
          ? delivered.find((o) => o.orderNumber === initialOrderNumber || o.id === initialOrderNumber) || delivered[0]
          : delivered[0];
        setSelectedOrderId(target.id);
        // Pre-select first item by default
        if (target.items.length > 0) {
          setSelectedItemIds([target.items[0].id || 'item-0']);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // When selected order changes, reset item selection
  const currentOrder = deliveredOrders.find((o) => o.id === selectedOrderId);
  useEffect(() => {
    if (currentOrder && currentOrder.items.length > 0) {
      setSelectedItemIds([currentOrder.items[0].id || 'item-0']);
    }
  }, [selectedOrderId]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) => {
      if (prev.includes(itemId)) {
        if (prev.length === 1) return prev; // Keep at least one item
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) {
      setMessage({ type: 'error', text: 'Please select an eligible delivered order.' });
      return;
    }

    if (currentOrder.orderStatus !== 'delivered') {
      setMessage({
        type: 'error',
        text: 'Return requests can only be initiated once the footwear has been marked Delivered.',
      });
      return;
    }

    if (selectedItemIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one footwear item from your order to return.' });
      return;
    }

    if (!details.trim()) {
      setMessage({ type: 'error', text: 'Please explain the reason for return or sizing replacement details.' });
      return;
    }

    if (returnType === 'refund' && payoutMethod === 'upi' && !upiId.trim()) {
      setMessage({ type: 'error', text: 'Please enter your UPI ID for the 100% refund transfer.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const itemsToReturn = currentOrder.items
      .filter((it, idx) => selectedItemIds.includes(it.id || `item-${idx}`))
      .map((it) => ({
        itemId: it.id,
        productName: it.productName,
        size: it.size,
        quantity: it.quantity,
        image: it.image,
        price: it.unitPrice,
      }));

    try {
      const createdReturn = await api.createReturn({
        orderId: currentOrder.id,
        reason,
        reasonDetails: details.trim(),
        photoUrl: photoUrl.trim() || undefined,
        itemsToReturn,
        returnType,
        desiredSize: returnType === 'size_exchange' ? desiredSize : undefined,
        payoutDetails:
          returnType === 'refund'
            ? {
                method: payoutMethod,
                upiId: upiId.trim() || undefined,
                accountNumber: bankAccount.trim() || undefined,
                ifsc: ifsc.trim() || undefined,
              }
            : undefined,
        pickupAddress: `${currentOrder.shippingAddress.flatHouse}, ${currentOrder.shippingAddress.streetLocality}, ${currentOrder.shippingAddress.city} - ${currentOrder.shippingAddress.pincode}`,
      });

      syncReturnToFirestore(createdReturn).catch(() => {});

      setMessage({
        type: 'success',
        text: `Return request submitted successfully! Free doorstep reverse pickup will be scheduled by our logistics team within 24–48 hours.`,
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
      {/* Policy Kicker Header */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/50 border border-orange-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-md">
            HASSLE-FREE 7-DAY PROMISE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            7-Day Return & Size Exchange
          </h1>
          <p className="text-xs text-zinc-600 max-w-xl leading-relaxed">
            Return window activates immediately upon recorded delivery. Select the exact shoe you want to return or exchange for zero-fee doorstep courier pickup.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-orange-200 text-xs shadow-xs shrink-0 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-zinc-900">
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Doorstep Courier Pickup</span>
          </div>
          <p className="text-zinc-500 text-[11px]">Free reverse pickup via Delhivery & BlueDart</p>
          <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-700 font-semibold pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Refund or Instant Size Exchange</span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Auth Gate for Return Page */}
      {!user ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-orange-50 border border-orange-200 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <Phone className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-950 font-display">Sign In to Request a Return</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
              To submit a return or check your return status, sign in with your verified mobile number and OTP.
            </p>
          </div>
          <button
            onClick={() => openLoginModal('returns', 'Sign in with mobile OTP to request return or exchange')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Sign In with Mobile OTP</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Return Request Form */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Initiate Return / Exchange
              </h2>
              <span className="text-[11px] font-semibold text-zinc-500">
                Account: {user.phone || user.name}
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-400">Loading your eligible orders...</div>
            ) : deliveredOrders.length === 0 ? (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
                <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="text-sm font-bold text-amber-950">No Delivered Orders Available for Return</h4>
                <p className="text-xs text-amber-800 leading-relaxed max-w-sm mx-auto">
                  {allUserOrders.length > 0
                    ? `You have ${allUserOrders.length} order(s) placed, but none have been marked as 'Delivered' yet. Return and exchange requests unlock immediately once the package is delivered to your doorstep.`
                    : 'You haven’t placed any orders on this mobile number yet.'}
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => onNavigate('my-orders')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    View Order Tracking
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
                {/* 1. Delivered Order Selection */}
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    Select Delivered Order *
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-xs"
                  >
                    {deliveredOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — Total: ₹{o.totalAmount} (Delivered on{' '}
                        {o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString('en-IN') : 'Recent'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. SPECIFIC PRODUCT SELECTION ("only jo product order karege uskii ka") */}
                {currentOrder && (
                  <div className="space-y-2 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                    <label className="block text-zinc-800 font-bold text-[11px] uppercase tracking-wider">
                      Select Item(s) to Return from This Order *
                    </label>
                    <div className="space-y-2">
                      {currentOrder.items.map((item, idx) => {
                        const itemId = item.id || `item-${idx}`;
                        const isSelected = selectedItemIds.includes(itemId);

                        return (
                          <div
                            key={itemId}
                            onClick={() => toggleItemSelection(itemId)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50/80 border-orange-300 ring-1 ring-orange-400'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(itemId)}
                              className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-11 h-11 object-cover rounded-lg border border-zinc-200 shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 bg-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-zinc-900 truncate text-xs">{item.productName}</p>
                              <p className="text-[11px] text-zinc-500">
                                Size: <strong>{item.size}</strong> · Qty: {item.quantity} · Price: ₹{item.unitPrice}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Return Option: 100% Refund vs Size Replacement */}
                <div>
                  <label className="block text-zinc-700 font-bold mb-1.5">Resolution Preference *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReturnType('refund')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        returnType === 'refund'
                          ? 'border-orange-500 bg-orange-50/60 font-bold text-orange-950 ring-1 ring-orange-500'
                          : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mb-1 text-orange-600" />
                      <span className="block text-xs font-bold">100% Refund</span>
                      <span className="text-[10px] text-zinc-500">Via UPI / Bank Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReturnType('size_exchange')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        returnType === 'size_exchange'
                          ? 'border-orange-500 bg-orange-50/60 font-bold text-orange-950 ring-1 ring-orange-500'
                          : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 mb-1 text-orange-600" />
                      <span className="block text-xs font-bold">Size Exchange</span>
                      <span className="text-[10px] text-zinc-500">Replacement pair delivery</span>
                    </button>
                  </div>
                </div>

                {/* Size Choice if Exchange */}
                {returnType === 'size_exchange' && (
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      Select Desired Replacement Size *
                    </label>
                    <select
                      value={desiredSize}
                      onChange={(e) => setDesiredSize(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
                    >
                      <option value="UK 6">UK 6</option>
                      <option value="UK 7">UK 7</option>
                      <option value="UK 8">UK 8</option>
                      <option value="UK 9">UK 9</option>
                      <option value="UK 10">UK 10</option>
                      <option value="UK 11">UK 11</option>
                    </select>
                  </div>
                )}

                {/* Payout Details if Refund */}
                {returnType === 'refund' && (
                  <div className="space-y-2 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                    <label className="block text-zinc-700 font-bold text-[11px] uppercase tracking-wider">
                      Refund Payout Method *
                    </label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="payoutMethod"
                          checked={payoutMethod === 'upi'}
                          onChange={() => setPayoutMethod('upi')}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span>UPI ID (Instant)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer ml-4">
                        <input
                          type="radio"
                          name="payoutMethod"
                          checked={payoutMethod === 'bank_transfer'}
                          onChange={() => setPayoutMethod('bank_transfer')}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span>Bank NEFT / IMPS</span>
                      </label>
                    </div>

                    {payoutMethod === 'upi' ? (
                      <input
                        type="text"
                        placeholder="e.g. 9876543210@paytm or yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Bank Account Number"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="IFSC Code (e.g. HDFC0001234)"
                          value={ifsc}
                          onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                          className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono uppercase"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Reason Selection */}
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Reason for Return *</label>
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
                    <option value="other">Changed Mind / Preference</option>
                  </select>
                </div>

                {/* Reason Details */}
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    Description & Details *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe why you want to return or what size fits better..."
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Photo URL (Optional) */}
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
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
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#FF5A1F' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit 7-Day Return Request'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Return Requests History for this customer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                My Active Return Requests
              </h2>
              <button
                onClick={fetchData}
                className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="text-xs text-zinc-400 p-8 text-center">Loading return history...</div>
            ) : returns.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center text-xs text-zinc-500 space-y-2">
                <RotateCcw className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="font-semibold text-zinc-800">No Return Requests on This Account</p>
                <p>You have not submitted any return or size exchange requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {returns.map((ret) => (
                  <div
                    key={ret.id}
                    className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3.5"
                  >
                    <div className="flex justify-between items-start gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 font-mono">{ret.orderNumber}</span>
                          <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-mono">
                            {ret.id}
                          </span>
                        </div>
                        <span className="text-zinc-500 text-[11px] block mt-0.5">
                          Type:{' '}
                          <strong className="text-zinc-800">
                            {ret.returnType === 'size_exchange' ? `Size Exchange (${ret.desiredSize})` : '100% Refund'}
                          </strong>{' '}
                          · Reason: {ret.reason.replace('_', ' ')}
                        </span>
                        <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                          "{ret.reasonDetails}"
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0 ${
                          ret.status === 'refund_completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ret.status === 'pickup_scheduled' || ret.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : ret.status === 'picked_up'
                            ? 'bg-amber-100 text-amber-800'
                            : ret.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {ret.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Returned items preview */}
                    {ret.itemsToReturn && ret.itemsToReturn.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Items for return:</span>
                        <div className="space-y-1">
                          {ret.itemsToReturn.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] text-zinc-700">
                              <span>
                                {item.productName} (Size: {item.size})
                              </span>
                              <span className="font-semibold">₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reverse Logistics & Status Banner */}
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 text-xs text-zinc-700 space-y-1.5">
                      <div className="flex flex-wrap justify-between items-center gap-1">
                        <span>
                          Refund / Exchange Value:{' '}
                          <strong className="text-zinc-950 font-bold">₹{ret.refundAmount}</strong>
                        </span>

                        {ret.reverseAwb && (
                          <span className="text-[11px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-bold">
                            Reverse AWB: {ret.reverseAwb}
                          </span>
                        )}
                      </div>

                      {ret.pickupDate && (
                        <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Scheduled Reverse Pickup: {new Date(ret.pickupDate).toLocaleDateString('en-IN')}{' '}
                            {ret.reverseCourier ? `via ${ret.reverseCourier}` : ''}
                          </span>
                        </div>
                      )}

                      {ret.refundTransactionId && (
                        <div className="text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>Refund Paid (Ref / UTR: {ret.refundTransactionId})</span>
                        </div>
                      )}

                      {ret.adminNotes && (
                        <p className="text-[11px] text-zinc-500 italic">
                          Admin note: {ret.adminNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
