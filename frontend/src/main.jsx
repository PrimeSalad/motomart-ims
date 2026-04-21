/*
 * MotoMart IMS
 * File: src/main.jsx
 * Version: 1.0.1
 * Purpose: React entry (Router + QueryClient).
 * Notes:
 * - Added React Router v7 future flags
 * - Removes deprecation warnings
 */


import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import './styles/index.css';
import { App } from './routes/app';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </BrowserRouter>

    </QueryClientProvider>
  </React.StrictMode>
);