/*
 * File: src/widgets/dashboard.jsx
 * Description: Minimalist React dashboard using Poppins and Questrial typography.
 * Version: 2.0.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  FileDown,
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
  Bar
} from 'recharts';
import QRCode from 'qrcode';

import { useAuth } from '../state/auth_context';
import { useInventory } from '../hooks/use_inventory';
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

export function Dashboard() {
  useDashboardFonts();

  const { user, logout } = useAuth();

  const [theme, setTheme] = useState('dark'); // Default to dark mode
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [createOpen, setCreateOpen] = useState(false);

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
        <Card className="overflow-hidden" theme={theme}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={classNames('flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border', classes.BORDER, classes.BG_TERTIARY)}>
                <img
                  src="/img/logo.jpg"
                  alt="MotoMart Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <div className={classNames('text-xs font-semibold uppercase tracking-[0.24em]', classes.TEXT_SECONDARY)}>
                  Inventory Dashboard
                </div>
                <h1
                  className={classNames('mt-1 text-3xl font-bold tracking-tight sm:text-4xl', isDark ? 'text-red-400' : 'text-red-700')}
                  style={{ fontFamily: "'Questrial', sans-serif" }}
                >
                  MOTOMART
                </h1>
                <div className={classNames('mt-1 text-sm', classes.TEXT_SECONDARY)}>
                  Clean inventory control, sales visibility, and part operations.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ActionButton variant="primary" onClick={() => setCreateOpen(true)} theme={theme}>
                <Plus className="h-4 w-4" />
                Add Part
              </ActionButton>

              <ActionButton onClick={handleMockScan} theme={theme}>
                <QrCode className="h-4 w-4" />
                Mock Scan
              </ActionButton>

              <ActionButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} theme={theme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </ActionButton>

              <ActionButton onClick={logout} theme={theme}>
                <LogOut className="h-4 w-4" />
                Logout
              </ActionButton>
            </div>
          </div>
        </Card>

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
                    <Bar dataKey="ratio" fill={isDark ? '#ef4444' : '#dc2626'} radius={[10, 10, 0, 0]} />
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
              <ActionButton variant="primary" className="w-full" onClick={handleExportPdf} theme={theme}>
                <FileDown className="h-4 w-4" />
                Export PDF
              </ActionButton>

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
                <ActionButton variant="primary" className="w-full" onClick={handleExportPdf} theme={theme}>
                  <FileDown className="h-4 w-4" />
                  PDF
                </ActionButton>
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
    </div>
  );
}