import React, { useState } from 'react';
import { ShoppingBag, Search, User as UserIcon, Menu, X, ShieldCheck, Truck, RotateCcw, Phone, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useStoreConfig } from '../../context/StoreConfigContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  onNavigate: (view: string, param?: string) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const { totalItemsCount, setIsDrawerOpen } = useCart();
  const { config } = useStoreConfig();
  const { user, isAdmin, logout, loginAsDemoAdmin, loginAsDemoCustomer, openLoginModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query.toLowerCase() === 'admin' || query === '#admin') {
      onNavigate('secret-admin');
      setSearchOpen(false);
      setSearchQuery('');
      return;
    }
    if (query) {
      onNavigate('all', query);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200">
      {/* 1. Top Announcement Bar */}
      <div 
        className="w-full text-white text-xs py-2 px-4 flex items-center justify-between text-center font-medium tracking-wide"
        style={{ backgroundColor: config.brandDarkColor || '#0F0F11' }}
      >
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-zinc-300">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-orange-400" />
            Pan-India Express Delivery
          </span>
          <span className="text-zinc-600">·</span>
          <span className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            7-Day Doorstep Returns
          </span>
        </div>

        <p className="flex-1 text-center font-medium truncate px-2 text-xs">
          {config.announcementText}
        </p>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-300">
          <button 
            onClick={() => onNavigate('track-order')}
            className="hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Track Order
          </button>
          <span className="text-zinc-600">·</span>
          <button 
            onClick={() => onNavigate('contact')}
            className="hover:text-white transition-colors"
          >
            Need Help?
          </button>
        </div>
      </div>

      {/* 2. Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (Primary Action & Utilities) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-700 hover:text-black rounded-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            {/* Sneaker Brand Logo Emblem */}
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: config.brandPrimaryColor || '#FF5A1F' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.5 15.5c-.8-.8-2.2-1.5-3.5-1.5h-2c-.5-1.2-1.2-2.4-2.2-3.2L12 9.5 9.5 11c-.8.5-1.5 1.5-1.5 2.5v1H4.5c-1.4 0-2.5 1.1-2.5 2.5v1c0 .6.4 1 1 1h18c.6 0 1-.4 1-1v-2c0-.2-.2-.4-.5-.5z" />
              </svg>
            </div>
            <div className="leading-none">
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 block font-display">
                {config.storeName || 'APNA SHOES'}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-orange-600 block mt-0.5">
                {config.tagline || 'Har Kadam, Apna Style'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold tracking-tight text-zinc-700">
          <button
            onClick={() => onNavigate('all')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'all' ? 'text-orange-600 font-bold border-b-2 border-orange-600' : 'hover:text-zinc-950'
            }`}
          >
            All Shoes
          </button>
          <button
            onClick={() => onNavigate('mens')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'mens' ? 'text-orange-600 font-bold border-b-2 border-orange-600' : 'hover:text-zinc-950'
            }`}
          >
            Men
          </button>
          <button
            onClick={() => onNavigate('womens')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'womens' ? 'text-orange-600 font-bold border-b-2 border-orange-600' : 'hover:text-zinc-950'
            }`}
          >
            Women
          </button>
          <button
            onClick={() => onNavigate('kids')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'kids' ? 'text-orange-600 font-bold border-b-2 border-orange-600' : 'hover:text-zinc-950'
            }`}
          >
            Kids
          </button>
          <button
            onClick={() => onNavigate('bestsellers')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'bestsellers' ? 'text-orange-600 font-bold border-b-2 border-orange-600' : 'hover:text-zinc-950'
            }`}
          >
            Bestsellers
          </button>
          <button
            onClick={() => onNavigate('track-order')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentView === 'track-order' ? 'text-orange-600 font-bold border-b-2 border-orange-600' : 'hover:text-zinc-950'
            }`}
          >
            Track Order
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AI Co-Founder Launcher */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('apna:open-ai-cofounder'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs hover:shadow transition-all cursor-pointer"
            title="Chat with APNA SHOES AI Co-Founder"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span className="hidden sm:inline">AI Co-Founder</span>
            <span className="sm:hidden text-[10px]">AI Co-Pilot</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors"
            aria-label="Search shoes"
            title="Search shoes"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Sign In or Account Dropdown */}
          {!user ? (
            <button
              onClick={() => openLoginModal(undefined, 'Sign in with your mobile number to view your orders and track shipments')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-orange-50 hover:text-orange-600 text-zinc-900 border border-zinc-200 transition-all cursor-pointer"
              title="Sign in with mobile number and OTP"
            >
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline">Sign In / OTP</span>
              <span className="sm:hidden text-[11px]">Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="px-2.5 py-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors flex items-center gap-1.5 border border-zinc-200 bg-white"
                aria-label="User Account"
              >
                <UserIcon className="w-4 h-4 text-orange-600" />
                <span className="hidden md:inline text-xs font-bold text-zinc-800 max-w-[120px] truncate">
                  {user.phone ? user.phone.replace('+91 ', '') : user.name}
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold bg-zinc-900 text-white px-1.5 py-0.5 rounded">
                    ADMIN
                  </span>
                )}
              </button>

              {accountMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-orange-600">Verified Customer</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 truncate">{user.phone || user.email}</p>
                  </div>

                  <div className="py-1 text-xs text-zinc-700">
                    <button
                      onClick={() => {
                        onNavigate('my-orders');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between"
                    >
                      <span className="font-semibold">My Orders</span>
                      <span className="text-[10px] text-zinc-400">Track shipments</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('returns');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between"
                    >
                      <span className="font-semibold">7-Day Return Requests</span>
                      <span className="text-[10px] text-orange-600 font-bold">Doorstep Pickup</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between font-bold text-zinc-900 border-t border-zinc-100"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-orange-600" />
                          Admin Dashboard
                        </span>
                        <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                          Manage
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-zinc-100 pt-1 px-3">
                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg font-semibold transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary Action: Shopping Cart Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-white font-medium text-xs shadow-sm transition-all hover:opacity-95 active:scale-95 whitespace-nowrap"
            style={{ backgroundColor: config.brandPrimaryColor || '#FF5A1F' }}
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="bg-white text-zinc-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
              {totalItemsCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-zinc-100">
            <button
              onClick={() => { onNavigate('all'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-sm text-left font-medium rounded-lg hover:bg-zinc-100"
            >
              All Shoes
            </button>
            <button
              onClick={() => { onNavigate('mens'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-sm text-left font-medium rounded-lg hover:bg-zinc-100"
            >
              Men's Collection
            </button>
            <button
              onClick={() => { onNavigate('womens'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-sm text-left font-medium rounded-lg hover:bg-zinc-100"
            >
              Women's Collection
            </button>
            <button
              onClick={() => { onNavigate('kids'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-sm text-left font-medium rounded-lg hover:bg-zinc-100"
            >
              Kids' Shoes
            </button>
            <button
              onClick={() => { onNavigate('running'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-sm text-left font-medium rounded-lg hover:bg-zinc-100"
            >
              Running & Sports
            </button>
            <button
              onClick={() => { onNavigate('bestsellers'); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-sm text-left font-medium rounded-lg hover:bg-zinc-100 text-orange-600"
            >
              ★ Bestsellers
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-1 text-sm text-zinc-600">
            <button
              onClick={() => { onNavigate('track-order'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 hover:bg-zinc-50 rounded"
            >
              Track Order (Shiprocket AWB)
            </button>
            <button
              onClick={() => { onNavigate('my-orders'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 hover:bg-zinc-50 rounded"
            >
              My Orders & Invoices
            </button>
            <button
              onClick={() => { onNavigate('returns'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 hover:bg-zinc-50 rounded"
            >
              7-Day Returns & Exchanges
            </button>
            {isAdmin && (
              <button
                onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                className="text-left py-2 px-3 font-semibold text-zinc-950 bg-orange-50 rounded flex items-center justify-between"
              >
                <span>Admin Dashboard</span>
                <span className="text-xs text-orange-600">Store Control</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 border border-zinc-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900 font-display">Search Apna Shoes</h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search sneakers, running shoes, sizes (UK 8), models..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-zinc-900 text-white font-semibold text-sm rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700">Popular Searches:</span>{' '}
              <button onClick={() => { onNavigate('all', 'Air Glide'); setSearchOpen(false); }} className="hover:text-orange-600 underline ml-2">Air Glide 01</button>,
              <button onClick={() => { onNavigate('all', 'High Top'); setSearchOpen(false); }} className="hover:text-orange-600 underline ml-2">High Top Dunks</button>,
              <button onClick={() => { onNavigate('all', 'Running'); setSearchOpen(false); }} className="hover:text-orange-600 underline ml-2">Aero Run V2</button>,
              <button onClick={() => { onNavigate('all', 'Chunky'); setSearchOpen(false); }} className="hover:text-orange-600 underline ml-2">Urban Chunky</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
