import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Flame, Sparkles, Star, ChevronRight, ChevronLeft, Tag } from 'lucide-react';
import { Product, HeroBanner } from '../types/store.js';
import { useStoreConfig } from '../context/StoreConfigContext.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { SneakerGraphic } from '../components/common/SneakerGraphic.js';

interface HomePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

const DEFAULT_BANNERS: HeroBanner[] = [
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
];

export const HomePage: React.FC<HomePageProps> = ({ products, onSelectProduct, onNavigate }) => {
  const { config } = useStoreConfig();
  const [activeTab, setActiveTab] = useState<'all' | 'mens' | 'womens' | 'running'>('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideImageErrors, setSlideImageErrors] = useState<Record<string, boolean>>({});

  // Get active banners from CMS config, or fallback to default 5
  const banners: HeroBanner[] = (config.heroBanners && config.heroBanners.length > 0)
    ? config.heroBanners.filter(b => b.isActive)
    : DEFAULT_BANNERS;

  const totalSlides = banners.length > 0 ? banners.length : 1;

  // Auto-play slideshow every 5.5 seconds unless paused
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const currentBanner = banners[currentSlide] || DEFAULT_BANNERS[0];
  const accentColor = currentBanner.accentColor || config.brandPrimaryColor || '#FF5A1F';

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6);
  const bestsellers = products.filter(p => p.badge === 'Bestseller' || p.rating >= 4.8).slice(0, 4);

  const displayedProducts = activeTab === 'all'
    ? featuredProducts
    : activeTab === 'mens'
    ? products.filter(p => p.gender === 'men').slice(0, 6)
    : activeTab === 'womens'
    ? products.filter(p => p.gender === 'women').slice(0, 6)
    : products.filter(p => p.categorySlug === 'running-shoes').slice(0, 6);

  return (
    <div className="space-y-16">
      {/* 1. FRONT 5-BANNER HERO SLIDESHOW (Admin Controlled) */}
      <section
        className="relative overflow-hidden bg-zinc-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 border border-zinc-900 shadow-2xl transition-all duration-500"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Dynamic Studio Ambient Glow matching active slide accent */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-10 bg-orange-600 pointer-events-none" />

        {/* Carousel Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous banner slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all shadow-lg hidden sm:flex items-center justify-center hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNextSlide}
          aria-label="Next banner slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all shadow-lg hidden sm:flex items-center justify-center hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Banner Slide Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[500px]">
          {/* Left Slide Copy */}
          <div className="lg:col-span-7 space-y-5 z-10 animate-in fade-in duration-300 key={currentBanner.id}">
            {/* Top Offer & Campaign Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span
                className="px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] shadow-sm flex items-center gap-1.5"
                style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
              >
                <Tag className="w-3 h-3" />
                <span>{currentBanner.offerBadge || 'OFFER ACTIVE'}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 font-mono text-[10.5px] uppercase tracking-wider">
                {currentBanner.badge || 'APNA SHOES EXCLUSIVE'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display leading-[1.1] text-balance">
              {currentBanner.headline}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed font-normal">
              {currentBanner.subheadline}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate(currentBanner.ctaLink || 'all')}
                className="px-6 py-3.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center gap-2 hover:opacity-95 active:scale-98"
                style={{ backgroundColor: accentColor }}
              >
                <span>{currentBanner.ctaText || 'Shop Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('bestsellers')}
                className="px-6 py-3.5 rounded-xl font-semibold text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Explore Bestsellers
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-5 border-t border-zinc-800/80 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-base font-black text-white tabular-nums">₹999+</p>
                <p className="text-zinc-400 text-[10.5px] mt-0.5">Free Express Shipping</p>
              </div>
              <div>
                <p className="text-base font-black text-white tabular-nums">7 Days</p>
                <p className="text-zinc-400 text-[10.5px] mt-0.5">Doorstep Returns</p>
              </div>
              <div>
                <p className="text-base font-black text-white tabular-nums">4.8 ★</p>
                <p className="text-zinc-400 text-[10.5px] mt-0.5">15,000+ Happy Feet</p>
              </div>
            </div>
          </div>

          {/* Right Slide Sneaker Photography Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] max-w-md bg-zinc-900/90 rounded-2xl p-4 sm:p-5 border border-zinc-800 flex flex-col justify-between overflow-hidden shadow-2xl group">
              <div className="flex justify-between items-center text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                <span className="font-mono text-[10.5px] uppercase font-bold text-orange-400">
                  APNA SHOES · SLIDE 0{currentSlide + 1}
                </span>
                <span className="text-zinc-400 font-mono text-[10px]">
                  PAN-INDIA READY
                </span>
              </div>

              {/* Shoe Image / Graphic */}
              <div className="my-auto py-3 relative flex items-center justify-center min-h-[190px]">
                {currentBanner.imageUrl && !slideImageErrors[currentBanner.id] ? (
                  <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.headline}
                    className="max-h-48 sm:max-h-52 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    onError={() => {
                      setSlideImageErrors((prev) => ({ ...prev, [currentBanner.id]: true }));
                    }}
                  />
                ) : (
                  <SneakerGraphic
                    type={currentBanner.graphicType || 'air-glide'}
                    accentColor={accentColor}
                    className="w-full h-48 drop-shadow-2xl"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[9.5px]">Special Campaign</span>
                  <span className="text-xs font-bold text-white">
                    {currentBanner.offerBadge || 'Verified Deal'}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate(currentBanner.ctaLink || 'all')}
                  className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-[11px] hover:bg-zinc-200 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Progress & Dot Indicators (5 Slides) */}
        <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
              Banners (Admin Controlled):
            </span>
            <div className="flex items-center gap-1.5">
              {banners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-8 bg-orange-500'
                      : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}: ${b.headline}`}
                  title={`${idx + 1}. ${b.headline}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span>Slide {currentSlide + 1} of {totalSlides}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500 truncate max-w-[180px] sm:max-w-none">
              {currentBanner.offerBadge}
            </span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY TILES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Explore Footwear</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('all')}
            className="text-xs font-semibold text-zinc-700 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: "Men's Sneakers", slug: 'mens', type: 'high-top' as const, count: '14 Models' },
            { name: "Women's Sneakers", slug: 'womens', type: 'retro-dunk' as const, count: '10 Models' },
            { name: "Kids' Active", slug: 'kids', type: 'junior-bolt' as const, count: '8 Models' },
            { name: 'Running Shoes', slug: 'running', type: 'aero-runner' as const, count: '12 Models' },
            { name: 'Casual Kicks', slug: 'casual', type: 'campus-pulse' as const, count: '16 Models' },
            { name: 'Chunky Street', slug: 'chunky', type: 'street-chunky' as const, count: '6 Models' },
          ].map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate(cat.slug)}
              className="group cursor-pointer bg-white border border-zinc-200 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-orange-300"
            >
              <div className="w-20 h-16 mb-2 flex items-center justify-center">
                <SneakerGraphic
                  type={cat.type}
                  accentColor="#FF5A1F"
                  className="w-full h-full group-hover:scale-110 transition-transform"
                />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS & FILTER TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Top Streetwear Drops</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display mt-1">
              Fresh Arrivals
            </h2>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'all' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All Drops
            </button>
            <button
              onClick={() => setActiveTab('mens')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'mens' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Men
            </button>
            <button
              onClick={() => setActiveTab('womens')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'womens' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Women
            </button>
            <button
              onClick={() => setActiveTab('running')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'running' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Running
            </button>
          </div>
        </div>

        {/* 3-column / 4-column product grid with generous whitespace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL BANNER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl"
          style={{ backgroundColor: config.brandPrimaryColor || '#FF5A1F' }}
        >
          <div className="space-y-3 z-10 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-900 bg-white px-2.5 py-1 rounded inline-block">
              LIMITED TIME PROMO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              {config.promoBannerTitle || 'GET FLAT ₹200 OFF ON YOUR FIRST PAIR'}
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 max-w-lg leading-relaxed">
              {config.promoBannerSubtitle || 'Use coupon code FIRSTPAIR at checkout. Free express delivery across India & Cash on Delivery available.'}
            </p>
          </div>

          <div className="z-10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('all')}
              className="px-6 py-3.5 rounded-xl bg-zinc-950 text-white font-bold text-sm shadow hover:bg-zinc-900 transition-colors whitespace-nowrap"
            >
              Shop with Discount
            </button>
            <button
              onClick={() => onNavigate('sale')}
              className="px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold text-sm transition-colors whitespace-nowrap"
            >
              View Sale Items
            </button>
          </div>
        </div>
      </section>

      {/* 5. BESTSELLERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display mt-1">
              Bestselling Footwear
            </h2>
          </div>
          <button
            onClick={() => onNavigate('bestsellers')}
            className="text-xs font-semibold text-zinc-700 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS (Social Proof Adjacency) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-zinc-100/70 rounded-3xl border border-zinc-200">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Verified Indian Buyers</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display mt-1">
            Loved Across India
          </h2>
          <p className="text-xs text-zinc-500 mt-2">
            Over 15,000+ happy sneaker lovers step in Apna Shoes every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Amitabh Sengupta',
              city: 'Kolkata, WB',
              review: 'Bought the Apna Air Glide 01 for daily commute on the Kolkata Metro. The dual-density foam sole feels ridiculously comfortable even after standing for 2 hours. Best ₹1,499 spent!',
              shoe: 'Air Glide 01 (UK 9)',
              rating: 5,
            },
            {
              name: 'Kavita Deshmukh',
              city: 'Pune, Maharashtra',
              review: 'Ordered the Metro Low Women kicks. Delivery arrived in 48 hours to Pune via Shiprocket. Sizing is spot on for Indian feet and the finishing is super clean. 10/10 recommend!',
              shoe: 'Metro Low Women (UK 6)',
              rating: 5,
            },
            {
              name: 'Gurpreet Singh',
              city: 'Chandigarh, Punjab',
              review: 'Had to exchange from UK 8 to UK 9. Apna Shoes doorstep return service was completely seamless — pickup guy arrived next day and replacement was dispatched instantly. Great brand!',
              shoe: 'Retro Dunk High-Top (UK 9)',
              rating: 5,
            },
          ].map((rev, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed italic">
                  "{rev.review}"
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-zinc-900">{rev.name}</h4>
                  <p className="text-[11px] text-zinc-400">{rev.city}</p>
                </div>
                <span className="text-[10px] font-mono font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {rev.shoe}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
