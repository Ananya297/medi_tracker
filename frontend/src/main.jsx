// -----------------------------------------------------------------------------
// Module Imports
// Import React, ReactDOM, TanStack React Query, AuthProvider, and App
// -----------------------------------------------------------------------------
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// -----------------------------------------------------------------------------
// TanStack Query Client Initialization
// -----------------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// -----------------------------------------------------------------------------
// Application Root Mounting
// Wraps application with QueryClientProvider and AuthProvider
// -----------------------------------------------------------------------------
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
