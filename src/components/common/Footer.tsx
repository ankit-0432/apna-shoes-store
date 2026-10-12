import React, { useState } from 'react';
import { Truck, RotateCcw, ShieldCheck, CreditCard, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStoreConfig } from '../../context/StoreConfigContext.js';
import { api } from '../../services/api.js';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { config } = useStoreConfig();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      setNewsletterStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setSubmitting(true);
    setNewsletterStatus(null);
    try {
      const res = await api.subscribeNewsletter(newsletterEmail.trim());
      setNewsletterStatus({
        type: 'success',
        message: res.message || 'Subscribed! Check your inbox for ₹200 off coupon code FIRSTPAIR.',
      });
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterStatus({
        type: 'error',
        message: err.message || 'Subscription failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900 mt-20">
      {/* 1. Value Proposition Strip */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-800 text-orange-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Pan-India Express Delivery</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Free shipping on orders above ₹999. 2–4 business days delivery.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-800 text-orange-500 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Hassle-Free Returns</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Unworn shoes eligible for instant size exchange or full refund.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-800 text-orange-500 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cash on Delivery & Razorpay</h4>
              <p className="text-xs text-zinc-400 mt-0.5">UPI, Cards, Net Banking & doorstep cash payment supported.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-800 text-orange-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Genuine Craftsmanship</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Dual-density cushioning & durable traction for Indian roads.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Newsletter VIP Signup Banner */}
      <div className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 rounded-2xl">
            <div className="space-y-1 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                <span>👟 VIP SNEAKERHEAD CLUB</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                Get ₹200 OFF on Your First Footwear Order
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Subscribe for early access to limited sneaker drops, flash sales, and exclusive promo codes. No spam ever.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0">
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-[420px]">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Subscribing...' : 'Claim ₹200'}</span>
                </button>
              </form>

              {newsletterStatus && (
                <div
                  className={`mt-2.5 text-xs flex items-center gap-1.5 ${
                    newsletterStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {newsletterStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{newsletterStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Story Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white"
              style={{ backgroundColor: config.brandPrimaryColor || '#FF5A1F' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M21.5 15.5c-.8-.8-2.2-1.5-3.5-1.5h-2c-.5-1.2-1.2-2.4-2.2-3.2L12 9.5 9.5 11c-.8.5-1.5 1.5-1.5 2.5v1H4.5c-1.4 0-2.5 1.1-2.5 2.5v1c0 .6.4 1 1 1h18c.6 0 1-.4 1-1v-2c0-.2-.2-.4-.5-.5z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white font-display">
              {config.storeName || 'APNA SHOES'}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
            {config.tagline || 'Har Kadam, Apna Style.'} — Affordable, stylish, everyday footwear engineered for comfort on Indian streets. Built for college, work, sports, and weekend swagger.
          </p>

          <div className="pt-2 text-xs space-y-1.5 text-zinc-400">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              <span>{config.contactEmail || 'care@apnashoes.in'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span>{config.contactPhone || '+91 98765 43210'} (Mon-Sat, 9AM-8PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>{config.contactAddress || 'Sector 63, Noida, NCR Delhi 201301'}</span>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">Footwear Collections</h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>
              <button onClick={() => onNavigate('mens')} className="hover:text-white transition-colors">Men's Sneakers</button>
            </li>
            <li>
              <button onClick={() => onNavigate('womens')} className="hover:text-white transition-colors">Women's Sneakers</button>
            </li>
            <li>
              <button onClick={() => onNavigate('kids')} className="hover:text-white transition-colors">Kids' Shoes</button>
            </li>
            <li>
              <button onClick={() => onNavigate('running')} className="hover:text-white transition-colors">Running & Training</button>
            </li>
            <li>
              <button onClick={() => onNavigate('all', 'casual')} className="hover:text-white transition-colors">Casual Street Kicks</button>
            </li>
            <li>
              <button onClick={() => onNavigate('bestsellers')} className="hover:text-white transition-colors">Bestselling Shoes</button>
            </li>
            <li>
              <button onClick={() => onNavigate('sale')} className="hover:text-orange-400 font-medium transition-colors">Sale & Offers</button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>
              <button onClick={() => onNavigate('track-order')} className="hover:text-white transition-colors font-medium text-orange-400">Track Order (AWB)</button>
            </li>
            <li>
              <button onClick={() => onNavigate('returns')} className="hover:text-white transition-colors">7-Day Return Request</button>
            </li>
            <li>
              <button onClick={() => onNavigate('my-orders')} className="hover:text-white transition-colors">My Orders & Invoices</button>
            </li>
            <li>
              <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">Frequently Asked Questions</button>
            </li>
            <li>
              <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact Support Team</button>
            </li>
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Apna Shoes</button>
            </li>
          </ul>
        </div>

        {/* Policies & Compliance */}
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">Store Policies</h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>
              <button onClick={() => onNavigate('return-policy')} className="hover:text-white transition-colors">7-Day Return Policy</button>
            </li>
            <li>
              <button onClick={() => onNavigate('shipping-policy')} className="hover:text-white transition-colors">Shipping & Delivery Policy</button>
            </li>
            <li>
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-white transition-colors">Privacy & Data Security</button>
            </li>
            <li>
              <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Service</button>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Bar: Copyright & GSTIN (With stealth staff access) */}
      <div className="border-t border-zinc-900 bg-zinc-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <p>© {new Date().getFullYear()} APNA SHOES Retail India Pvt Ltd. All rights reserved.</p>
            {/* Stealth Admin Access trigger - invisible to casual shoppers */}
            <button
              onClick={() => onNavigate('secret-admin')}
              className="text-zinc-800 hover:text-zinc-600 transition-colors p-1 rounded"
              title="APNA"
              aria-label="Staff Login"
            >
              •
            </button>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>GSTIN: {config.gstNumber || '07AAACA1234F1Z8'}</span>
            <span>·</span>
            <span>Made with pride in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
