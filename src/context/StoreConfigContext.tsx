import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreCMSConfig } from '../types/store.js';
import { api } from '../services/api.js';

interface StoreConfigContextType {
  config: StoreCMSConfig;
  isLoading: boolean;
  updateConfig: (newConfig: Partial<StoreCMSConfig>) => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const defaultConfig: StoreCMSConfig = {
  storeName: 'APNA SHOES',
  tagline: 'Har Kadam, Apna Style.',
  logoText: 'APNA SHOES',
  announcementText: '⚡ FREE Express Shipping across India on orders above ₹999 | 7-Day Hassle-Free Returns Guaranteed',
  brandPrimaryColor: '#FF5A1F',
  brandDarkColor: '#0F0F11',
  heroHeadline: 'Har Kadam, Apna Style.',
  heroSubheadline: 'Engineered for India’s streets. Premium sneakers, high-performance running kicks, and everyday silhouettes made affordable without cutting corners.',
  heroCtaText: 'Shop New Drops',
  heroBadge: 'Drop 2026 Live · Pan-India Delivery',
  promoBannerTitle: 'GET FLAT ₹200 OFF ON YOUR FIRST PAIR',
  promoBannerSubtitle: 'Use coupon code FIRSTPAIR at checkout. Free shipping & COD available.',
  contactEmail: 'care@apnashoes.in',
  contactPhone: '+91 98765 43210',
  contactAddress: 'Apna Shoes Logistics & Warehouse, Plot 42, Sector 63, Noida, NCR Delhi 201301',
  whatsappNumber: '+919876543210',
  gstNumber: '07AAACA1234F1Z8',
  freeShippingThreshold: 999,
  defaultShippingFee: 99,
  aboutContent: 'Affordable, stylish, everyday footwear for everyone across India.',
  faqList: [],
  returnPolicyContent: '7-calendar-day return window from verified delivery date.',
  shippingPolicyContent: 'Pan-India shipping in 2-4 business days.',
  privacyPolicyContent: 'Your data is protected under Indian IT Act regulations.',
  termsContent: 'Prices include 18% GST.',
  lastUpdated: new Date().toISOString(),
};

const StoreConfigContext = createContext<StoreConfigContextType>({
  config: defaultConfig,
  isLoading: true,
  updateConfig: async () => {},
  refreshConfig: async () => {},
});

export const StoreConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<StoreCMSConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const data = await api.getConfig();
      if (data) {
        setConfig(data);
      }
    } catch (e) {
      console.warn('Using fallback CMS config:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<StoreCMSConfig>) => {
    const updated = await api.updateConfig(newConfig);
    setConfig(updated);
  };

  return (
    <StoreConfigContext.Provider value={{ config, isLoading, updateConfig, refreshConfig: fetchConfig }}>
      {children}
    </StoreConfigContext.Provider>
  );
};

export const useStoreConfig = () => useContext(StoreConfigContext);
