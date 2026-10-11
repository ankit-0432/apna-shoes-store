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
  heroBanners: [
    {
      id: 'banner-1',
      headline: 'Har Kadam, Apna Style — Indian Streetwear Drop',
      subheadline: 'Designed for comfort, engineered for endurance. Over 50+ fresh Indian silhouettes ready to ship across 19,000+ pin codes.',
      offerBadge: '🔥 FLAT 40% OFF · USE CODE APNA40',
      badge: 'DROP 2026 LIVE',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Shop New Drops',
      ctaLink: 'all',
      accentColor: '#FF5A1F',
      graphicType: 'air-glide',
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 'banner-2',
      headline: 'Retro Dunk High-Tops — Ankle Armor Edition',
      subheadline: 'Classic basketball silhouette paired with cloud-foam cushioning for all-day campus and street wear.',
      offerBadge: '⚡ BUY 1 GET 1 50% OFF · LIMITED STOCK',
      badge: 'CAMPUS FAVORITE',
      imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Explore High-Tops',
      ctaLink: 'high-top-sneakers',
      accentColor: '#2563EB',
      graphicType: 'high-top',
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 'banner-3',
      headline: 'Aero Speed Marathon Runners — Carbon Sprint Sole',
      subheadline: 'Featherlight breathable mesh upper with high-energy rebound for early morning 10K runs and gym sessions.',
      offerBadge: '🎉 FESTIVE MEGA OFFER: FLAT ₹300 OFF',
      badge: 'TOP RATED 4.9 ★',
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Shop Running Gear',
      ctaLink: 'running-shoes',
      accentColor: '#059669',
      graphicType: 'aero-runner',
      isActive: true,
      displayOrder: 3,
    },
    {
      id: 'banner-4',
      headline: 'Pastel Minimalist Kicks — Everyday Chic',
      subheadline: 'Clean chalk white and lavender tones that match any outfit from college lectures to casual evening dinners.',
      offerBadge: '✨ SPECIAL BUNDLE: FREE SOCKS & EXTRA LACES',
      badge: 'WOMEN’S BESTSELLER',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Shop Women’s Kicks',
      ctaLink: 'womens',
      accentColor: '#DB2777',
      graphicType: 'retro-dunk',
      isActive: true,
      displayOrder: 4,
    },
    {
      id: 'banner-5',
      headline: 'Junior Bolt Kids Athletic Sneakers',
      subheadline: 'Tough scuff-resistant toe guards, zero-slip rubber soles, and electric colorways for school & playground adventures.',
      offerBadge: '🏷️ FLAT ₹500 OFF ON 2 PAIRS · CODE KIDSCOOL',
      badge: 'KIDS SPECIAL',
      imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Shop Kids Collection',
      ctaLink: 'kids',
      accentColor: '#F59E0B',
      graphicType: 'junior-bolt',
      isActive: true,
      displayOrder: 5,
    },
  ],
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
