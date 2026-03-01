/*
 * MotoMart IMS
 * File: src/views/dashboard_page.jsx
 * Version: 1.1.1
 * Purpose: Dashboard page wrapper (renders the main Dashboard widget).
 *
 * Notes:
 * - This file intentionally stays small to avoid routing-level crashes.
 */

import React from 'react';
import { Dashboard } from '../widgets/dashboard';

export function DashboardPage() {
  return <Dashboard />;
}
