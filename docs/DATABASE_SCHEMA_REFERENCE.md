# Database Schema Reference

Complete reference ng lahat ng tables at columns sa Carbon & Crimson IMS.

## Tables Overview

1. **users** - User accounts and authentication
2. **inventory_items** - Product inventory
3. **item_compatibilities** - Vehicle compatibility data
4. **inventory_audit_logs** - Inventory change history
5. **system_activity_logs** - System-wide activity tracking

---

## 1. users

User accounts with role-based access control.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| email | TEXT | - | Unique email address |
| full_name | TEXT | - | User's full name |
| role | TEXT | - | staff, admin, or super_admin |
| password_hash | TEXT | - | Bcrypt hashed password |
| is_active | BOOLEAN | true | Account active status |
| created_at | TIMESTAMPTZ | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOW() | Last update timestamp |

**Indexes:**
- idx_users_email (email)
- idx_users_role (role)
- idx_users_is_active (is_active)

---

## 2. inventory_items

Main inventory table for products.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| sku | TEXT | - | Unique stock keeping unit |
| name | TEXT | - | Product name |
| category | TEXT | - | Product category |
| bin_location | TEXT | - | Physical storage location |
| quantity_on_hand | INTEGER | 0 | Current stock quantity |
| sold_units | INTEGER | 0 | Total units sold |
| price_php | DECIMAL(10,2) | 0 | Selling price in PHP |
| cost_php | DECIMAL(10,2) | 0 | Cost price in PHP |
| low_stock_threshold | INTEGER | 5 | Alert threshold for low stock |
| is_archived | BOOLEAN | false | Archive status |
| archived_at | TIMESTAMPTZ | - | Archive timestamp |
| archived_by_user_id | UUID | - | User who archived (FK to users) |
| created_at | TIMESTAMPTZ | NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOW() | Last update timestamp |

**Indexes:**
- idx_inventory_items_sku (sku)
- idx_inventory_items_category (category)
- idx_inventory_items_is_archived (is_archived)
- idx_inventory_items_updated_at (updated_at)

---

## 3. item_compatibilities

Vehicle compatibility information for inventory items.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| item_id | UUID | - | FK to inventory_items (CASCADE DELETE) |
| make | TEXT | - | Vehicle make/manufacturer |
| model | TEXT | - | Vehicle model |
| year_from | INTEGER | - | Starting year of compatibility |
| year_to | INTEGER | - | Ending year of compatibility |
| created_at | TIMESTAMPTZ | NOW() | Creation timestamp |

**Indexes:**
- idx_item_compatibilities_item_id (item_id)
- idx_item_compatibilities_make (make)
- idx_item_compatibilities_model (model)

---

## 4. inventory_audit_logs

Audit trail for all inventory changes.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| item_id | UUID | - | FK to inventory_items (CASCADE DELETE) |
| actor_user_id | UUID | - | User who performed action (FK to users) |
| action | TEXT | - | Action type (CREATE, UPDATE, ARCHIVE, RESTORE, STOCK_MOVE) |
| note | TEXT | - | Additional notes |
| quantity_before | INTEGER | - | Quantity before change |
| quantity_after | INTEGER | - | Quantity after change |
| delta | INTEGER | - | Change amount (+ or -) |
| created_at | TIMESTAMPTZ | NOW() | Action timestamp |

**Indexes:**
- idx_inventory_audit_logs_item_id (item_id)
- idx_inventory_audit_logs_actor_user_id (actor_user_id)
- idx_inventory_audit_logs_created_at (created_at)

---

## 5. system_activity_logs

System-wide activity logging for all mutations.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| user_id | UUID | - | FK to users |
| user_name | TEXT | - | User's name (denormalized) |
| user_email | TEXT | - | User's email (denormalized) |
| action | TEXT | - | HTTP method or custom action |
| resource | TEXT | - | API endpoint/resource |
| status_code | INTEGER | - | HTTP response status code |
| ip_address | TEXT | - | Client IP address |
| details | JSONB | - | Request details (params, query, body) |
| metadata | JSONB | - | Additional metadata |
| created_at | TIMESTAMPTZ | NOW() | Action timestamp |

**Indexes:**
- idx_system_activity_logs_user_id (user_id)
- idx_system_activity_logs_created_at (created_at)
- idx_system_activity_logs_action (action)

---

## Relationships

```
users (1) ----< (N) inventory_items (archived_by_user_id)
users (1) ----< (N) inventory_audit_logs (actor_user_id)
users (1) ----< (N) system_activity_logs (user_id)

inventory_items (1) ----< (N) item_compatibilities (item_id) [CASCADE DELETE]
inventory_items (1) ----< (N) inventory_audit_logs (item_id) [CASCADE DELETE]
```

---

## Row Level Security (RLS)

All tables have RLS enabled with policies that allow full access to the service role key.

**Policy Name Format:**
- "Service role full access to {table_name}"

**Policy Rules:**
- FOR ALL USING (true) WITH CHECK (true)

This allows the backend (using service_role key) to perform all operations while keeping the database secure from direct client access.

---

## Common Queries

### Check if all tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check columns for a specific table
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;
```

### Check all indexes
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check RLS policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Migration Notes

If you already have tables created and need to add missing columns, use:
- `docs/DATABASE_MIGRATION_ADD_MISSING_COLUMNS.sql`

For a fresh installation, use:
- `docs/COMPLETE_DATABASE_SCHEMA.sql`
