import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useStoreConfig } from '../context/StoreConfigContext.js';

interface PoliciesPageProps {
  initialTab?: 'about' | 'contact' | 'faq' | 'shipping' | 'return' | 'privacy' | 'terms';
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ initialTab = 'about' }) => {
  const { config } = useStoreConfig();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setContactForm({ name: '', phone: '', email: '', message: '' });
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  const tabs = [
    { key: 'about', label: 'About Apna Shoes' },
    { key: 'contact', label: 'Contact Us' },
    { key: 'faq', label: 'FAQs' },
    { key: 'return', label: '7-Day Return Policy' },
    { key: 'shipping', label: 'Shipping & Delivery' },
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'terms', label: 'Terms & Conditions' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-200 text-xs font-semibold scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-zinc-950 text-white shadow-xs font-bold'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. ABOUT US */}
      {activeTab === 'about' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Our Story</span>
          <h1 className="text-3xl font-black text-zinc-950 font-display">
            APNA SHOES — Har Kadam, Apna Style.
          </h1>

          <div className="prose text-zinc-700 text-xs sm:text-sm leading-relaxed space-y-4">
            <p className="whitespace-pre-line">{config.aboutContent}</p>
          </div>

          <div className="pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <span className="text-2xl font-black text-zinc-950 block tabular-nums">100%</span>
              <span className="text-zinc-500 mt-1 block">Indian Craftsmanship</span>
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <span className="text-2xl font-black text-zinc-950 block tabular-nums">19,000+</span>
              <span className="text-zinc-500 mt-1 block">Serviced PIN Codes</span>
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <span className="text-2xl font-black text-zinc-950 block tabular-nums">7 Days</span>
              <span className="text-zinc-500 mt-1 block">Zero-Fee Returns</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT US */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Help Desk</span>
              <h2 className="text-2xl font-black text-zinc-950 font-display mt-1">Get in Touch</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Our support team in Noida & Bengaluru is ready to assist you.
              </p>
            </div>

            <div className="space-y-4 text-xs text-zinc-700">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 block">Customer Care Email</span>
                  <a href={`mailto:${config.contactEmail}`} className="text-orange-600 hover:underline">
                    {config.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 block">Phone & WhatsApp Helpline</span>
                  <span>{config.contactPhone} (Mon–Sat, 9:00 AM – 8:00 PM IST)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-900 block">Logistics Central Hub</span>
                  <p className="text-zinc-600">{config.contactAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Send us a Message
            </h3>

            {contactSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
                ✓ Message received! An Apna Shoes customer executive will call or email you within 2 working hours.
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Your Query / Message *</label>
                <textarea
                  rows={3}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Inquiry regarding order, sizing, or return..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-zinc-950 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Query</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. FAQS */}
      {activeTab === 'faq' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Help & Answers</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-zinc-200">
            {config.faqList.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left text-sm font-bold text-zinc-900 hover:text-orange-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-orange-600" /> : <ChevronDown className="w-4 h-4 shrink-0 text-zinc-400" />}
                  </button>

                  {isOpen && (
                    <div className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed pr-6">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 7-DAY RETURN POLICY */}
      {activeTab === 'return' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" />
            <span>Guaranteed Coverage</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            Official 7-Calendar-Day Return & Refund Policy
          </h2>

          <div className="prose text-zinc-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
            {config.returnPolicyContent}
          </div>
        </div>
      )}

      {/* 5. SHIPPING POLICY */}
      {activeTab === 'shipping' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Pan-India Logistics</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            Shipping & Courier Dispatch Policy
          </h2>

          <div className="prose text-zinc-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
            {config.shippingPolicyContent}
          </div>
        </div>
      )}

      {/* 6. PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            Privacy Policy & Data Security
          </h2>
          <div className="prose text-zinc-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
            {config.privacyPolicyContent}
          </div>
        </div>
      )}

      {/* 7. TERMS & CONDITIONS */}
      {activeTab === 'terms' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200 space-y-6 shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display">
            Terms of Sale & Conditions
          </h2>
          <div className="prose text-zinc-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
            {config.termsContent}
          </div>
        </div>
      )}
    </div>
  );
};
