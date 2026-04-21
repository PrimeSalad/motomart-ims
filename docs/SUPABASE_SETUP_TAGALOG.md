# Supabase Setup Guide (Tagalog) - Para sa Beginners

Sundin lang ito step-by-step. May screenshots description para mas madali!

---

## Part 1: Gumawa ng Supabase Account at Project

### Step 1: Pumunta sa Supabase Website

1. Open browser mo
2. Pumunta sa: **https://supabase.com**
3. Click ang **"Start your project"** button (green button sa gitna)

### Step 2: Mag-sign Up o Login

**Kung wala ka pang account:**
1. Click **"Sign Up"**
2. Pwede mo gamitin:
   - GitHub account (recommended - 1 click lang)
   - O email address mo
3. Verify email kung ginamit mo email

**Kung meron ka na:**
1. Click **"Sign In"**
2. Login gamit ang GitHub o email

### Step 3: Create New Project

1. Pagkatapos mag-login, makikita mo ang **Dashboard**
2. Click ang **"New Project"** button (green button sa taas)
3. Kung first time mo, kailangan mo munang gumawa ng **Organization**:
   - Click **"New organization"**
   - Lagay ng name (example: "My Company" o kahit ano)
   - Click **"Create organization"**

### Step 4: I-fill Up ang Project Details

Makikita mo ang form na may mga fields na ito:

**1. Name** (Project name)
```
motomart-ims
```
O kahit anong gusto mo

**2. Database Password**
- Click ang **"Generate a password"** button
- **IMPORTANTE:** I-copy at i-save ito sa notepad!
- Kailangan mo ito later (pero hindi sa backend code)

**3. Region** (Piliin ang pinakamalapit sa location mo)
```
Northeast Asia (Seoul)
```
Ito ang pinakamabilis para sa Pilipinas

**4. Pricing Plan**
```
Free
```
Sapat na ito para sa development at small projects

5. Click **"Create new project"**

### Step 5: Hintayin ang Setup (2-3 minutes)

- Makikita mo ang loading screen na "Setting up project..."
- Mag-antay lang ng 2-3 minutes
- Pag tapos na, makikita mo ang Project Dashboard

---

## Part 2: I-setup ang Database Tables

### Step 6: Pumunta sa SQL Editor

1. Sa left sidebar, hanapin ang **"SQL Editor"** icon (parang </> symbol)
2. Click **"SQL Editor"**
3. Click **"New query"** button

### Step 7: I-copy at I-paste ang Database Schema

1. I-copy ang BUONG code na ito:

```sql
-- ============================================
-- MOTOMART IMS DATABASE SCHEMA
-- I-copy at i-paste lang ito sa SQL Editor
-- ============================================

-- 1. USERS TABLE (Para sa mga users ng system)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'admin', 'super_admin')),
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVENTORY TABLE (Para sa mga items/products)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  model TEXT,
  quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2),
  location TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACTIVITY LOGS TABLE (Para sa audit trail)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES (Para mas mabilis ang queries)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- 5. ROW LEVEL SECURITY (Para sa security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES (Pahintulutan ang backend na mag-access)
CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything on inventory" ON inventory
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything on activity_logs" ON activity_logs
  FOR ALL USING (true);
```

2. **I-paste** sa SQL Editor (yung malaking white box)
3. Click ang **"Run"** button (green button sa baba) o press **Ctrl+Enter**
4. Dapat makita mo ang message: **"Success. No rows returned"**

### Step 8: I-verify na Na-create ang Tables

1. Sa left sidebar, click ang **"Table Editor"** icon (parang table symbol)
2. Dapat makita mo ang 3 tables:
   - **users**
   - **inventory**
   - **activity_logs**

Kung nakita mo yan, SUCCESS! ✅

---

## Part 3: I-create ang First Admin User

### Step 9: Bumalik sa SQL Editor

1. Click ulit ang **"SQL Editor"** sa left sidebar
2. Click **"New query"**

### Step 10: I-create ang Admin Account

1. I-copy ang code na ito:

```sql
-- I-CREATE ANG ADMIN USER
-- IMPORTANTE: Palitan ang email at name mo!

INSERT INTO users (email, full_name, role, password_hash, is_active)
VALUES (
  'g.elpielandoy@gmail.com',  -- ⬅️ PALITAN MO ITO ng iyong email
  'Gene Elpie Landoy',           -- ⬅️ PALITAN MO ITO ng iyong pangalan
  'super_admin',              -- Wag palitan (ito ang role)
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgEn4i', -- Wag palitan (password hash)
  true                        -- Wag palitan (active status)
);
```

2. **IMPORTANTE:** Bago i-paste, palitan mo muna ang:
   - `your-email@example.com` → Lagay ng iyong email (example: `juan@gmail.com`)
   - `Your Full Name` → Lagay ng iyong pangalan (example: `Juan Dela Cruz`)

3. I-paste sa SQL Editor
4. Click **"Run"** o press **Ctrl+Enter**
5. Dapat makita mo: **"Success. 1 row affected"**

**Default Password:** `Admin#1234`
(Papalitan mo ito later pagkatapos mag-login)

### Step 11: I-verify ang Admin User

1. Click ang **"Table Editor"** sa left sidebar
2. Click ang **"users"** table
3. Dapat makita mo ang 1 row na may:
   - Email mo
   - Full name mo
   - Role: super_admin
   - is_active: true

---

