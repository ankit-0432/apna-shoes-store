import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/store.js';
import { onAuthObserver, firebaseSignOut } from '../services/firebaseAuth.js';

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
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('apna_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // If not stored in localStorage, start as guest (no default orders leaked)
    return null;
  });

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

  const openLoginModal = (redirectAfter?: string, reasonMessage?: string) => {
    setRedirectAfterLogin(redirectAfter || null);
    setLoginReasonMessage(reasonMessage || null);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginReasonMessage(null);
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

  // Demo user Rahul Sharma with existing sample orders
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

  // Brand-new demo user with 0 orders for testing zero-state
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
