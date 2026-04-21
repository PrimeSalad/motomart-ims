/*
 * MotoMart IMS
 * File: tailwind.config.js
 * Version: 1.0.0
 * Purpose: Tailwind tokens for MotoMart theme.
 */

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#0a0a0a',
        primary: '#dc2626'
      },
      boxShadow: {
        redline: '0 0 0 1px rgba(220,38,38,0.65), 0 0 30px rgba(220,38,38,0.18)'
      }
    }
  },
  plugins: []
};