## Part 4: Kunin ang API Credentials

### Step 12: Pumunta sa Project Settings

1. Sa left sidebar, scroll down
2. Click ang **"Project Settings"** icon (gear/settings icon sa pinakababa)
3. Click **"API"** sa submenu

### Step 13: I-copy ang Credentials

Makikita mo ang dalawang importante:

**1. Project URL**
```
https://xxxxxxxxxxxxx.supabase.co
```
- Naka-display ito sa taas
- May **"Copy"** button sa tabi
- Click copy at i-save sa notepad

**2. Service Role Key** (anon key HINDI ito!)
- Scroll down sa **"Project API keys"** section
- Hanapin ang **"service_role"** (hindi yung "anon"!)
- May **"Reveal"** button - click ito
- May **"Copy"** button - click ito
- I-save sa notepad

**IMPORTANTE:** Huwag i-share ang service_role key sa kahit kanino!

---

## Part 5: I-connect sa Backend

### Step 14: I-update ang Backend .env File

1. Sa VS Code o text editor mo, open ang file:
```
backend/.env
```

2. Hanapin ang dalawang lines na ito:
```env
SUPABASE_URL=https://vmjwqocncauyjjqgzhka.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **I-replace** ng bagong credentials mo:
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(I-paste yung na-copy mo sa Step 13)

4. **I-update din ang SYSTEM_OWNER_EMAILS:**
```env
SYSTEM_OWNER_EMAILS=your-email@example.com
```
(Gamitin ang SAME email na ginamit mo sa Step 10)

5. **I-save** ang file (Ctrl+S)

### Step 15: I-restart ang Backend

1. Kung running na ang backend mo, i-stop muna (Ctrl+C sa terminal)
2. I-start ulit:

```bash
cd backend
npm run dev
```

3. Dapat makita mo ang message:
```
IMS API listening on :8080 (development)
CORS: http://localhost:5173
```

---

## Part 6: I-test ang Connection

### Step 16: I-test ang Health Endpoint

1. Open browser
2. Pumunta sa: **http://localhost:8080/api/health**
3. Dapat makita mo:
```json
{"ok":true}
```

Kung nakita mo yan, SUCCESS! Backend is connected to Supabase! ✅

### Step 17: I-test ang Login

1. Siguraduhin na running ang frontend:
```bash
cd frontend
npm run dev
```

2. Open browser sa: **http://localhost:5173**

3. I-login gamit ang:
   - **Email:** Yung email na ginamit mo sa Step 10
   - **Password:** `Admin#1234`

4. Kung nag-login ka successfully, SUCCESS! ✅

### Step 18: Palitan ang Password (IMPORTANTE!)

1. Pagkatapos mag-login, click ang profile icon sa taas
2. Click **"Change Password"**
3. I-type:
   - **Current Password:** `Admin#1234`
   - **New Password:** Gumawa ng strong password (min 8 chars, may uppercase, lowercase, number)
4. Click **"Change Password"**

---

## ✅ TAPOS NA! Checklist

Siguraduhin na lahat ng ito ay natapos:

- [ ] May Supabase account na
- [ ] May bagong project na
- [ ] Na-create na ang 3 tables (users, inventory, activity_logs)
- [ ] May admin user na sa database
- [ ] Na-copy na ang Project URL at Service Role Key
- [ ] Na-update na ang backend/.env
- [ ] Na-restart na ang backend
- [ ] Nag-test na ng health endpoint (nakita ang {"ok":true})
- [ ] Successfully nag-login sa frontend
- [ ] Na-change na ang default password

---

## 🆘 Troubleshooting (Kung may problema)

### Problem: "Cannot connect to database"

**Solution:**
1. Check kung tama ang SUPABASE_URL sa backend/.env
2. Check kung tama ang SUPABASE_SERVICE_ROLE_KEY
3. I-verify na active ang Supabase project (pumunta sa dashboard)
4. I-restart ang backend

### Problem: "User not found" sa login

**Solution:**
1. Pumunta sa Supabase → Table Editor → users table
2. I-verify na may user na
3. Check kung tama ang email na ini-type mo
4. Check kung is_active = true

### Problem: "relation does not exist"

**Solution:**
1. Bumalik sa Step 7
2. I-run ulit ang SQL schema
3. I-verify sa Table Editor na may 3 tables

### Problem: Hindi maka-login kahit tama ang credentials

**Solution:**
1. Check kung running ang backend (port 8080)
2. Check kung tama ang VITE_API_BASE_URL sa frontend/.env
3. I-clear ang browser cache o try incognito mode
4. Check browser console for errors (F12)

---

## 📱 Mga Importante Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Docs:** https://supabase.com/docs
- **Backend Health Check:** http://localhost:8080/api/health
- **Frontend:** http://localhost:5173

---

## 💡 Tips

1. **I-save ang credentials mo** sa secure place (password manager)
2. **Huwag i-commit ang .env file** sa Git (naka-gitignore na)
3. **Regular backup** ng database (Supabase may automatic backups)
4. **Monitor ang usage** sa Supabase dashboard (may free tier limits)

---

## 🎉 Congratulations!

Tapos mo na ang Supabase setup! Ngayon pwede mo na gamitin ang IMS system mo.

Kung may tanong pa, check ang:
- QUICKSTART.md - Para sa local development
- DEPLOYMENT.md - Para sa production deployment
- SECURITY.md - Para sa security features

Good luck sa project mo! 🚀
