/*
 * Carbon & Crimson IMS
 * File: vite.config.js
 * Version: 1.0.0
 * Purpose: Vite config.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
});
