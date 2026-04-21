-- ============================================
-- DATABASE MIGRATION: Add Missing Columns
-- Run this if you already have tables created
-- ============================================

-- Add cost_php column if it doesn't exist
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

-- Add low_stock_threshold column if it doesn't exist
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
