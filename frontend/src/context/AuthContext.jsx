// -----------------------------------------------------------------------------
// Module Imports
// Import React context utilities and state management hooks
// -----------------------------------------------------------------------------
import React, { createContext, useContext, useState, useEffect } from 'react';

// -----------------------------------------------------------------------------
// Context Initialization
// -----------------------------------------------------------------------------
const AuthContext = createContext(null);

const STORAGE_KEY = 'medtracker_user';

// -----------------------------------------------------------------------------
// Component: AuthProvider
// Manages patient session state and syncs with browser localStorage
// -----------------------------------------------------------------------------
export function AuthProvider({ children }) {
  // Load saved user session on mount
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to parse saved user from storage:', e);
      return null;
    }
  });

  // Sync user state changes to storage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }, [user]);

  // Login handler
  const login = (userData) => {
    setUser(userData);
  };

  // Logout handler
  const logout = () => {
    setUser(null);
  };

  // Update profile attributes in place
  const updateProfile = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : patch));
  };

  const value = {
    user,
    isAuthenticated: !!user?.id,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// Hook: useAuth
// Custom hook to consume authentication state and actions
// -----------------------------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
