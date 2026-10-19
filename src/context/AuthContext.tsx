import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/store.js';
import { onAuthObserver, firebaseSignOut } from '../services/firebaseAuth.js';
import {
  shopifyCustomerLogin,
  shopifyCustomerRegister,
  shopifyCustomerLogout,
  fetchShopifyCustomerProfile,
  ShopifyCustomerProfile,
} from '../services/shopify.js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, role?: 'customer' | 'admin', name?: string, phone?: string) => void;
  loginWithPhone: (phone: string, name?: string, email?: string) => void;
  logout: () => void;
  loginAsDemoAdmin: () => void;
  loginAsDemoCustomer: () => void;
  loginAsDemoNewCustomer: () => void;
  isLoginModalOpen: boolean;
  loginReasonMessage: string | null;
  redirectAfterLogin: string | null;
  openLoginModal: (redirectAfter?: string, reasonMessage?: string) => void;
  closeLoginModal: () => void;
  // Shopify Customer Account Support
  shopifyCustomer: ShopifyCustomerProfile | null;
  isShopifyAuthLoading: boolean;
  loginWithShopify: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithShopify: (params: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logoutFromShopify: () => Promise<void>;
  refreshShopifyCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: () => {},
  loginWithPhone: () => {},
  logout: () => {},
  loginAsDemoAdmin: () => {},
  loginAsDemoCustomer: () => {},
  loginAsDemoNewCustomer: () => {},
  isLoginModalOpen: false,
  loginReasonMessage: null,
  redirectAfterLogin: null,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  shopifyCustomer: null,
  isShopifyAuthLoading: false,
  loginWithShopify: async () => ({ success: false }),
  registerWithShopify: async () => ({ success: false }),
  logoutFromShopify: async () => {},
  refreshShopifyCustomer: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('apna_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });

  const [shopifyCustomer, setShopifyCustomer] = useState<ShopifyCustomerProfile | null>(null);
  const [isShopifyAuthLoading, setIsShopifyAuthLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReasonMessage, setLoginReasonMessage] = useState<string | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('apna_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apna_user');
    }
  }, [user]);

  // Synchronize with Firebase Auth state
  useEffect(() => {
    const unsub = onAuthObserver((firebaseUser) => {
      if (firebaseUser && firebaseUser.phoneNumber) {
        const clean = firebaseUser.phoneNumber.replace(/\D/g, '');
        setUser((prev) => {
          if (prev && (prev.phone === firebaseUser.phoneNumber || prev.id === firebaseUser.uid)) {
            return prev;
          }
          return {
            id: firebaseUser.uid,
            phone: firebaseUser.phoneNumber || '',
            name: firebaseUser.displayName || prev?.name || `Customer (${clean.slice(-4) || 'Shopper'})`,
            email: firebaseUser.email || prev?.email || `${clean}@apnashoes.in`,
            role: 'customer',
          };
        });
      }
    });
    return () => unsub();
  }, []);

  // Restore Shopify Customer Session on mount
  useEffect(() => {
    const token = localStorage.getItem('shopify_customer_token');
    if (token) {
      setIsShopifyAuthLoading(true);
      fetchShopifyCustomerProfile(token)
        .then((profile) => {
          if (profile) {
            setShopifyCustomer(profile);
            setUser({
              id: profile.id,
              name: profile.displayName || `${profile.firstName} ${profile.lastName}`.trim(),
              email: profile.email,
              phone: profile.phone || '',
              role: 'customer',
            });
          } else {
            localStorage.removeItem('shopify_customer_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('shopify_customer_token');
        })
        .finally(() => setIsShopifyAuthLoading(false));
    }
  }, []);

  const openLoginModal = (redirectAfter?: string, reasonMessage?: string) => {
    setRedirectAfterLogin(redirectAfter || null);
    setLoginReasonMessage(reasonMessage || null);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginReasonMessage(null);
  };

  const loginWithShopify = async (email: string, password: string) => {
    setIsShopifyAuthLoading(true);
    try {
      const { accessToken } = await shopifyCustomerLogin(email, password);
      localStorage.setItem('shopify_customer_token', accessToken);
      const profile = await fetchShopifyCustomerProfile(accessToken);
      if (profile) {
        setShopifyCustomer(profile);
        setUser({
          id: profile.id,
          name: profile.displayName || `${profile.firstName} ${profile.lastName}`.trim(),
          email: profile.email,
          phone: profile.phone || '',
          role: 'customer',
        });
      }
      closeLoginModal();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Shopify customer login failed' };
    } finally {
      setIsShopifyAuthLoading(false);
    }
  };

  const registerWithShopify = async (params: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setIsShopifyAuthLoading(true);
    try {
      await shopifyCustomerRegister(params);
      return await loginWithShopify(params.email, params.password);
    } catch (err: any) {
      setIsShopifyAuthLoading(false);
      return { success: false, error: err.message || 'Shopify customer registration failed' };
    }
  };

  const logoutFromShopify = async () => {
    const token = localStorage.getItem('shopify_customer_token');
    if (token) {
      await shopifyCustomerLogout(token).catch(() => {});
      localStorage.removeItem('shopify_customer_token');
    }
    setShopifyCustomer(null);
    logout();
  };

  const refreshShopifyCustomer = async () => {
    const token = localStorage.getItem('shopify_customer_token');
    if (token) {
      const profile = await fetchShopifyCustomerProfile(token);
      if (profile) setShopifyCustomer(profile);
    }
  };

  const loginWithPhone = (phone: string, name?: string, email?: string) => {
    const cleanDigits = phone.replace(/\D/g, '');
    const newUser: User = {
      id: `usr-${cleanDigits || Date.now()}`,
      phone,
      name: name?.trim() || `Customer (${cleanDigits.slice(-4) || 'Shopper'})`,
      email: email?.trim() || `${cleanDigits}@apnashoes.in`,
      role: 'customer',
    };
    setUser(newUser);
    closeLoginModal();
  };

  const login = (email: string, role: 'customer' | 'admin' = 'customer', name?: string, phone?: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      name: name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
      phone: phone || '+91 98765 43210',
      role,
    };
    setUser(newUser);
    closeLoginModal();
  };

  const loginAsDemoAdmin = () => {
    const adminUser: User = {
      id: 'usr-admin-1',
      name: 'Super Admin',
      email: 'admin@apnashoes.in',
      phone: '+91 98765 00000',
      role: 'admin',
    };
    setUser(adminUser);
    closeLoginModal();
  };

  const loginAsDemoCustomer = () => {
    const customerUser: User = {
      id: 'usr-customer-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98112 34567',
      role: 'customer',
    };
    setUser(customerUser);
    closeLoginModal();
  };

  const loginAsDemoNewCustomer = () => {
    const newCustomerUser: User = {
      id: 'usr-new-customer',
      name: 'Aman Verma',
      email: 'aman.verma@example.com',
      phone: '+91 98999 11223',
      role: 'customer',
    };
    setUser(newCustomerUser);
    closeLoginModal();
  };

  const logout = () => {
    firebaseSignOut().catch(() => {});
    localStorage.removeItem('shopify_customer_token');
    setShopifyCustomer(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        loginWithPhone,
        logout,
        loginAsDemoAdmin,
        loginAsDemoCustomer,
        loginAsDemoNewCustomer,
        isLoginModalOpen,
        loginReasonMessage,
        redirectAfterLogin,
        openLoginModal,
        closeLoginModal,
        shopifyCustomer,
        isShopifyAuthLoading,
        loginWithShopify,
        registerWithShopify,
        logoutFromShopify,
        refreshShopifyCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
