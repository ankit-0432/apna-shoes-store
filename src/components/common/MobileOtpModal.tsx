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
  Store,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import {
  setupRecaptcha,
  sendFirebasePhoneOtp,
  confirmFirebasePhoneOtp,
} from '../../services/firebaseAuth.js';
import { ConfirmationResult } from 'firebase/auth';

interface MobileOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (redirectTarget?: string | null) => void;
}

export const MobileOtpModal: React.FC<MobileOtpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    loginWithPhone,
    loginReasonMessage,
    redirectAfterLogin,
    loginWithShopify,
    registerWithShopify,
    isShopifyAuthLoading,
  } = useAuth();

  const [authTab, setAuthTab] = useState<'shopify' | 'phone'>('shopify');
  const [shopifyMode, setShopifyMode] = useState<'login' | 'register'>('login');

  // Shopify form fields
  const [shopifyEmail, setShopifyEmail] = useState('');
  const [shopifyPassword, setShopifyPassword] = useState('');
  const [shopifyFirstName, setShopifyFirstName] = useState('');
  const [shopifyLastName, setShopifyLastName] = useState('');
  const [shopifyPhone, setShopifyPhone] = useState('');
  const [shopifyLoading, setShopifyLoading] = useState(false);

  // Phone OTP fields
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setStep('phone');
      setOtpCode('');
      setShopifyPassword('');
      setConfirmationResult(null);
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

  // Handle Shopify Login & Registration
  const handleShopifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shopifyEmail.trim() || !shopifyEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!shopifyPassword || shopifyPassword.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }

    setShopifyLoading(true);
    try {
      if (shopifyMode === 'login') {
        const res = await loginWithShopify(shopifyEmail.trim(), shopifyPassword);
        if (res.success) {
          onClose();
          if (onSuccess) onSuccess(redirectAfterLogin);
        } else {
          setError(res.error || 'Invalid email or password');
        }
      } else {
        if (!shopifyFirstName.trim()) {
          setError('Please enter your first name');
          setShopifyLoading(false);
          return;
        }
        const res = await registerWithShopify({
          firstName: shopifyFirstName.trim(),
          lastName: shopifyLastName.trim() || 'Customer',
          email: shopifyEmail.trim(),
          password: shopifyPassword,
          phone: shopifyPhone.trim() || undefined,
        });
        if (res.success) {
          onClose();
          if (onSuccess) onSuccess(redirectAfterLogin);
        } else {
          setError(res.error || 'Failed to create Shopify customer account');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Shopify account authentication failed');
    } finally {
      setShopifyLoading(false);
    }
  };

  // Handle Phone OTP
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
      const verifier = setupRecaptcha('sign-in-button', 'invisible', () => {});
      try {
        const confirmation = await sendFirebasePhoneOtp(clean, verifier);
        setConfirmationResult(confirmation);
        setStep('otp');
        setTimer(60);
      } catch (fbErr: any) {
        // Fallback to local SMS OTP
        await api.sendOtp(clean);
        setStep('otp');
        setTimer(30);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    if (confirmationResult) {
      try {
        const fbUser = await confirmFirebasePhoneOtp(otpCode.trim(), confirmationResult);
        loginWithPhone(fbUser.phoneNumber || phoneNumber, customerName, customerEmail);
        onClose();
        if (onSuccess) onSuccess(redirectAfterLogin);
        return;
      } catch (fbErr: any) {
        console.warn('[Firebase Auth] OTP confirmation error:', fbErr);
      }
    }

    try {
      const verifiedUser = await api.verifyOtp(
        phoneNumber,
        otpCode.trim(),
        customerName.trim() || undefined,
        customerEmail.trim() || undefined
      );
      loginWithPhone(phoneNumber, verifiedUser?.name || customerName, verifiedUser?.email || customerEmail);
      onClose();
      if (onSuccess) onSuccess(redirectAfterLogin);
    } catch (err: any) {
      setError(err.message || 'Incorrect verification code. Please check SMS.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 max-w-md w-full overflow-hidden relative">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 pt-6 pb-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
              <Store className="w-3 h-3" />
              <span>Shopify Headless Store</span>
            </span>
          </div>

          <h2 className="text-xl font-black font-display tracking-tight flex items-center gap-2">
            <span>Customer Account & Sign In</span>
          </h2>
          <p className="text-xs text-orange-100 mt-1">
            {loginReasonMessage ||
              'Access your saved addresses, tracking, and seamless checkout on apna-shoes-store.myshopify.com'}
          </p>
        </div>

        {/* Tab Switcher: Shopify Account vs Mobile OTP */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 p-1">
          <button
            type="button"
            onClick={() => {
              setAuthTab('shopify');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authTab === 'shopify'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shopify Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('phone');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authTab === 'phone'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-orange-600" />
            <span>Fast Mobile OTP</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SHOPIFY CUSTOMER ACCOUNT */}
          {authTab === 'shopify' && (
            <form onSubmit={handleShopifySubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700">
                  {shopifyMode === 'login' ? 'Sign In with Shopify' : 'Create New Shopify Account'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShopifyMode(shopifyMode === 'login' ? 'register' : 'login');
                    setError(null);
                  }}
                  className="text-orange-600 font-bold hover:underline cursor-pointer text-[11px]"
                >
                  {shopifyMode === 'login' ? 'Create an Account' : 'Already have account?'}
                </button>
              </div>

              {shopifyMode === 'register' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul"
                      value={shopifyFirstName}
                      onChange={(e) => setShopifyFirstName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={shopifyLastName}
                      onChange={(e) => setShopifyLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={shopifyEmail}
                    onChange={(e) => setShopifyEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="Enter account password"
                    value={shopifyPassword}
                    onChange={(e) => setShopifyPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {shopifyMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">Mobile Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={shopifyPhone}
                    onChange={(e) => setShopifyPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={shopifyLoading || isShopifyAuthLoading}
                className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {shopifyLoading || isShopifyAuthLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                    <span>Connecting to Shopify...</span>
                  </>
                ) : shopifyMode === 'login' ? (
                  <>
                    <span>Sign In to Shopify Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Create Shopify Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shopify Storefront API Verified</span>
                </span>
                <span className="font-mono text-[10px]">apna-shoes-store</span>
              </div>
            </form>
          )}

          {/* TAB 2: MOBILE OTP LOGIN */}
          {authTab === 'phone' && (
            <>
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
                  </div>

                  <button
                    id="sign-in-button"
                    onClick={() => handleSendOtp()}
                    disabled={isSending || phoneNumber.replace(/\D/g, '').length < 10}
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending OTP SMS...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600">
                      Code sent to <strong className="text-zinc-900">{phoneNumber}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                      Enter 4 or 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-center text-lg font-black tracking-widest text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || !otpCode.trim()}
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
                </form>
              )}
            </>
          )}


        </div>
      </div>
    </div>
  );
};
