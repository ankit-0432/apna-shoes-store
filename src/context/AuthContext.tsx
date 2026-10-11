import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/store.js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, role?: 'customer' | 'admin', name?: string, phone?: string) => void;
  logout: () => void;
  loginAsDemoAdmin: () => void;
  loginAsDemoCustomer: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  loginAsDemoAdmin: () => {},
  loginAsDemoCustomer: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('apna_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    // Default to a friendly customer session so the user starts browsing seamlessly
    return {
      id: 'usr-customer-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98112 34567',
      role: 'customer',
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('apna_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apna_user');
    }
  }, [user]);

  const login = (email: string, role: 'customer' | 'admin' = 'customer', name?: string, phone?: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      name: name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
      phone: phone || '+91 98765 43210',
      role,
    };
    setUser(newUser);
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
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        loginAsDemoAdmin,
        loginAsDemoCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
