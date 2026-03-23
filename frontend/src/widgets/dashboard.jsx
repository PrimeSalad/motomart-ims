/*
 * File: src/widgets/dashboard.jsx
 * Description: Minimalist React dashboard using Poppins and Questrial typography.
 * Version: 2.0.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive,
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronDown,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  LogOut,
  Moon,
  Plus,
  QrCode,
  Search,
  Shield,
  ShoppingCart,
  Sun,
  Trash2,
  Undo2,
  User,
  Wrench
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import QRCode from 'qrcode';

import { useAuth } from '../state/auth_context';
import { useInventory } from '../hooks/use_inventory';
import { useSystem } from '../hooks/use_system';
import { formatPhp } from '../lib/format';
import { exportDashboardPdf } from '../lib/pdf_export';

const FONT_STYLE_ID = 'dashboard-google-fonts-minimal-v2';
const FONT_PRECONNECT_ONE_ID = 'dashboard-google-fonts-preconnect-1';
const FONT_PRECONNECT_TWO_ID = 'dashboard-google-fonts-preconnect-2';

// Theme-aware classes - MASTERPIECE EDITION
const getThemeClasses = (isDark) => ({
  LAYOUT_CONTAINER: isDark 
    ? 'min-h-screen bg-stone-950 text-stone-100' 
    : 'min-h-screen bg-red-50 text-stone-900',
  PAGE_WRAPPER: 'max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8',
  CARD: isDark
    ? 'rounded-3xl border border-red-900/30 bg-stone-900'
    : 'rounded-3xl border border-red-100 bg-white',
  INPUT: isDark
    ? 'w-full rounded-2xl border border-red-900/40 bg-stone-800 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-900/40 placeholder:text-stone-500'
    : 'w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 placeholder:text-stone-400',
  BUTTON_BASE: 'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60',
  BUTTON_PRIMARY: isDark
    ? 'bg-red-700 text-white hover:bg-red-600'
    : 'bg-red-600 text-white hover:bg-red-700',
  BUTTON_SECONDARY: isDark
    ? 'border border-red-900/40 bg-stone-800 text-stone-100 hover:bg-stone-700 hover:border-red-800/60'
    : 'border border-red-200 bg-white text-stone-800 hover:bg-red-50 hover:border-red-300',
  BUTTON_DANGER: isDark
    ? 'bg-red-800 text-white hover:bg-red-700'
    : 'bg-red-700 text-white hover:bg-red-800',
  CHIP: isDark
    ? 'inline-flex items-center gap-2 rounded-full border border-red-900/40 bg-stone-800 px-3 py-1.5 text-xs text-stone-300'
    : 'inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-900',
  TABLE_HEADER: isDark
    ? 'text-[11px] font-medium uppercase tracking-[0.18em] text-red-400/80'
    : 'text-[11px] font-medium uppercase tracking-[0.18em] text-red-700/80',
  SECTION_LABEL: isDark
    ? 'text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400'
    : 'text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600',
  SECTION_TITLE: isDark
    ? 'mt-1 text-xl font-semibold text-stone-100'
    : 'mt-1 text-xl font-semibold text-stone-900',
  TEXT_PRIMARY: isDark ? 'text-stone-100' : 'text-stone-900',
  TEXT_SECONDARY: isDark ? 'text-stone-400' : 'text-stone-600',
  TEXT_TERTIARY: isDark ? 'text-stone-500' : 'text-stone-700',
  BORDER: isDark ? 'border-red-900/30' : 'border-red-100',
  BG_SECONDARY: isDark ? 'bg-stone-800' : 'bg-red-50',
  BG_TERTIARY: isDark ? 'bg-stone-700' : 'bg-red-100',
});

function appendLinkTag({ id, rel, href, crossOrigin }) {
  if (document.getElementById(id)) {
    return;
  }

  const linkElement = document.createElement('link');
  linkElement.id = id;
  linkElement.rel = rel;
  linkElement.href = href;

  if (crossOrigin) {
    linkElement.crossOrigin = crossOrigin;
  }

  document.head.appendChild(linkElement);
}

function useDashboardFonts() {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    appendLinkTag({
      id: FONT_PRECONNECT_ONE_ID,
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    });

    appendLinkTag({
      id: FONT_PRECONNECT_TWO_ID,
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous'
    });

    appendLinkTag({
      id: FONT_STYLE_ID,
      rel: 'stylesheet',
      href:
        'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Questrial&display=swap'
    });
  }, []);
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function SectionHeading({ label, title, action, theme }) {
  const classes = getThemeClasses(theme === 'dark');
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className={classes.SECTION_LABEL}>{label}</div>
        <h2 className={classes.SECTION_TITLE}>{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function ActionButton({
  children,
  className = '',
  variant = 'secondary',
  type = 'button',
  theme,
  ...props
}) {
  const classes = getThemeClasses(theme === 'dark');
  const baseClass = classes.BUTTON_BASE;
  const variantClassName =
    variant === 'primary'
      ? classes.BUTTON_PRIMARY
      : variant === 'danger'
        ? classes.BUTTON_DANGER
        : classes.BUTTON_SECONDARY;

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.08 }}
      type={type}
      className={classNames(baseClass, variantClassName, className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function Card({ children, className = '', theme }) {
  const classes = getThemeClasses(theme === 'dark');
  return <div className={classNames(classes.CARD, 'p-5 sm:p-6', className)}>{children}</div>;
}

function MetricCard({ icon: Icon, label, value, helper, theme }) {
  const classes = getThemeClasses(theme === 'dark');
  const isDark = theme === 'dark';
  return (
    <Card theme={theme}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={classNames('text-sm font-medium', classes.TEXT_SECONDARY)}>{label}</div>
          <div className={classNames('mt-2 text-3xl font-bold tracking-tight', isDark ? 'text-red-400' : 'text-red-700')}>{value}</div>
          {helper ? <div className={classNames('mt-2 text-sm', classes.TEXT_SECONDARY)}>{helper}</div> : null}
        </div>
        <div className={classNames('rounded-2xl border p-3', isDark ? 'border-red-900/40 bg-stone-800' : 'border-red-200 bg-red-50')}>
          <Icon className={classNames('h-5 w-5', isDark ? 'text-red-400' : 'text-red-600')} />
        </div>
      </div>
    </Card>
  );
}

function Modal({ open, title, children, onClose, theme }) {
  const classes = getThemeClasses(theme === 'dark');
  const isDark = theme === 'dark';
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={classNames('absolute inset-0 backdrop-blur-sm', isDark ? 'bg-black/60' : 'bg-stone-950/40')} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={classNames('relative w-full max-w-2xl rounded-3xl border p-5 shadow-2xl sm:p-6', classes.CARD)}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div className="flex items-center justify-between gap-4">
              <h3
                className={classNames('text-xl font-semibold', classes.TEXT_PRIMARY)}
                style={{ fontFamily: "'Questrial', sans-serif" }}
              >
                {title}
              </h3>
              <ActionButton onClick={onClose} theme={theme}>Close</ActionButton>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function InventoryRow({ children, isLowStock = false, theme }) {
  const isDark = theme === 'dark';
  return (
    <div
      className={classNames(
        'grid grid-cols-12 gap-4 rounded-2xl border px-4 py-4 transition-all duration-200',
        isLowStock
          ? isDark
            ? 'border-red-900/50 bg-red-950/40 hover:bg-red-950/60'
            : 'border-red-300 bg-red-100 hover:bg-red-200'
          : isDark
            ? 'border-red-900/30 bg-stone-900 hover:bg-stone-800'
            : 'border-red-100 bg-white hover:bg-red-50'
      )}
    >
      {children}
    </div>
  );
}

function getFriendlyLogMessage(log) {
  const { action, resource, details } = log;
  let parsedDetails = {};
  try {
    parsedDetails = typeof details === 'string' ? JSON.parse(details) : (details || {});
  } catch (e) {
    parsedDetails = {};
  }

  const body = parsedDetails.body || {};
  const params = parsedDetails.params || {};

  // Inventory Routes
  if (resource.includes('/api/inventory')) {
    if (action === 'POST') return `Created new part: ${body.name || body.sku || 'Unknown'}`;
    if (resource.includes('/archive')) return `Archived part: ${body.sku || params.id || ''}`;
    if (resource.includes('/restore')) return `Restored part: ${body.sku || params.id || ''}`;
    if (resource.includes('/stock')) {
      const dir = body.direction === 'IN' ? 'Added' : body.direction === 'SALE' ? 'Sold' : 'Removed';
      return `${dir} ${body.quantity || ''} units for part ID: ${params.id || ''}`;
    }
    if (resource.includes('/permanent')) return `Permanently deleted part ID: ${params.id || ''}`;
    if (action === 'PUT' || action === 'PATCH') return `Updated part details: ${body.name || params.id || ''}`;
  }

  // User Routes
  if (resource.includes('/api/users')) {
    if (resource.includes('/status')) return `${body.is_active ? 'Activated' : 'Deactivated'} user account`;
    if (resource.includes('/profile')) return `Updated personal profile`;
    if (action === 'POST') return `Created new user: ${body.full_name || body.email || ''}`;
    if (action === 'DELETE') return `Deleted user account`;
    if (action === 'PATCH') return `Updated user details`;
  }

  // Auth Routes
  if (resource.includes('/api/auth')) {
    if (resource.includes('/login')) return `Logged into the system`;
    if (resource.includes('/change-password')) return `Changed account password`;
    if (resource.includes('/forgot-password')) return `Requested password reset`;
  }

  // Fallback
  return `${action} request to ${resource}`;
}

function getInventoryLogDetails(log) {
  const { action, quantity, note, inventory_items } = log;
  const partName = inventory_items?.name || 'Unknown Part';
  const sku = inventory_items?.sku || 'N/A';
  
  let message = '';
  let colorClass = 'text-stone-400';

  switch (action) {
    case 'CREATE':
      message = `Created new part entry`;
      colorClass = 'text-green-500';
      break;
    case 'STOCK_MOVE':
      const isAdd = (note || '').toLowerCase().includes('in') || (note || '').toLowerCase().includes('add');
      message = `${isAdd ? 'Added' : 'Removed'} ${quantity} units`;
      colorClass = isAdd ? 'text-blue-400' : 'text-amber-400';
      break;
    case 'SALE':
      message = `Sold ${quantity} units`;
      colorClass = 'text-green-400';
      break;
    case 'ARCHIVE':
      message = `Archived part`;
      colorClass = 'text-amber-500';
      break;
    case 'RESTORE':
      message = `Restored part from archive`;
      colorClass = 'text-indigo-400';
      break;
    case 'DELETE':
      message = `Permanently deleted part`;
      colorClass = 'text-red-500';
      break;
    default:
      message = `${action} action performed`;
  }

  return { message, partName, sku, colorClass };
}

export function Dashboard() {
  useDashboardFonts();

  const { user, logout } = useAuth();

  const [theme, setTheme] = useState('dark'); // Default to dark mode
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [quickExportOpen, setQuickExportOpen] = useState(false);
  const [inventoryExportOpen, setInventoryExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inventoryLogsOpen, setInventoryLogsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('team'); // 'team' or 'logs'
  const [selectedLogUserId, setSelectedLogUserId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const [compatMake, setCompatMake] = useState('');
  const [compatModel, setCompatModel] = useState('');
  const [compatYear, setCompatYear] = useState('');
  const [qrSku, setQrSku] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const {
    inventory,
    inventoryLoading,
    analytics,
    analyticsLoading,
    createItem,
    moveStock,
    archiveItem,
    restoreItem,
    deletePermanently,
    compatSearch
  } = useInventory({ search, category, status });

  // Inventory Log Filters
  const [invLogActor, setInvLogActor] = useState('');
  const [invLogAction, setInvLogAction] = useState('');
  const [invLogDateRange, setInvLogDateRange] = useState('7d'); // 24h, 7d, 30d, all
  const [invLogSort, setInvLogSort] = useState('desc');

  const invFilters = useMemo(() => {
    const filters = {
      actorId: invLogActor,
      action: invLogAction,
      sort: invLogSort
    };

    if (invLogDateRange !== 'all') {
      const now = new Date();
      if (invLogDateRange === '24h') now.setHours(now.getHours() - 24);
      else if (invLogDateRange === '7d') now.setDate(now.getDate() - 7);
      else if (invLogDateRange === '30d') now.setDate(now.getDate() - 30);
      filters.startDate = now.toISOString();
    }

    return filters;
  }, [invLogActor, invLogAction, invLogDateRange, invLogSort]);

  const {
    users,
    usersLoading,
    logs,
    logsLoading,
    inventoryLogs,
    inventoryLogsLoading,
    createUser,
    toggleUserStatus,
    deleteUser,
    updateProfile,
    canManage,
    canViewInvLogs
  } = useSystem({ logUserId: selectedLogUserId, invFilters });

  const inventoryList = Array.isArray(inventory) ? inventory : [];

  const categoryOptions = useMemo(() => {
    const defaultCategoryList = [
      'Accessories',
      'Brakes',
      'Electrical',
      'Engine',
      'Gear',
      'Helmet',
      'Oil & Fluids',
      'Tires'
    ];

    const inventoryCategoryList = inventoryList
      .map((item) => String(item.category || '').trim())
      .filter(Boolean);

    return Array.from(new Set([...defaultCategoryList, ...inventoryCategoryList])).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [inventoryList]);

  const totalItemsCount = Number(analytics?.totals?.items ?? 0);
  const totalOnHandCount = Number(analytics?.totals?.onHand ?? 0);
  const lowStockCount = Number(analytics?.lowStock?.length ?? 0);

  const revenueTotal = useMemo(() => {
    const topSellingList = Array.isArray(analytics?.topSelling) ? analytics.topSelling : [];
    return topSellingList.reduce((sum, item) => sum + Number(item.revenue_php || 0), 0);
  }, [analytics]);

  const todaySales = analytics?.todaySales || {
    date: new Date().toISOString().slice(0, 10),
    units: 0,
    revenue_php: 0,
    items: []
  };

  const todaySalesUnits = Number(todaySales.units || 0);
  const todaySalesRevenue = Number(todaySales.revenue_php || 0);
  const todaySalesItems = Array.isArray(todaySales.items) ? todaySales.items : [];

  const compatBike = compatSearch.data?.bike || null;
  const compatSuggestions = Array.isArray(compatSearch.data?.suggestions)
    ? compatSearch.data.suggestions
    : [];

  async function handleCreateItem(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload = {
      sku: String(formData.get('sku') || '').trim(),
      name: String(formData.get('name') || '').trim(),
      category: String(formData.get('category') || '').trim(),
      bin_location: String(formData.get('bin_location') || '').trim(),
      price_php: Number(formData.get('price_php') || 0),
      cost_php: Number(formData.get('cost_php') || 0),
      quantity_on_hand: Number(formData.get('quantity_on_hand') || 0),
      low_stock_threshold: Number(formData.get('low_stock_threshold') || 5),
      compatibility: []
    };

    await createItem.mutateAsync(payload);
    setCreateOpen(false);
    event.currentTarget.reset();
  }

  async function handleCompatibilitySubmit(event) {
    event.preventDefault();

    await compatSearch.mutateAsync({
      make: compatMake,
      model: compatModel,
      year: compatYear ? Number(compatYear) : undefined
    });
  }

  async function generateQrCode() {
    const normalizedSku = String(qrSku || '').trim();

    if (!normalizedSku) {
      return;
    }

    const dataUrl = await QRCode.toDataURL(normalizedSku, {
      margin: 1,
      width: 220
    });

    setQrDataUrl(dataUrl);
  }

  async function handleMoveStock({ id, direction }) {
    const quantityText = window.prompt(`Enter quantity to ${direction}:`);

    if (!quantityText) {
      return;
    }

    const quantityValue = Number(quantityText);

    if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
      window.alert('Quantity must be a positive whole number.');
      return;
    }

    const note = direction === 'SALE' ? 'sale' : 'warehouse move';

    await moveStock.mutateAsync({
      id,
      direction,
      quantity: quantityValue,
      note
    });
  }

  async function handleExportPdf() {
    try {
      await exportDashboardPdf({
        user,
        analytics,
        inventory: inventoryList
      });
    } catch (error) {
      console.error(error);
      window.alert('PDF export failed. Please try again.');
    }
  }

  function handleExportExcel() {
    try {
      // Create professional CSV with better formatting
      const timestamp = new Date().toLocaleString();
      const headers = [
        '=== MOTOMART INVENTORY REPORT ===',
        `Generated: ${timestamp}`,
        `User: ${user?.email || 'N/A'}`,
        `Total Parts: ${totalItemsCount} | Total Stock: ${totalOnHandCount} | Low Stock: ${lowStockCount}`,
        '',
        'SKU,Name,Category,Bin Location,Quantity,Threshold,Price (PHP),Cost (PHP),Status,Stock Level'
      ];

      const rows = inventoryList.map(item => {
        const qty = Number(item.quantity_on_hand || 0);
        const threshold = Number(item.low_stock_threshold || 0);
        const stockLevel = qty <= threshold ? 'LOW STOCK' : 'OK';
        
        return [
          item.sku,
          item.name,
          item.category,
          item.bin_location,
          qty,
          threshold,
          item.price_php,
          item.cost_php,
          item.status,
          stockLevel
        ].map(cell => `"${cell}"`).join(',');
      });

      const csvContent = [...headers, ...rows].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `MotoMart-Inventory-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      window.alert('Excel export failed. Please try again.');
    }
  }

  function handleExportWord() {
    try {
      // Create beautiful HTML content for Word
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>MotoMart Inventory Report</title>
          <style>
            @page { margin: 1in; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0;
              padding: 0;
              color: #1c1917;
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              color: white;
              padding: 30px;
              margin-bottom: 30px;
              border-radius: 8px;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 2px;
            }
            .header p {
              margin: 5px 0;
              opacity: 0.9;
              font-size: 14px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .stat-card {
              background: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 20px;
              border-radius: 8px;
            }
            .stat-card h3 {
              margin: 0 0 5px 0;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #991b1b;
              font-weight: 600;
            }
            .stat-card .value {
              font-size: 28px;
              font-weight: 700;
              color: #dc2626;
              margin: 5px 0;
            }
            .stat-card .label {
              font-size: 13px;
              color: #78716c;
            }
            h2 {
              color: #dc2626;
              font-size: 20px;
              margin: 40px 0 20px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #dc2626;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            th {
              background: #dc2626;
              color: white;
              padding: 14px 12px;
              text-align: left;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
            }
            td {
              border: 1px solid #e7e5e4;
              padding: 12px;
              font-size: 13px;
            }
            tr:nth-child(even) {
              background-color: #fafaf9;
            }
            tr:hover {
              background-color: #fef2f2;
            }
            .low-stock {
              background-color: #fef2f2 !important;
            }
            .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .badge-low {
              background: #fee2e2;
              color: #991b1b;
            }
            .badge-ok {
              background: #e7e5e4;
              color: #57534e;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e7e5e4;
              text-align: center;
              color: #78716c;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏍️ MOTOMART</h1>
            <p><strong>Inventory Management System</strong></p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>User: ${user?.email || 'N/A'}</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Parts</h3>
              <div class="value">${totalItemsCount}</div>
              <div class="label">Tracked items</div>
            </div>
            <div class="stat-card">
              <h3>Total Stock</h3>
              <div class="value">${totalOnHandCount}</div>
              <div class="label">Units on hand</div>
            </div>
            <div class="stat-card">
              <h3>Low Stock</h3>
              <div class="value">${lowStockCount}</div>
              <div class="label">Items need attention</div>
            </div>
          </div>

          <h2>📦 Inventory Details</h2>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Bin</th>
                <th>Qty</th>
                <th>Threshold</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${inventoryList.map(item => {
                const qty = Number(item.quantity_on_hand || 0);
                const threshold = Number(item.low_stock_threshold || 0);
                const isLow = qty <= threshold;
                return `
                <tr class="${isLow ? 'low-stock' : ''}">
                  <td><strong>${item.sku}</strong></td>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.bin_location}</td>
                  <td><strong>${qty}</strong> / ${threshold}</td>
                  <td>${threshold}</td>
                  <td>${formatPhp(item.price_php)}</td>
                  <td>${formatPhp(item.cost_php)}</td>
                  <td><span class="badge ${isLow ? 'badge-low' : 'badge-ok'}">${isLow ? '⚠️ Low' : '✓ OK'}</span></td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Developed by DotOrbit</strong></p>
            <p>MotoMart Inventory Management System © ${new Date().getFullYear()}</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `MotoMart-Inventory-${new Date().toISOString().split('T')[0]}.doc`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      window.alert('Word export failed. Please try again.');
    }
  }

  function handleMockScan() {
    const skuValue = window.prompt('Mock scan: paste SKU here (example: IMS-ABC123)');

    if (!skuValue) {
      return;
    }

    setSearch(String(skuValue).trim());
  }

  const classes = getThemeClasses(theme === 'dark');
  const isDark = theme === 'dark';

  return (
    <div
      className={classes.LAYOUT_CONTAINER}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className={classes.PAGE_WRAPPER}>
        <nav className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={classNames('flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border', classes.BORDER)}>
                <img
                  src="/img/logo.jpg"
                  alt="MotoMart Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h1
                  className={classNames('text-2xl font-bold tracking-tight', isDark ? 'text-red-400' : 'text-red-700')}
                  style={{ fontFamily: "'Questrial', sans-serif" }}
                >
                  MOTOMART
                </h1>
                <div className={classNames('text-xs', classes.TEXT_SECONDARY)}>
                  Inventory Dashboard
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ActionButton variant="primary" onClick={() => setCreateOpen(true)} theme={theme}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Part</span>
              </ActionButton>

              <ActionButton onClick={handleMockScan} theme={theme}>
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">Scan</span>
              </ActionButton>

              <ActionButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} theme={theme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </ActionButton>

              <div className="relative user-menu-container">
                <ActionButton onClick={() => setUserMenuOpen(!userMenuOpen)} theme={theme}>
                  <User className="h-4 w-4" />
                  <ChevronDown className={classNames('h-4 w-4 transition-transform', userMenuOpen && 'rotate-180')} />
                </ActionButton>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className={classNames(
                        'absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border p-2 shadow-xl',
                        classes.CARD
                      )}
                    >
                      <button
                        onClick={() => {
                          setInventoryLogsOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors',
                          isDark ? 'hover:bg-stone-800' : 'hover:bg-red-50',
                          classes.TEXT_PRIMARY
                        )}
                      >
                        <Activity className="h-4 w-4" />
                        Inventory Logs
                      </button>

                      {canManage && (
                        <button
                          onClick={() => {
                            setSettingsOpen(true);
                            setUserMenuOpen(false);
                          }}
                          className={classNames(
                            'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors',
                            isDark ? 'hover:bg-stone-800' : 'hover:bg-red-50',
                            classes.TEXT_PRIMARY
                          )}
                        >
                          <Shield className="h-4 w-4" />
                          System
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setProfileOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors',
                          isDark ? 'hover:bg-stone-800' : 'hover:bg-red-50',
                          classes.TEXT_PRIMARY
                        )}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </button>

                      <div className={classNames('my-2 h-px', isDark ? 'bg-red-900/30' : 'bg-red-100')} />

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors',
                          isDark ? 'text-red-400 hover:bg-red-950/40' : 'text-red-700 hover:bg-red-100'
                        )}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Wrench}
            label="Parts"
            value={totalItemsCount}
            helper="Tracked items in inventory"
            theme={theme}
          />
          <MetricCard
            icon={BarChart3}
            label="On Hand"
            value={totalOnHandCount}
            helper="Current total stock units"
            theme={theme}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Low Stock"
            value={lowStockCount}
            helper="Items near threshold"
            theme={theme}
          />
          <MetricCard
            icon={ShoppingCart}
            label="Top Revenue"
            value={formatPhp(revenueTotal)}
            helper="Revenue from top-selling items"
            theme={theme}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2" theme={theme}>
            <SectionHeading
              label="Analytics"
              title="Revenue Trends"
              theme={theme}
              action={
                <div className={classes.CHIP}>
                  <BarChart3 className="h-4 w-4" />
                  <span>Live</span>
                </div>
              }
            />

            <div className="mt-5 h-72">
              {analyticsLoading ? (
                <div className={classNames('flex h-full items-center justify-center text-sm', classes.TEXT_SECONDARY)}>
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#57534e' : '#e7e5e4'} />
                    <XAxis dataKey="date" tick={{ fill: isDark ? '#a8a29e' : '#78716c', fontSize: 12 }} />
                    <YAxis tick={{ fill: isDark ? '#a8a29e' : '#78716c', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: isDark ? '1px solid #7f1d1d' : '1px solid #e7e5e4',
                        background: isDark ? '#1c1917' : '#ffffff',
                        color: isDark ? '#f5f5f4' : '#1c1917',
                        boxShadow: isDark ? '0 10px 30px rgba(220,38,38,0.2)' : '0 10px 30px rgba(0,0,0,0.06)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue_php"
                      stroke={isDark ? '#f87171' : '#dc2626'}
                      fill={isDark ? '#7f1d1d' : '#fecaca'}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card theme={theme}>
            <SectionHeading label="Ratio" title="Stock-to-Sales" theme={theme} />
            <div className="mt-5 h-72">
              {analyticsLoading ? (
                <div className={classNames('flex h-full items-center justify-center text-sm', classes.TEXT_SECONDARY)}>
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.stockToSalesRatio || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#57534e' : '#e7e5e4'} />
                    <XAxis dataKey="category" tick={{ fill: isDark ? '#a8a29e' : '#78716c', fontSize: 12 }} />
                    <YAxis tick={{ fill: isDark ? '#a8a29e' : '#78716c', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: isDark ? '1px solid #7f1d1d' : '1px solid #e7e5e4',
                        background: isDark ? '#1c1917' : '#ffffff',
                        color: isDark ? '#f5f5f4' : '#1c1917',
                        boxShadow: isDark ? '0 10px 30px rgba(220,38,38,0.2)' : '0 10px 30px rgba(0,0,0,0.06)'
                      }}
                    />
                    <Bar dataKey="ratio" radius={[10, 10, 0, 0]}>
                      {(analytics?.stockToSalesRatio || []).map((entry, index) => {
                        const redShades = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#991b1b'];
                        return <Cell key={`cell-${index}`} fill={redShades[index % redShades.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2" theme={theme}>
            <SectionHeading
              label="Daily Sales Log"
              title="Sales Today"
              theme={theme}
              action={
                <div className={classes.CHIP}>
                  <ShoppingCart className="h-4 w-4" />
                  <span>{todaySales.date}</span>
                </div>
              }
            />

            <div className="mt-5">
              {analyticsLoading ? (
                <div className={classNames('text-sm', classes.TEXT_SECONDARY)}>Loading today sales...</div>
              ) : todaySalesItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="hidden grid-cols-12 gap-3 px-3 md:grid">
                    <div className={classNames(classes.TABLE_HEADER, 'col-span-3')}>SKU</div>
                    <div className={classNames(classes.TABLE_HEADER, 'col-span-5')}>Name</div>
                    <div className={classNames(classes.TABLE_HEADER, 'col-span-1 text-right')}>Units</div>
                    <div className={classNames(classes.TABLE_HEADER, 'col-span-3 text-right')}>Revenue</div>
                  </div>

                  {todaySalesItems.map((item) => (
                    <div
                      key={item.sku}
                      className={classNames('grid grid-cols-12 gap-3 rounded-2xl border px-3 py-3', classes.BORDER, classes.BG_SECONDARY)}
                    >
                      <div className={classNames('col-span-12 text-sm font-semibold md:col-span-3', classes.TEXT_PRIMARY)}>
                        {item.sku}
                      </div>
                      <div className={classNames('col-span-12 text-sm md:col-span-5', classes.TEXT_TERTIARY)}>
                        {item.name}
                      </div>
                      <div className={classNames('col-span-6 text-right text-sm md:col-span-1', classes.TEXT_TERTIARY)}>
                        {item.units}
                      </div>
                      <div className={classNames('col-span-6 text-right text-sm font-semibold md:col-span-3', classes.TEXT_PRIMARY)}>
                        {formatPhp(Number(item.revenue_php || 0))}
                      </div>
                    </div>
                  ))}

                  <div className={classNames('flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-end sm:gap-6', classes.BORDER, classes.TEXT_SECONDARY)}>
                    <div>
                      Total Units: <span className={classNames('font-semibold', classes.TEXT_PRIMARY)}>{todaySalesUnits}</span>
                    </div>
                    <div>
                      Total Revenue:{' '}
                      <span className={classNames('font-semibold', classes.TEXT_PRIMARY)}>
                        {formatPhp(todaySalesRevenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={classNames('text-sm', classes.TEXT_SECONDARY)}>No sales recorded for today yet.</div>
              )}
            </div>
          </Card>

          <Card theme={theme}>
            <SectionHeading label="Toolkit" title="Quick Actions" theme={theme} />

            <div className="mt-5 space-y-3">
              <div className="relative">
                <ActionButton 
                  variant="primary" 
                  className="w-full" 
                  onClick={() => setQuickExportOpen(!quickExportOpen)} 
                  theme={theme}
                >
                  <FileDown className="h-4 w-4" />
                  Export
                  <ChevronDown className={classNames('h-3.5 w-3.5 ml-auto transition-transform', quickExportOpen && 'rotate-180')} />
                </ActionButton>
                
                <AnimatePresence>
                  {quickExportOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={classNames(
                        'absolute left-0 top-full mt-2 w-full rounded-2xl border p-2 shadow-xl z-50',
                        isDark 
                          ? 'border-red-900/30 bg-stone-900' 
                          : 'border-red-100 bg-white'
                      )}
                    >
                      <button
                        onClick={() => {
                          handleExportPdf();
                          setQuickExportOpen(false);
                        }}
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                          isDark
                            ? 'hover:bg-red-900/20 text-stone-100'
                            : 'hover:bg-red-50 text-stone-900'
                        )}
                      >
                        <FileText className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Export as PDF</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleExportExcel();
                          setQuickExportOpen(false);
                        }}
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                          isDark
                            ? 'hover:bg-red-900/20 text-stone-100'
                            : 'hover:bg-red-50 text-stone-900'
                        )}
                      >
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Export as Excel</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleExportWord();
                          setQuickExportOpen(false);
                        }}
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                          isDark
                            ? 'hover:bg-red-900/20 text-stone-100'
                            : 'hover:bg-red-50 text-stone-900'
                        )}
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Export as Word</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ActionButton
                className="w-full"
                onClick={() => setStatus(status === 'active' ? 'archived' : 'active')}
                theme={theme}
              >
                {status === 'active' ? 'Show Archived' : 'Show Active'}
              </ActionButton>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2" theme={theme}>
            <SectionHeading
              label="Smart Suggestions"
              title="Suggested Parts"
              theme={theme}
              action={
                <div className={classes.CHIP}>
                  <Search className="h-4 w-4" />
                  <span>Gemini AI</span>
                </div>
              }
            />

            <form
              className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4"
              onSubmit={handleCompatibilitySubmit}
            >
              <input
                className={classes.INPUT}
                placeholder="Make"
                value={compatMake}
                onChange={(event) => setCompatMake(event.target.value)}
              />
              <input
                className={classes.INPUT}
                placeholder="Model"
                value={compatModel}
                onChange={(event) => setCompatModel(event.target.value)}
              />
              <input
                className={classes.INPUT}
                placeholder="Year"
                value={compatYear}
                onChange={(event) => setCompatYear(event.target.value)}
              />
              <ActionButton
                variant="primary"
                type="submit"
                disabled={compatSearch.isPending}
                theme={theme}
              >
                <Search className="h-4 w-4" />
                Suggest
              </ActionButton>
            </form>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className={classNames('rounded-2xl border p-4', classes.BORDER, classes.BG_SECONDARY)}>
                <div className={classNames('text-sm font-semibold', classes.TEXT_PRIMARY)}>Bike</div>
                <div className={classNames('mt-1 text-sm', classes.TEXT_SECONDARY)}>Input reference for AI suggestions.</div>

                <div className="mt-4">
                  {compatBike ? (
                    <div className={classNames('rounded-2xl border px-4 py-3', classes.BORDER, isDark ? 'bg-stone-800' : 'bg-white')}>
                      <div className={classNames('font-semibold', classes.TEXT_PRIMARY)}>
                        {compatBike.make} {compatBike.model}
                      </div>
                      <div className={classNames('mt-1 text-sm', classes.TEXT_SECONDARY)}>{compatBike.year ?? '—'}</div>
                    </div>
                  ) : (
                    <div className={classNames('text-sm', classes.TEXT_SECONDARY)}>No query yet.</div>
                  )}
                </div>
              </div>

              <div className={classNames('rounded-2xl border p-4', classes.BORDER, classes.BG_SECONDARY)}>
                <div className={classNames('text-sm font-semibold', classes.TEXT_PRIMARY)}>Suggested Parts</div>
                <div className={classNames('mt-1 text-sm', classes.TEXT_SECONDARY)}>Minimal AI-assisted compatibility view.</div>

                <div className="mt-4 max-h-64 space-y-3 overflow-auto pr-1">
                  {compatSuggestions.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className={classNames('rounded-2xl border px-4 py-3', classes.BORDER, isDark ? 'bg-stone-800' : 'bg-white')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className={classNames('font-semibold', classes.TEXT_PRIMARY)}>{item.name}</div>
                        <span className={classNames('text-xs', classes.TEXT_SECONDARY)}>AI</span>
                      </div>
                      <div className={classNames('mt-1 text-sm', classes.TEXT_SECONDARY)}>
                        {item.note || 'Suggested part'}
                      </div>
                    </div>
                  ))}

                  {compatSearch.isSuccess && compatSuggestions.length === 0 ? (
                    <div className={classNames('text-sm', classes.TEXT_SECONDARY)}>
                      No suggestions returned. Check your GEMINI_API_KEY.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>

          <Card theme={theme}>
            <SectionHeading label="QR / Barcode" title="SKU Generator" theme={theme} />

            <div className="mt-5">
              <input
                className={classes.INPUT}
                placeholder="Enter SKU"
                value={qrSku}
                onChange={(event) => setQrSku(event.target.value)}
              />

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <ActionButton variant="primary" className="w-full" onClick={generateQrCode} theme={theme}>
                  <QrCode className="h-4 w-4" />
                  Generate
                </ActionButton>
                <ActionButton className="w-full" onClick={() => setQrDataUrl(null)} theme={theme}>
                  Clear
                </ActionButton>
              </div>

              {qrDataUrl ? (
                <div className={classNames('mt-5 flex items-center justify-center rounded-2xl border p-4', classes.BORDER, classes.BG_SECONDARY)}>
                  <img
                    src={qrDataUrl}
                    alt="SKU QR"
                    className={classNames('h-44 w-44 rounded-2xl border p-2', classes.BORDER, isDark ? 'bg-stone-800' : 'bg-white')}
                  />
                </div>
              ) : null}

              <div className={classNames('mt-4 text-xs', classes.TEXT_SECONDARY)}>
                QR generation only. Use Mock Scan to search by SKU.
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-6" theme={theme}>
          <SectionHeading
            label="Inventory"
            title={status === 'archived' ? 'Archived Parts' : 'Parts'}
            theme={theme}
            action={
              <div className={classes.CHIP}>
                <span>Results</span>
                <span className={classNames('font-semibold', classes.TEXT_PRIMARY)}>{inventoryList.length}</span>
              </div>
            }
          />

          <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 xl:max-w-3xl">
              <div className="relative">
                <Search className={classNames('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', classes.TEXT_SECONDARY)} />
                <input
                  className={classNames(classes.INPUT, 'pl-11')}
                  placeholder="Search SKU, name, bin..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div>
                <input
                  className={classes.INPUT}
                  placeholder="Category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  list="category_filter_list"
                />
                <datalist id="category_filter_list">
                  {categoryOptions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <ActionButton 
                    variant="primary" 
                    className="w-full" 
                    onClick={() => setInventoryExportOpen(!inventoryExportOpen)} 
                    theme={theme}
                  >
                    <FileDown className="h-4 w-4" />
                    Export
                    <ChevronDown className={classNames('h-3.5 w-3.5 transition-transform', inventoryExportOpen && 'rotate-180')} />
                  </ActionButton>
                  
                  <AnimatePresence>
                    {inventoryExportOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={classNames(
                          'absolute right-0 top-full mt-2 w-48 rounded-2xl border p-2 shadow-xl z-50',
                          isDark 
                            ? 'border-red-900/30 bg-stone-900' 
                            : 'border-red-100 bg-white'
                        )}
                      >
                        <button
                          onClick={() => {
                            handleExportPdf();
                            setInventoryExportOpen(false);
                          }}
                          className={classNames(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                            isDark
                              ? 'hover:bg-red-900/20 text-stone-100'
                              : 'hover:bg-red-50 text-stone-900'
                          )}
                        >
                          <FileText className="h-4 w-4 text-red-500" />
                          <span className="font-medium">Export as PDF</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleExportExcel();
                            setInventoryExportOpen(false);
                          }}
                          className={classNames(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                            isDark
                              ? 'hover:bg-red-900/20 text-stone-100'
                              : 'hover:bg-red-50 text-stone-900'
                          )}
                        >
                          <FileSpreadsheet className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Export as Excel</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleExportWord();
                            setInventoryExportOpen(false);
                          }}
                          className={classNames(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                            isDark
                              ? 'hover:bg-red-900/20 text-stone-100'
                              : 'hover:bg-red-50 text-stone-900'
                          )}
                        >
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Export as Word</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <ActionButton
                  className="w-full"
                  onClick={() => setStatus(status === 'active' ? 'archived' : 'active')}
                  theme={theme}
                >
                  {status === 'active' ? 'Archived' : 'Active'}
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="mt-6 hidden grid-cols-12 gap-4 px-4 md:grid">
            <div className={classNames(classes.TABLE_HEADER, 'col-span-2')}>SKU</div>
            <div className={classNames(classes.TABLE_HEADER, 'col-span-3')}>Name</div>
            <div className={classNames(classes.TABLE_HEADER, 'col-span-2')}>Category</div>
            <div className={classNames(classes.TABLE_HEADER, 'col-span-2')}>Bin</div>
            <div className={classNames(classes.TABLE_HEADER, 'col-span-1')}>Stock</div>
            <div className={classNames(classes.TABLE_HEADER, 'col-span-2 text-right')}>Actions</div>
          </div>

          <div className="mt-4 space-y-3">
            {inventoryLoading ? (
              <div className={classNames('py-10 text-center text-sm', classes.TEXT_SECONDARY)}>Loading inventory...</div>
            ) : inventoryList.length > 0 ? (
              inventoryList.map((item) => {
                const currentQuantity = Number(item.quantity_on_hand || 0);
                const thresholdQuantity = Number(item.low_stock_threshold || 0);
                const isLowStock = currentQuantity <= thresholdQuantity;

                return (
                  <InventoryRow key={item._id} isLowStock={isLowStock} theme={theme}>
                    <div className={classNames('col-span-12 text-sm font-semibold md:col-span-2', classes.TEXT_PRIMARY)}>
                      {item.sku}
                    </div>

                    <div className={classNames('col-span-12 text-sm md:col-span-3', classes.TEXT_TERTIARY)}>
                      {item.name}
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <span className={classNames('inline-flex rounded-full border px-3 py-1 text-xs', classes.BORDER, classes.BG_TERTIARY, classes.TEXT_TERTIARY)}>
                        {item.category}
                      </span>
                    </div>

                    <div className={classNames('col-span-6 text-sm md:col-span-2', classes.TEXT_SECONDARY)}>
                      {item.bin_location}
                    </div>

                    <div className="col-span-12 md:col-span-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={classNames(
                            'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold tabular-nums',
                            isLowStock
                              ? isDark
                                ? 'border-red-800 bg-red-950/50 text-red-400'
                                : 'border-red-300 bg-red-100 text-red-700'
                              : isDark
                                ? 'border-red-900/40 bg-stone-800 text-stone-300'
                                : 'border-stone-200 bg-stone-100 text-stone-700'
                          )}
                        >
                          {currentQuantity} / {thresholdQuantity}
                        </span>
                        {isLowStock ? (
                          <span className={classNames('flex h-5 w-5 items-center justify-center rounded-full', isDark ? 'bg-red-900/50' : 'bg-red-100')}>
                            <span className={classNames('h-2 w-2 rounded-full', isDark ? 'bg-red-500' : 'bg-red-600')} />
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="col-span-12 flex items-center justify-end gap-1.5 md:col-span-2">
                      {status === 'active' ? (
                        <>
                          <ActionButton 
                            onClick={() => handleMoveStock({ id: item._id, direction: 'IN' })} 
                            theme={theme}
                            className="!px-2 !py-1.5 !text-xs !rounded-lg"
                            title="Stock In"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </ActionButton>

                          <ActionButton 
                            onClick={() => handleMoveStock({ id: item._id, direction: 'OUT' })} 
                            theme={theme}
                            className="!px-2 !py-1.5 !text-xs !rounded-lg"
                            title="Stock Out"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </ActionButton>

                          <ActionButton
                            variant="primary"
                            onClick={() => handleMoveStock({ id: item._id, direction: 'SALE' })}
                            theme={theme}
                            className="!px-2.5 !py-1.5 !text-xs !rounded-lg"
                            title="Record Sale"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span className="ml-1">SALE</span>
                          </ActionButton>

                          <ActionButton
                            onClick={async () => {
                              const isConfirmed = window.confirm(`Archive ${item.sku}?`);

                              if (!isConfirmed) {
                                return;
                              }

                              try {
                                await archiveItem.mutateAsync({
                                  id: item._id,
                                  note: 'Operator archived item'
                                });
                              } catch (error) {
                                console.error(error);
                                window.alert('Archive failed.');
                              }
                            }}
                            theme={theme}
                            className="!px-2 !py-1.5 !text-xs !rounded-lg"
                            title="Archive Item"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton
                            onClick={async () => {
                              const isConfirmed = window.confirm(
                                `Restore ${item.sku} to active inventory?`
                              );

                              if (!isConfirmed) {
                                return;
                              }

                              try {
                                await restoreItem.mutateAsync({
                                  id: item._id,
                                  note: 'Operator restored item'
                                });
                              } catch (error) {
                                console.error(error);
                                window.alert('Restore failed.');
                              }
                            }}
                            theme={theme}
                            className="!px-2.5 !py-1.5 !text-xs !rounded-lg"
                            title="Restore Item"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            <span className="ml-1">Restore</span>
                          </ActionButton>

                          {canManage && (
                            <ActionButton
                              variant="danger"
                              onClick={async () => {
                                const isConfirmed = window.confirm(
                                  `Permanently delete ${item.sku}? This cannot be undone.`
                                );

                                if (!isConfirmed) {
                                  return;
                                }

                                try {
                                  await deletePermanently.mutateAsync({ id: item._id });
                                } catch (error) {
                                  console.error(error);
                                  window.alert('Delete failed (admin only).');
                                }
                              }}
                              theme={theme}
                              className="!px-2 !py-1.5 !text-xs !rounded-lg"
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </ActionButton>
                          )}
                        </>
                      )}
                    </div>
                  </InventoryRow>
                );
              })
            ) : (
              <div className={classNames('py-10 text-center text-sm', classes.TEXT_SECONDARY)}>No items found.</div>
            )}
          </div>
        </Card>
      </div>

      <Modal open={createOpen} title="Add Inventory Part" onClose={() => setCreateOpen(false)} theme={theme}>
        <form className="space-y-4" onSubmit={handleCreateItem}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>SKU</span>
              <input
                className={classNames(classes.INPUT, 'mt-2')}
                name="sku"
                placeholder="IMS-ABC123"
                required
              />
              <div className={classNames('mt-2 text-xs', classes.TEXT_SECONDARY)}>Use uppercase letters and hyphens.</div>
            </label>

            <label className="block">
              <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Category</span>
              <input
                className={classNames(classes.INPUT, 'mt-2')}
                name="category"
                placeholder="Engine"
                list="category_list"
                required
              />
              <datalist id="category_list">
                {categoryOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
          </div>

          <label className="block">
            <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Name</span>
            <input
              className={classNames(classes.INPUT, 'mt-2')}
              name="name"
              placeholder="Carbon Weave Helmet"
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Bin Location</span>
              <input
                className={classNames(classes.INPUT, 'mt-2')}
                name="bin_location"
                placeholder="A-03-12"
                required
              />
            </label>

            <label className="block">
              <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Low-stock Threshold</span>
              <input
                className={classNames(classes.INPUT, 'mt-2')}
                type="number"
                name="low_stock_threshold"
                defaultValue={5}
                min={0}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Price (PHP)</span>
              <input
                className={classNames(classes.INPUT, 'mt-2')}
                type="number"
                name="price_php"
                defaultValue={0}
                min={0}
              />
            </label>

            <label className="block">
              <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Cost (PHP)</span>
              <input
                className={classNames(classes.INPUT, 'mt-2')}
                type="number"
                name="cost_php"
                defaultValue={0}
                min={0}
              />
            </label>

            <label className="block">
              <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Qty On Hand</span>
              <input
                className={classNames(classes.INPUT, 'mt-2')}
                type="number"
                name="quantity_on_hand"
                defaultValue={0}
                min={0}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <ActionButton
              variant="primary"
              type="submit"
              className="w-full"
              disabled={createItem.isPending}
              theme={theme}
            >
              {createItem.isPending ? 'Creating...' : 'Create Part'}
            </ActionButton>

            <ActionButton className="w-full" onClick={() => setCreateOpen(false)} type="button" theme={theme}>
              Cancel
            </ActionButton>
          </div>

          {createItem.isError ? (
            <div className={classNames('rounded-2xl border px-4 py-3 text-sm', isDark ? 'border-red-800 bg-red-950/50 text-red-400' : 'border-red-200 bg-red-50 text-red-700')}>
              {createItem.error?.response?.data?.error?.message || 'Failed to create item.'}
            </div>
          ) : null}
        </form>
      </Modal>

      <Modal open={settingsOpen} title="System Settings" onClose={() => setSettingsOpen(false)} theme={theme}>
        <div className="flex gap-2 border-b pb-4 mb-4 border-red-900/30">
          <ActionButton 
            variant={settingsTab === 'team' ? 'primary' : 'secondary'} 
            onClick={() => {
              setSettingsTab('team');
              setSelectedLogUserId(null);
            }} 
            theme={theme}
            className="!py-2"
          >
            Team
          </ActionButton>
          <ActionButton 
            variant={settingsTab === 'logs' ? 'primary' : 'secondary'} 
            onClick={() => setSettingsTab('logs')} theme={theme}
            className="!py-2"
          >
            System Logs
          </ActionButton>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {settingsTab === 'team' ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <SectionHeading label="Workforce" title="Active Members" theme={theme} />
                {usersLoading ? (
                  <div className="text-sm py-4">Loading team...</div>
                ) : users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map(u => (
                      <div key={u.id} className={classNames('flex items-center justify-between p-3 rounded-2xl border', classes.BORDER, classes.BG_SECONDARY)}>
                        <div>
                          <div className="text-sm font-semibold flex items-center gap-2">
                            {u.full_name}
                            {u.is_protected && <Shield className="h-3 w-3 text-red-500" title="System Owner" />}
                          </div>
                          <div className="text-xs text-stone-500">{u.email} • <span className="uppercase">{u.role}</span></div>
                        </div>
                        <div className="flex gap-1">
                          <ActionButton 
                            theme={theme} 
                            className="!px-2 !py-1 !text-xs !rounded-lg"
                            title="View User Logs"
                            onClick={() => {
                              setSelectedLogUserId(u.id);
                              setSettingsTab('logs');
                            }}
                          >
                            <Activity className="h-3.5 w-3.5" />
                          </ActionButton>
                          <ActionButton 
                            theme={theme} 
                            className="!px-2 !py-1 !text-xs !rounded-lg"
                            disabled={u.is_protected}
                            onClick={async () => {
                              const nextStatus = !u.is_active;
                              if (window.confirm(`${nextStatus ? 'Activate' : 'Deactivate'} ${u.full_name}?`)) {
                                await toggleUserStatus.mutateAsync({ id: u.id, is_active: nextStatus });
                              }
                            }}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </ActionButton>
                          <ActionButton 
                            variant="danger" 
                            theme={theme} 
                            className="!px-2 !py-1 !text-xs !rounded-lg"
                            disabled={u.is_protected}
                            onClick={async () => {
                              if (window.confirm(`Permanently delete ${u.full_name}?`)) {
                                await deleteUser.mutateAsync({ id: u.id });
                              }
                            }}
                          >
                            Delete
                          </ActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-stone-500">No members found.</div>
                )}
              </div>

              <div className={classNames('p-4 rounded-3xl border border-dashed', classes.BORDER)}>
                <SectionHeading label="Onboarding" title="Add New Member" theme={theme} />
                <form className="mt-4 space-y-3" onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  await createUser.mutateAsync({
                    email: fd.get('email'),
                    full_name: fd.get('full_name'),
                    role: fd.get('role'),
                    password: fd.get('password')
                  });
                  e.currentTarget.reset();
                }}>
                  <input className={classes.INPUT} name="full_name" placeholder="Full Name" required />
                  <input className={classes.INPUT} name="email" type="email" placeholder="Email Address" required />
                  <div className="grid grid-cols-2 gap-2">
                    <select className={classes.INPUT} name="role" required>
                      <option value="staff">Staff</option>
                      {user.role === 'super_admin' && <option value="admin">Admin</option>}
                      {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                    </select>
                    <div className="relative">
                      <input 
                        className={classes.INPUT} 
                        name="password" 
                        type={showCreatePassword ? "text" : "password"} 
                        placeholder="Temp Password" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-300"
                      >
                        {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <ActionButton variant="primary" type="submit" className="w-full" disabled={createUser.isPending}>
                    {createUser.isPending ? 'Creating...' : 'Create Account'}
                  </ActionButton>
                  {createUser.isError && <div className="text-xs text-red-500">{createUser.error?.response?.data?.error?.message || 'Failed to create user'}</div>}
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeading 
                  label="Audit Trail" 
                  title={selectedLogUserId ? "Filtered Activity" : "System Activity"} 
                  theme={theme} 
                />
                
                <div className="flex items-center gap-2">
                  <select 
                    className={classNames(classes.INPUT, '!py-1.5 !px-3 !text-xs !w-auto')}
                    value={selectedLogUserId || ''}
                    onChange={(e) => setSelectedLogUserId(e.target.value || null)}
                  >
                    <option value="">All Users</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </select>
                  {selectedLogUserId && (
                    <ActionButton 
                      theme={theme} 
                      className="!py-1.5 !px-2 !text-xs" 
                      onClick={() => setSelectedLogUserId(null)}
                    >
                      Clear
                    </ActionButton>
                  )}
                </div>
              </div>

              {logsLoading ? (
                <div className="text-sm py-4">Loading logs...</div>
              ) : logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className={classNames('p-3 rounded-2xl border text-[13px]', classes.BORDER, classes.BG_SECONDARY)}>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={classNames('font-bold', isDark ? 'text-red-400' : 'text-red-700')}>
                          {getFriendlyLogMessage(log)}
                        </span>
                        <span className="text-[11px] text-stone-500 whitespace-nowrap ml-4">
                          {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="text-stone-500">Actor:</span>
                          <span className={classNames('font-medium', classes.TEXT_PRIMARY)}>{log.user_name}</span>
                        </div>
                        <span className={classNames(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', 
                          log.status_code >= 400 
                            ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700' 
                            : isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'
                        )}>
                          {log.status_code >= 400 ? 'Failed' : 'Success'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-stone-500">No activity logs found.</div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal open={inventoryLogsOpen} title="Inventory Logs" onClose={() => setInventoryLogsOpen(false)} theme={theme}>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          <div className="flex flex-col gap-3">
            <SectionHeading label="Audit" title="Part Activity Trail" theme={theme} />
            
            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <select 
                className={classNames(classes.INPUT, '!py-1.5 !px-3 !text-xs')}
                value={invLogActor}
                onChange={(e) => setInvLogActor(e.target.value)}
              >
                <option value="">All Actors</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>

              <select 
                className={classNames(classes.INPUT, '!py-1.5 !px-3 !text-xs')}
                value={invLogAction}
                onChange={(e) => setInvLogAction(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="STOCK_MOVE">Stock Move</option>
                <option value="SALE">Sale</option>
                <option value="ARCHIVE">Archive</option>
                <option value="RESTORE">Restore</option>
                <option value="DELETE">Delete</option>
              </select>

              <select 
                className={classNames(classes.INPUT, '!py-1.5 !px-3 !text-xs')}
                value={invLogDateRange}
                onChange={(e) => setInvLogDateRange(e.target.value)}
              >
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>

              <select 
                className={classNames(classes.INPUT, '!py-1.5 !px-3 !text-xs')}
                value={invLogSort}
                onChange={(e) => setInvLogSort(e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            {inventoryLogsLoading ? (
              <div className="text-sm py-4">Loading inventory logs...</div>
            ) : inventoryLogs.length > 0 ? (
              inventoryLogs.map(log => {
                const details = getInventoryLogDetails(log);
                return (
                  <div key={log.id} className={classNames('p-3 rounded-2xl border text-[13px]', classes.BORDER, classes.BG_SECONDARY)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className={classNames('font-bold text-sm', classes.TEXT_PRIMARY)}>
                          {details.partName}
                        </span>
                        <span className="text-[11px] text-stone-500">SKU: {details.sku}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={classNames('font-semibold', details.colorClass)}>
                          {details.message}
                        </span>
                        <span className="text-stone-500 px-1">•</span>
                        <span className={classNames('text-[12px]', classes.TEXT_TERTIARY)}>
                          by {log.actor_name || 'System'}
                        </span>
                      </div>
                      
                      {log.note && (
                        <span className="text-[11px] italic text-stone-500 max-w-[150px] truncate" title={log.note}>
                          "{log.note}"
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-stone-500">No inventory activity recorded.</div>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={profileOpen} title="My Profile" onClose={() => setProfileOpen(false)} theme={theme}>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          try {
            await updateProfile.mutateAsync({
              full_name: fd.get('full_name'),
              email: fd.get('email'),
              password: fd.get('password') || undefined
            });
            window.alert('Profile updated successfully! If you changed your email or password, you may need to log in again.');
            setProfileOpen(false);
          } catch (err) {
            window.alert(err?.response?.data?.error?.message || 'Failed to update profile.');
          }
        }}>
          <label className="block">
            <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Full Name</span>
            <input className={classNames(classes.INPUT, 'mt-2')} name="full_name" defaultValue={user?.name || user?.full_name} required />
          </label>
          <label className="block">
            <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>Email Address</span>
            <input className={classNames(classes.INPUT, 'mt-2')} name="email" type="email" defaultValue={user?.email} required />
          </label>
          <label className="block">
            <span className={classNames('text-sm font-medium', classes.TEXT_TERTIARY)}>New Password (Optional)</span>
            <input className={classNames(classes.INPUT, 'mt-2')} name="password" type="password" placeholder="Leave blank to keep current" minLength={6} />
          </label>
          
          <div className="flex gap-2 pt-2">
            <ActionButton variant="primary" type="submit" className="w-full" disabled={updateProfile.isPending} theme={theme}>
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </ActionButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
