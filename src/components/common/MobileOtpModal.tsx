import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface MobileOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (redirectTarget?: string | null) => void;
}

export const MobileOtpModal: React.FC<MobileOtpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    loginWithPhone,
    loginAsDemoCustomer,
    loginAsDemoNewCustomer,
    loginReasonMessage,
    redirectAfterLogin,
  } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>('1234');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setError(null);
      setOtpCode('');
      setTimer(30);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = async (targetPhone?: string) => {
    const raw = (targetPhone || phoneNumber).replace(/\D/g, '');
    if (raw.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    const clean = raw.length === 10 ? `+91 ${raw.slice(0, 5)} ${raw.slice(5)}` : `+91 ${raw.slice(-10)}`;
    setPhoneNumber(clean);
    setError(null);
    setIsSending(true);

    try {
      const res = await api.sendOtp(clean);
      if (res.demoOtp) {
        setDemoCodeHint(res.demoOtp);
      } else {
        setDemoCodeHint('1234');
      }
      setStep('otp');
      setTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 4-digit OTP code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const verifiedUser = await api.verifyOtp(
        phoneNumber,
        otpCode.trim(),
        customerName.trim() || undefined,
        customerEmail.trim() || undefined
      );

      loginWithPhone(phoneNumber, verifiedUser?.name || customerName, verifiedUser?.email || customerEmail);
      onClose();
      if (onSuccess) {
        onSuccess(redirectAfterLogin);
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect OTP code. Enter 1234 or the demo code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickDemoCustomer = () => {
    loginAsDemoCustomer();
    onClose();
    if (onSuccess) onSuccess(redirectAfterLogin);
  };

  const handleQuickNewCustomer = () => {
    loginAsDemoNewCustomer();
    onClose();
    if (onSuccess) onSuccess(redirectAfterLogin);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden relative">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 pt-6 pb-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase">
              Secure Sign In
            </span>
          </div>

          <h2 className="text-xl font-black font-display tracking-tight flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <span>Mobile OTP Login</span>
          </h2>
          <p className="text-xs text-orange-100 mt-1">
            {loginReasonMessage ||
              'Sign in with your mobile number to view only your orders, track shipments, and request returns.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Enter 10-Digit Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-zinc-500 font-bold text-xs pointer-events-none border-r border-zinc-200 pr-2">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phoneNumber.replace(/^\+91\s*/, '').replace(/\s+/g, '')}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendOtp();
                    }}
                    autoFocus
                    className="w-full pl-20 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold tracking-wider text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  We'll send an instant 4-digit verification code to this number.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isSending || phoneNumber.replace(/\D/g, '').length < 10}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Get OTP via SMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Fast-Login Pills for Testing */}
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider block">
                  ⚡ Quick Test Options
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleQuickNewCustomer}
                    className="p-2.5 rounded-xl border border-dashed border-zinc-300 hover:border-orange-400 hover:bg-orange-50/50 text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-zinc-900 block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span>New Customer (0 Orders)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">Test fresh clean account</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoCustomer}
                    className="p-2.5 rounded-xl border border-dashed border-zinc-300 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-zinc-900 block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rahul Sharma (Sample Orders)</span>
                    </span>
                    <span className="text-[10px] text-zinc-500">Test existing order tracking</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900">
                    OTP sent to {phoneNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-800">
                    Verification Code:{' '}
                    <strong className="font-mono bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded">
                      {demoCodeHint || '1234'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoCodeHint || '1234')}
                    className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs border border-emerald-300 hover:bg-emerald-100 transition-colors"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Enter 4-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold py-3 px-4 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-zinc-100">
                <span className="text-[11px] font-semibold text-zinc-600 block">
                  Customer Details (Optional for new users)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="Email (for receipts)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !otpCode.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <span className="text-[11px] text-zinc-400">
                    Resend OTP in <strong className="text-zinc-600">{timer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-[11px] text-orange-600 hover:underline font-bold"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="text-center text-[10.5px] text-zinc-400 flex items-center justify-center gap-1.5 pt-2">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Strict privacy — your orders are visible only on your phone number</span>
          </div>
        </div>
      </div>
    </div>
  );
};
