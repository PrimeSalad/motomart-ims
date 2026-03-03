/*
 * Carbon & Crimson IMS
 * File: src/lib/api_client.js
 * Version: 1.0.0
 * Purpose: Axios client with auth header.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function createApiClient({ token }) {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000
  });

  client.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}
