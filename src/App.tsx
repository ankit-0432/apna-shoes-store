import React, { useState, useEffect } from 'react';
import { StoreConfigProvider, useStoreConfig } from './context/StoreConfigContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider, useCart } from './context/CartContext.js';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { CartDrawer } from './components/common/CartDrawer.js';
import { HomePage } from './pages/HomePage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { TrackOrderPage } from './pages/TrackOrderPage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { ReturnsPage } from './pages/ReturnsPage.js';
import { PoliciesPage } from './pages/PoliciesPage.js';
import { AdminPortal } from './pages/admin/AdminPortal.js';
import { AdminSecretModal } from './components/common/AdminSecretModal.js';
import { MobileOtpModal } from './components/common/MobileOtpModal.js';
import { api } from './services/api.js';
import './services/firebase.js';
import { subscribeToLiveProducts, seedProductsToFirestoreIfEmpty } from './services/firebaseSync.js';
import { Product, Order } from './types/store.js';

function MainApp() {
  const { config } = useStoreConfig();
  const { toastMessage } = useCart();
  const { user, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminSecretModal, setShowAdminSecretModal] = useState(false);

  // Stealth Hotkey (Ctrl+Shift+A or Cmd+Shift+A) or #admin in URL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdminSecretModal(true);
      }
    };

    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setShowAdminSecretModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHash);
    if (window.location.hash === '#admin') {
      setShowAdminSecretModal(true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Load catalog on mount & seed Firestore
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
        if (data.length > 0 && !selectedProduct) {
          setSelectedProduct(data[0]);
        }
        // Seed initial products to Firestore if empty
        seedProductsToFirestoreIfEmpty(data).catch(() => {});
      } catch (err) {
        console.error('Failed to load initial catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // Real-time Firestore stream listener for live product changes
  useEffect(() => {
    const unsub = subscribeToLiveProducts((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
    });
    return () => unsub();
  }, []);

  // Listen to instantaneous client-side product updates
  useEffect(() => {
    const handleProductSaved = (e: any) => {
      const saved = e.detail as Product;
      if (!saved || !saved.id) return;
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [saved, ...prev];
      });
    };

    const handleProductDeleted = (e: any) => {
      const id = e.detail as string;
      if (!id) return;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    window.addEventListener('apna:product-saved', handleProductSaved);
    window.addEventListener('apna:product-deleted', handleProductDeleted);
    return () => {
      window.removeEventListener('apna:product-saved', handleProductSaved);
      window.removeEventListener('apna:product-deleted', handleProductDeleted);
    };
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setViewParam(param);

    if (view === 'secret-admin') {
      setShowAdminSecretModal(true);
      return;
    }

    if (view === 'about' || view === 'contact' || view === 'faq' || view === 'shipping-policy' || view === 'return-policy' || view === 'privacy-policy' || view === 'terms') {
      const tabMap: Record<string, any> = {
        about: 'about',
        contact: 'contact',
        faq: 'faq',
        'shipping-policy': 'shipping',
        'return-policy': 'return',
        'privacy-policy': 'privacy',
        terms: 'terms',
      };
      setViewParam(tabMap[view] || 'about');
      setCurrentView('policies');
      return;
    }

    setCurrentView(view);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView('product-detail');
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView('order-confirmation');
  };

  // If in admin view, render AdminPortal with live product callbacks
  if (currentView === 'admin') {
    return (
      <AdminPortal
        onNavigateHome={() => setCurrentView('home')}
        onProductUpdated={(saved) => {
          setProducts((prev) => {
            const idx = prev.findIndex((p) => p.id === saved.id);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = saved;
              return copy;
            }
            return [saved, ...prev];
          });
        }}
        onProductDeleted={(deletedId) => {
          setProducts((prev) => prev.filter((p) => p.id !== deletedId));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-zinc-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header onNavigate={handleNavigate} currentView={currentView} />

      {/* Main View Container */}
      <div className="flex-1">
        {loading ? (
          <div className="py-24 text-center text-xs text-zinc-400">
            Connecting to APNA SHOES store catalog...
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                products={products}
                onSelectProduct={handleSelectProduct}
                onNavigate={handleNavigate}
              />
            )}

            {(currentView === 'all' ||
              currentView === 'mens' ||
              currentView === 'womens' ||
              currentView === 'kids' ||
              currentView === 'running' ||
              currentView === 'bestsellers' ||
              currentView === 'sale') && (
              <CatalogPage
                products={products}
                currentCategory={currentView}
                searchQuery={viewParam || ''}
                onSelectProduct={handleSelectProduct}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'product-detail' && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                allProducts={products}
                onSelectProduct={handleSelectProduct}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'checkout' && (
              <CheckoutPage
                onOrderSuccess={handleOrderSuccess}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'order-confirmation' && confirmedOrder && (
              <OrderConfirmationPage
                order={confirmedOrder}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'track-order' && (
              <TrackOrderPage
                initialOrderNumber={viewParam}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'my-orders' && (
              <OrdersPage onNavigate={handleNavigate} />
            )}

            {currentView === 'returns' && (
              <ReturnsPage onNavigate={handleNavigate} />
            )}

            {currentView === 'policies' && (
              <PoliciesPage initialTab={(viewParam as any) || 'about'} />
            )}
          </>
        )}
      </div>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onCheckout={() => {
          if (!user) {
            openLoginModal('checkout', 'Please enter your mobile number and OTP to proceed with checkout');
          } else {
            handleNavigate('checkout');
          }
        }}
        onNavigate={handleNavigate}
      />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile OTP Authentication Modal */}
      <MobileOtpModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSuccess={(target) => {
          if (target) handleNavigate(target);
        }}
      />

      {/* Stealth Staff & Admin Gateway Modal */}
      <AdminSecretModal
        isOpen={showAdminSecretModal}
        onClose={() => setShowAdminSecretModal(false)}
        onSuccess={() => {
          handleNavigate('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreConfigProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </StoreConfigProvider>
  );
}
