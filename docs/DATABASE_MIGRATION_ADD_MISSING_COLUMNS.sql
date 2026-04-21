-- ============================================
-- DATABASE MIGRATION: Add Missing Columns
-- Run this if you already have tables created
-- ============================================

-- Add missing columns to inventory_items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'cost_php'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN cost_php DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE 'Added cost_php column';
  ELSE
    RAISE NOTICE 'cost_php column already exists';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' 
    AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;
    RAISE NOTICE 'Added low_stock_threshold column';
  ELSE
    RAISE NOTICE 'low_stock_threshold column already exists';
  END IF;
END $$;

-- Add missing columns to system_activity_logs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_activity_logs' 
    AND column_name = 'user_name'
  ) THEN
    ALTER TABLE system_activity_logs ADD COLUMN user_name TEXT;
    RAISE NOTICE 'Added user_name column';
  ELSE
    RAISE NOTICE 'user_name column already exists';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_activity_logs' 
    AND column_name = 'user_email'
  ) THEN
    ALTER TABLE system_activity_logs ADD COLUMN user_email TEXT;
    RAISE NOTICE 'Added user_email column';
  ELSE
    RAISE NOTICE 'user_email column already exists';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_activity_logs' 
    AND column_name = 'resource'
  ) THEN
    ALTER TABLE system_activity_logs ADD COLUMN resource TEXT;
    RAISE NOTICE 'Added resource column';
  ELSE
    RAISE NOTICE 'resource column already exists';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_activity_logs' 
    AND column_name = 'status_code'
  ) THEN
    ALTER TABLE system_activity_logs ADD COLUMN status_code INTEGER;
    RAISE NOTICE 'Added status_code column';
  ELSE
    RAISE NOTICE 'status_code column already exists';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_activity_logs' 
    AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE system_activity_logs ADD COLUMN ip_address TEXT;
    RAISE NOTICE 'Added ip_address column';
  ELSE
    RAISE NOTICE 'ip_address column already exists';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_activity_logs' 
    AND column_name = 'details'
  ) THEN
    ALTER TABLE system_activity_logs ADD COLUMN details JSONB;
    RAISE NOTICE 'Added details column';
  ELSE
    RAISE NOTICE 'details column already exists';
  END IF;
END $$;

-- Update existing rows to have default values
UPDATE inventory_items 
SET cost_php = 0 
WHERE cost_php IS NULL;

UPDATE inventory_items 
SET low_stock_threshold = 5 
WHERE low_stock_threshold IS NULL;

-- ============================================
-- DONE!
-- ============================================
-- Run this query to verify columns exist:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'inventory_items' 
-- ORDER BY ordinal_position;
