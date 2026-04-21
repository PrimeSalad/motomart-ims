-- ============================================
-- CARBON & CRIMSON IMS - COMPLETE DATABASE SCHEMA
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Drop existing tables if they exist (CAREFUL!)
-- Uncomment these lines if you want to start fresh
-- DROP TABLE IF EXISTS inventory_audit_logs CASCADE;
-- DROP TABLE IF EXISTS item_compatibilities CASCADE;
-- DROP TABLE IF EXISTS inventory_items CASCADE;
-- DROP TABLE IF EXISTS system_activity_logs CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'admin', 'super_admin')),
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INVENTORY ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  bin_location TEXT,
  quantity_on_hand INTEGER DEFAULT 0,
  sold_units INTEGER DEFAULT 0,
  price_php DECIMAL(10,2) DEFAULT 0,
  cost_php DECIMAL(10,2) DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. ITEM COMPATIBILITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS item_compatibilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  make TEXT,
  model TEXT,
  year_from INTEGER,
  year_to INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. INVENTORY AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  note TEXT,
  quantity_before INTEGER,
  quantity_after INTEGER,
  delta INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. SYSTEM ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Inventory items indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_is_archived ON inventory_items(is_archived);
CREATE INDEX IF NOT EXISTS idx_inventory_items_updated_at ON inventory_items(updated_at);

-- Item compatibilities indexes
CREATE INDEX IF NOT EXISTS idx_item_compatibilities_item_id ON item_compatibilities(item_id);
CREATE INDEX IF NOT EXISTS idx_item_compatibilities_make ON item_compatibilities(make);
CREATE INDEX IF NOT EXISTS idx_item_compatibilities_model ON item_compatibilities(model);

-- Inventory audit logs indexes
CREATE INDEX IF NOT EXISTS idx_inventory_audit_logs_item_id ON inventory_audit_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_logs_actor_user_id ON inventory_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_logs_created_at ON inventory_audit_logs(created_at);

-- System activity logs indexes
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_user_id ON system_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_created_at ON system_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_action ON system_activity_logs(action);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_compatibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. RLS POLICIES (Allow backend service role full access)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access to users" ON users;
DROP POLICY IF EXISTS "Service role full access to inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Service role full access to item_compatibilities" ON item_compatibilities;
DROP POLICY IF EXISTS "Service role full access to inventory_audit_logs" ON inventory_audit_logs;
DROP POLICY IF EXISTS "Service role full access to system_activity_logs" ON system_activity_logs;

-- Create new policies
CREATE POLICY "Service role full access to users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to inventory_items" ON inventory_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to item_compatibilities" ON item_compatibilities
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to inventory_audit_logs" ON inventory_audit_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to system_activity_logs" ON system_activity_logs
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 9. CREATE INITIAL SUPER ADMIN USER
-- ============================================
-- IMPORTANT: Change the email and full_name before running!
-- Default password: Admin#1234

INSERT INTO users (email, full_name, role, password_hash, is_active)
VALUES (
  'g.elpielandoy@gmail.com',  -- ⬅️ CHANGE THIS to your email
  'Gene Elpie Landoy',         -- ⬅️ CHANGE THIS to your name
  'super_admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgEn4i', -- Password: Admin#1234
  true
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 10. VERIFY TABLES CREATED
-- ============================================
-- Run this to check all tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- ============================================
-- SUCCESS!
-- ============================================
-- All tables created successfully!
-- 
-- Tables created:
-- ✅ users
-- ✅ inventory_items
-- ✅ item_compatibilities
-- ✅ inventory_audit_logs
-- ✅ system_activity_logs
--
-- Next steps:
-- 1. Verify tables in Supabase Table Editor
-- 2. Update backend/.env with your Supabase credentials
-- 3. Start the backend: cd backend && npm run dev
-- 4. Start the frontend: cd frontend && npm run dev
-- 5. Login with your email and password: Admin#1234
-- 6. CHANGE YOUR PASSWORD immediately!
-- ============================================
