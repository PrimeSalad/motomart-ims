/*
 * Carbon & Crimson IMS
 * File: src/widgets/dashboard.jsx
 * Version: 1.1.2
 * Purpose: Main React Dashboard component (God Mode UI).
 *
 * Changelog:
 * - Fixed JSX mismatched tags in Compatibility + QR section.
 * - Gemini-only Smart Suggestions (Suggested Parts).
 * - PDF export remains.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LogOut,
  Search,
  Shield,
  Wrench,
  AlertTriangle,
  QrCode,
  Plus,
  ArrowDown,
  ArrowUp,
  ShoppingCart,
  FileDown,
  Archive,
  Trash2,
  Undo2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import QRCode from 'qrcode';

import { useAuth } from '../state/auth_context';
import { useInventory } from '../hooks/use_inventory';
import { formatPhp } from '../lib/format';
import { exportDashboardPdf } from '../lib/pdf_export';

function classNames(...xs) {
  return xs.filter(Boolean).join(' ');
}

function GlassCard({ className = '', children }) {
  return (
    <div className={classNames('glass p-5 md:p-6', className)}>
      {children}
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="glass p-4 border-white/10">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</div>
        <Icon className="w-4 h-4 text-crimson/80" />
      </div>
      <div className="mt-2 text-2xl font-black tracking-tight">{value}</div>
    </div>
  );
}

function MechanicalButton({ className = '', children, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.985, y: 1 }}
      transition={{ duration: 0.06 }}
      className={classNames('btn-mech', className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function RedlineRow({ emergency, children }) {
  return (
    <div
      className={classNames(
        'grid grid-cols-12 gap-3 items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2',
        'transition hover:bg-white/[0.04]',
        emergency ? 'emergency' : ''
      )}
    >
      {children}
    </div>
  );
}

function Modal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-lg glass p-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-black tracking-tight">{title}</div>
              <MechanicalButton onClick={onClose}>Close</MechanicalButton>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Dashboard() {
  const { user, logout } = useAuth();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');
  const [createOpen, setCreateOpen] = useState(false);

  const [compatMake, setCompatMake] = useState('');
  const [compatModel, setCompatModel] = useState('');
  const [compatYear, setCompatYear] = useState('');
  const [qrSku, setQrSku] = useState('');

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

  const categoryOptions = useMemo(() => {
    const base = ['Engine', 'Helmet', 'Tires', 'Gear', 'Accessories', 'Electrical', 'Brakes', 'Oil & Fluids'];
    const fromData = (inventory || []).map((x) => String(x.category || '').trim()).filter(Boolean);
    return Array.from(new Set([...base, ...fromData])).sort((a, b) => a.localeCompare(b));
  }, [inventory]);

  const totalsOnHand = analytics?.totals?.onHand ?? 0;
  const totalsItems = analytics?.totals?.items ?? 0;

  const revenueTotal = useMemo(() => {
    const top = analytics?.topSelling || [];
    return top.reduce((sum, x) => sum + Number(x.revenue_php || 0), 0);
  }, [analytics]);

  const lowStockCount = analytics?.lowStock?.length ?? 0;

  const todaySales = analytics?.todaySales || {
    date: new Date().toISOString().slice(0, 10),
    units: 0,
    revenue_php: 0,
    items: []
  };
  const todaySalesUnits = Number(todaySales.units || 0);
  const todaySalesRevenue = Number(todaySales.revenue_php || 0);

  const onCreate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      sku: String(form.get('sku') || '').trim(),
      name: String(form.get('name') || '').trim(),
      category: String(form.get('category') || 'Gear'),
      bin_location: String(form.get('bin_location') || '').trim(),
      price_php: Number(form.get('price_php') || 0),
      cost_php: Number(form.get('cost_php') || 0),
      quantity_on_hand: Number(form.get('quantity_on_hand') || 0),
      low_stock_threshold: Number(form.get('low_stock_threshold') || 5),
      compatibility: []
    };

    await createItem.mutateAsync(payload);
    setCreateOpen(false);
    e.currentTarget.reset();
  };

  const onCompat = async (e) => {
    e.preventDefault();
    await compatSearch.mutateAsync({
      make: compatMake,
      model: compatModel,
      year: compatYear ? Number(compatYear) : undefined
    });
  };

  const compatBike = compatSearch.data?.bike || null;
  const compatSuggestions = compatSearch.data?.suggestions || [];

  const onGenerateQr = async () => {
    const sku = String(qrSku || '').trim();
    if (!sku) return null;
    const dataUrl = await QRCode.toDataURL(sku, { margin: 1, width: 220 });
    return dataUrl;
  };

  const [qrDataUrl, setQrDataUrl] = useState(null);

  const handleMove = async ({ id, direction }) => {
    const qtyStr = prompt(`Enter quantity to ${direction}:`);
    if (!qtyStr) return;
    const qty = Number(qtyStr);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty)) {
      alert('Quantity must be a positive integer.');
      return;
    }
    const note = direction === 'SALE' ? 'sale' : 'warehouse move';
    await moveStock.mutateAsync({ id, direction, quantity: qty, note });
  };

  const onExportPdf = async () => {
    try {
      await exportDashboardPdf({ user, analytics, inventory });
    } catch (err) {
      console.error(err);
      alert('PDF export failed. Please try again.');
    }
  };

  const scanSku = async () => {
    const sku = prompt('Mock scan: paste SKU here (e.g. IMS-ABC123)');
    if (!sku) return;
    setSearch(String(sku).trim());
  };

  return (
    <div className="min-h-screen bg-carbon text-white relative overflow-hidden">
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none opacity-75"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(220,38,38,0.23), transparent 40%),' +
            'radial-gradient(circle at 80% 70%, rgba(220,38,38,0.10), transparent 45%),' +
            'linear-gradient(135deg, rgba(255,255,255,0.04), transparent 65%)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="glass px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="group relative flex items-center gap-4 p-2 cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-2xl bg-crimson opacity-20 blur-xl group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" />
              <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl">
                <img
                  src="/img/logo.jpg"
                  alt="MotoMart Logo"
                  className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.4)_100%)]" />
                <div className="absolute bottom-0 h-[3px] w-full bg-crimson shadow-[0_0_12px_#dc143c]" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-6 bg-gradient-to-r from-crimson to-transparent" />
                <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">
                  System <span className="text-crimson/80">Online</span>
                </div>
              </div>

              <div className="relative mt-[-4px]">
                <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                  MOTOMART
                </h1>
                <div className="text-[9px] uppercase tracking-widest text-white/20 font-medium -mt-1 group-hover:text-white/40 transition-all">
                  Engineered by <span className="text-crimson/50 font-bold">DotOrbit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="chip border-crimson/30 bg-crimson/10">
              <Shield className="w-4 h-4 text-crimson" />
              <span className="text-white/80">{user?.role || 'staff'}</span>
            </div>

            <MechanicalButton className="btn-crimson" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Part
            </MechanicalButton>

            <MechanicalButton onClick={scanSku}>
              <QrCode className="w-4 h-4 text-crimson/80" />
              Mock Scan
            </MechanicalButton>

            <MechanicalButton onClick={logout}>
              <LogOut className="w-4 h-4" />
              Logout
            </MechanicalButton>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Parts" value={totalsItems} icon={Wrench} />
          <Metric label="On Hand" value={totalsOnHand} icon={BarChart3} />
          <Metric label="Low Stock" value={lowStockCount} icon={AlertTriangle} />
          <Metric label="Top Revenue" value={formatPhp(revenueTotal)} icon={ShoppingCart} />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/45">Stock Pulse</div>
                <div className="text-lg font-black tracking-tight mt-1">Revenue Trends</div>
              </div>
              <div className="chip border-crimson/30 bg-crimson/10">
                <BarChart3 className="w-4 h-4 text-crimson" />
                <span className="text-white/80">Live</span>
              </div>
            </div>

            <div className="mt-4 h-64">
              {analyticsLoading ? (
                <div className="text-white/50">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'rgba(10,10,10,0.92)', border: '1px solid rgba(220,38,38,0.35)' }} />
                    <Area type="monotone" dataKey="revenue_php" stroke="rgba(220,38,38,0.9)" fill="rgba(220,38,38,0.18)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-xs uppercase tracking-[0.35em] text-white/45">Ratio</div>
            <div className="text-lg font-black tracking-tight mt-1">Stock-to-Sales</div>
            <div className="mt-4 h-64">
              {analyticsLoading ? (
                <div className="text-white/50">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.stockToSalesRatio || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'rgba(10,10,10,0.92)', border: '1px solid rgba(220,38,38,0.35)' }} />
                    <Bar dataKey="ratio" fill="rgba(220,38,38,0.55)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Sales Today */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/45">Daily Sales Log</div>
                <div className="text-lg font-black tracking-tight mt-1">Sales Today</div>
              </div>
              <div className="chip border-crimson/30 bg-crimson/10">
                <ShoppingCart className="w-4 h-4 text-crimson" />
                <span className="text-white/80">{todaySales.date}</span>
              </div>
            </div>

            <div className="mt-4">
              {analyticsLoading ? (
                <div className="text-white/50">Loading today sales...</div>
              ) : Array.isArray(todaySales.items) && todaySales.items.length > 0 ? (
                <div className="space-y-2">
                  <div className="hidden md:block">
                    <div className="grid grid-cols-12 gap-3 text-xs text-white/50 px-3 pb-2">
                      <div className="col-span-3">SKU</div>
                      <div className="col-span-6">Name</div>
                      <div className="col-span-1 text-right">Units</div>
                      <div className="col-span-2 text-right">Revenue</div>
                    </div>
                  </div>

                  {todaySales.items.map((x) => (
                    <div
                      key={x.sku}
                      className="grid grid-cols-12 gap-3 items-center rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04] transition"
                    >
                      <div className="col-span-12 md:col-span-3 text-sm font-semibold">{x.sku}</div>
                      <div className="col-span-12 md:col-span-6 text-sm text-white/80">{x.name}</div>
                      <div className="col-span-6 md:col-span-1 text-right text-sm">{x.units}</div>
                      <div className="col-span-6 md:col-span-2 text-right text-sm font-semibold">
                        {formatPhp(Number(x.revenue_php || 0))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex items-center justify-end gap-4 text-sm">
                    <div className="text-white/50">
                      Total Units: <span className="text-white font-semibold">{todaySalesUnits}</span>
                    </div>
                    <div className="text-white/50">
                      Total Revenue: <span className="text-white font-semibold">{formatPhp(todaySalesRevenue)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-white/50">No sales recorded for today yet.</div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/45">Operator Toolkit</div>
                <div className="text-lg font-black tracking-tight mt-1">Quick Actions</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <MechanicalButton className="w-full btn-crimson" onClick={onExportPdf}>
                <FileDown className="w-4 h-4" />
                Export PDF (Tables)
              </MechanicalButton>
            </div>
          </GlassCard>
        </div>

        {/* Compatibility + QR (FIXED) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/45">Smart Suggestions</div>
                <div className="text-lg font-black tracking-tight mt-1">  Suggested Parts</div>
              </div>
              <div className="chip border-crimson/30 bg-crimson/10">
                <Search className="w-4 h-4 text-crimson" />
                <span className="text-white/80">Gemini AI</span>
              </div>
            </div>

            <form className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={onCompat}>
              <input
                className="input-mech"
                placeholder="Make (e.g. Honda)"
                value={compatMake}
                onChange={(e) => setCompatMake(e.target.value)}
              />
              <input
                className="input-mech"
                placeholder="Model (e.g. Click 150)"
                value={compatModel}
                onChange={(e) => setCompatModel(e.target.value)}
              />
              <input
                className="input-mech"
                placeholder="Year (e.g. 2020)"
                value={compatYear}
                onChange={(e) => setCompatYear(e.target.value)}
              />
              <MechanicalButton className="btn-crimson" type="submit" disabled={compatSearch.isPending}>
                <Search className="w-4 h-4" />
                Suggest
              </MechanicalButton>
            </form>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="glass p-4">
                <div className="text-sm font-semibold text-white/80">Bike</div>
                <div className="mt-2 text-xs text-white/50">Your query (used as context).</div>

                <div className="mt-3 space-y-2">
                  {compatBike ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                      <div className="font-semibold">{compatBike.make} {compatBike.model}</div>
                      <div className="text-xs text-white/55">{compatBike.year ?? '—'}</div>
                    </div>
                  ) : (
                    <div className="text-white/50 text-sm">No query yet.</div>
                  )}
                </div>
              </div>

              <div className="glass p-4">
                <div className="text-sm font-semibold text-white/80">Suggested Parts (AI)</div>
                <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-2">
                  {compatSuggestions.map((p, idx) => (
                    <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{p.name}</div>
                        <span className="text-xs text-white/50">AI</span>
                      </div>
                      {p.note ? (
                        <div className="mt-1 text-xs text-white/55">{p.note}</div>
                      ) : (
                        <div className="mt-1 text-xs text-white/55">Suggested part</div>
                      )}
                    </div>
                  ))}

                  {compatSearch.isSuccess && compatSuggestions.length === 0 && (
                    <div className="text-white/50 text-sm">No suggestions returned. Check GEMINI_API_KEY.</div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-xs uppercase tracking-[0.35em] text-white/45">QR / Barcode</div>
            <div className="text-lg font-black tracking-tight mt-1">SKU Generator</div>

            <div className="mt-4">
              <input
                className="input-mech"
                placeholder="Enter SKU to generate QR"
                value={qrSku}
                onChange={(e) => setQrSku(e.target.value)}
              />

              <div className="mt-3 flex gap-2">
                <MechanicalButton className="btn-crimson w-full" onClick={async () => setQrDataUrl(await onGenerateQr())}>
                  <QrCode className="w-4 h-4" />
                  Generate
                </MechanicalButton>
                <MechanicalButton className="w-full" onClick={() => setQrDataUrl(null)}>
                  Clear
                </MechanicalButton>
              </div>

              {qrDataUrl && (
                <div className="mt-4 glass p-4 flex items-center justify-center border-crimson/30">
                  <img src={qrDataUrl} alt="SKU QR" className="w-44 h-44 rounded-xl border border-white/10" />
                </div>
              )}

              <div className="mt-3 text-xs text-white/45">
                Mock-safe: QR generation only. Use “Mock Scan” to query by SKU.
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Inventory table */}
        <div className="mt-6 glass p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-white/45">Dynamic Inventory Engine</div>
              <div className="text-lg font-black tracking-tight mt-1">{status === 'archived' ? 'Archived Parts' : 'Parts'}</div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative group">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-crimson transition" />
                <input
                  className="input-mech pl-10 w-64"
                  placeholder="Search SKU / name / bin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-56">
                <input
                  className="input-mech w-full"
                  placeholder="Category (optional)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="category_filter_list"
                />
                <datalist id="category_filter_list">
                  {categoryOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <MechanicalButton onClick={onExportPdf} className="btn-crimson">
                <FileDown className="w-4 h-4" />
                PDF
              </MechanicalButton>

              <MechanicalButton
                className="btn-crimson"
                onClick={() => setStatus(status === 'active' ? 'archived' : 'active')}
              >
                {status === 'active' ? 'Show Archived' : 'Show Active'}
              </MechanicalButton>

              <div className="chip">
                <span className="text-white/50">Results</span>
                <span className="font-bold">{inventory.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 hidden md:block">
            <div className="grid grid-cols-12 gap-3 text-xs text-white/50 px-3 pb-2">
              <div className="col-span-2">SKU</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-1">Cat</div>
              <div className="col-span-2">Bin</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {inventoryLoading ? (
              <div className="text-white/50">Loading inventory...</div>
            ) : (
              inventory.map((item) => {
                const emergency = Number(item.quantity_on_hand) <= Number(item.low_stock_threshold);
                return (
                  <RedlineRow key={item._id} emergency={emergency}>
                    <div className="col-span-12 md:col-span-2 text-sm font-semibold">{item.sku}</div>
                    <div className="col-span-12 md:col-span-3 text-sm text-white/85">{item.name}</div>
                    <div className="col-span-6 md:col-span-1">
                      <span className="chip">{item.category}</span>
                    </div>
                    <div className="col-span-6 md:col-span-2 text-sm text-white/70">{item.bin_location}</div>
                    <div className="col-span-12 md:col-span-2">
                      <div
                        className={classNames(
                          'inline-flex items-center gap-2 rounded-full px-3 py-1 border text-xs',
                          emergency
                            ? 'border-crimson/50 bg-crimson/15 text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/80'
                        )}
                      >
                        <span className={classNames('font-black', emergency ? 'text-crimson' : 'text-white')}>
                          {item.quantity_on_hand}
                        </span>
                        <span className="text-white/30">/</span>
                        <span className="text-white/60">{item.low_stock_threshold}</span>
                        {emergency && (
                          <span className="ml-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.25em] text-crimson">
                            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-2 flex md:justify-end flex-wrap gap-2">
                      {status === 'active' ? (
                        <>
                          <MechanicalButton
                            className="group border-crimson/20 hover:border-crimson/40"
                            onClick={() => handleMove({ id: item._id, direction: 'IN' })}
                          >
                            <ArrowUp className="w-4 h-4 text-white/80 group-hover:text-crimson transition" />
                            IN
                          </MechanicalButton>

                          <MechanicalButton
                            className="group"
                            onClick={() => handleMove({ id: item._id, direction: 'OUT' })}
                          >
                            <ArrowDown className="w-4 h-4 text-white/80 group-hover:text-crimson transition" />
                            OUT
                          </MechanicalButton>

                          <MechanicalButton
                            className="btn-crimson group"
                            onClick={() => handleMove({ id: item._id, direction: 'SALE' })}
                          >
                            <ShoppingCart className="w-4 h-4 text-white/90" />
                            SALE
                          </MechanicalButton>

                          <MechanicalButton
                            className="group border-white/10 hover:border-white/20"
                            onClick={async () => {
                              const ok = window.confirm(`Archive ${item.sku}?`);
                              if (!ok) return;
                              try {
                                await archiveItem.mutateAsync({ id: item._id, note: 'Operator archived item' });
                              } catch (e) {
                                console.error(e);
                                alert('Archive failed.');
                              }
                            }}
                          >
                            <Archive className="w-4 h-4 text-white/80 group-hover:text-crimson transition" />
                            Archive
                          </MechanicalButton>
                        </>
                      ) : (
                        <>
                          <MechanicalButton
                            className="group border-white/10 hover:border-white/20"
                            onClick={async () => {
                              const ok = window.confirm(`Restore ${item.sku} to active inventory?`);
                              if (!ok) return;
                              try {
                                await restoreItem.mutateAsync({ id: item._id, note: 'Operator restored item' });
                              } catch (e) {
                                console.error(e);
                                alert('Restore failed.');
                              }
                            }}
                          >
                            <Undo2 className="w-4 h-4 text-white/80 group-hover:text-crimson transition" />
                            Restore
                          </MechanicalButton>

                          <MechanicalButton
                            className="group border-crimson/30 hover:border-crimson/60 bg-crimson/10"
                            onClick={async () => {
                              const ok = window.confirm(`Permanently delete ${item.sku}? This cannot be undone.`);
                              if (!ok) return;
                              try {
                                await deletePermanently.mutateAsync({ id: item._id });
                              } catch (e) {
                                console.error(e);
                                alert('Delete failed (admin only).');
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-white/90" />
                            Delete
                          </MechanicalButton>
                        </>
                      )}
                    </div>
                  </RedlineRow>
                );
              })
            )}

            {!inventoryLoading && inventory.length === 0 && (
              <div className="text-white/50 py-8 text-center">No items found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Create modal */}
      <Modal open={createOpen} title="Add Inventory Part" onClose={() => setCreateOpen(false)}>
        <form className="space-y-3" onSubmit={onCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-white/60">SKU</span>
              <input className="input-mech mt-2" name="sku" placeholder="e.g. IMS-ABC123" required />
              <div className="text-[11px] text-white/40 mt-1">Tip: Use uppercase + hyphens.</div>
            </label>

            <label className="block">
              <span className="text-xs text-white/60">Category</span>
              <input
                className="input-mech mt-2"
                name="category"
                placeholder="e.g. Engine, Electrical, Helmet"
                list="category_list"
                required
              />
              <datalist id="category_list">
                {categoryOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-white/60">Name</span>
            <input className="input-mech mt-2" name="name" placeholder="e.g. Carbon Weave Helmet" required />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-white/60">Bin Location</span>
              <input className="input-mech mt-2" name="bin_location" placeholder="e.g. A-03-12" required />
            </label>
            <label className="block">
              <span className="text-xs text-white/60">Low-stock Threshold</span>
              <input className="input-mech mt-2" type="number" name="low_stock_threshold" defaultValue={5} min={0} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs text-white/60">Price (PHP)</span>
              <input className="input-mech mt-2" type="number" name="price_php" defaultValue={0} min={0} />
            </label>
            <label className="block">
              <span className="text-xs text-white/60">Cost (PHP)</span>
              <input className="input-mech mt-2" type="number" name="cost_php" defaultValue={0} min={0} />
            </label>
            <label className="block">
              <span className="text-xs text-white/60">Qty On Hand</span>
              <input className="input-mech mt-2" type="number" name="quantity_on_hand" defaultValue={0} min={0} />
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <MechanicalButton className="btn-crimson w-full" type="submit" disabled={createItem.isPending}>
              {createItem.isPending ? 'Forging...' : 'Create Part'}
            </MechanicalButton>
            <MechanicalButton className="w-full" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </MechanicalButton>
          </div>

          {createItem.isError && (
            <div className="glass border-crimson/40 bg-crimson/10 p-3 text-sm text-white/90">
              {createItem.error?.response?.data?.error?.message || 'Failed to create item.'}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}