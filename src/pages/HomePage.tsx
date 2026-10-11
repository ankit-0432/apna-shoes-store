import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Flame, Sparkles, Star, ChevronRight } from 'lucide-react';
import { Product } from '../types/store.js';
import { useStoreConfig } from '../context/StoreConfigContext.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { SneakerGraphic } from '../components/common/SneakerGraphic.js';

interface HomePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ products, onSelectProduct, onNavigate }) => {
  const { config } = useStoreConfig();
  const [activeTab, setActiveTab] = useState<'all' | 'mens' | 'womens' | 'running'>('all');

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
      {/* 1. HERO SECTION (1 bold campaign focal point) */}
      <section className="relative overflow-hidden bg-zinc-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 border border-zinc-900 shadow-2xl">
        {/* Ambient background studio lighting glow */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: config.brandPrimaryColor || '#FF5A1F' }}
        />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-10 bg-orange-600 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 z-10">
            {/* Quiet 1-line text kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-orange-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.heroBadge || 'Drop 2026 Live · Pan-India Delivery'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-[1.08] text-balance">
              {config.heroHeadline || 'Har Kadam, Apna Style.'}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed font-normal">
              {config.heroSubheadline ||
                'Engineered for India’s streets. High-traction running sneakers, retro high-tops, and lightweight everyday kicks crafted for supreme comfort and all-day endurance.'}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('all')}
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 hover:opacity-95 active:scale-98"
                style={{ backgroundColor: config.brandPrimaryColor || '#FF5A1F' }}
              >
                <span>{config.heroCtaText || 'Shop New Drops'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('bestsellers')}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Explore Bestsellers
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-lg font-black text-white tabular-nums">₹999+</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">Free Express Shipping</p>
              </div>
              <div>
                <p className="text-lg font-black text-white tabular-nums">7 Days</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">Doorstep Returns</p>
              </div>
              <div>
                <p className="text-lg font-black text-white tabular-nums">4.8 ★</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">15,000+ Happy Feet</p>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-md bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800/80 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span className="font-mono text-[11px]">APNA AIR GLIDE · 01</span>
                <span className="text-orange-400 font-semibold font-mono">EDITION 2026</span>
              </div>

              {/* Sneaker Graphic Display */}
              <div className="my-auto py-4">
                <SneakerGraphic
                  type="air-glide"
                  accentColor={config.brandPrimaryColor || '#FF5A1F'}
                  className="w-full h-56"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Price</span>
                  <span className="text-base font-bold text-white tabular-nums">₹1,499</span>
                </div>
                <button
                  onClick={() => onNavigate('all', 'Air Glide')}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
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
