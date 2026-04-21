# Quick Start Guide - MotoMart IMS

Get your inventory management system running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git installed

## Step 1: Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd motomart-ims

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

## Step 2: Setup Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready (~2 minutes)
3. Go to SQL Editor and run the COMPLETE schema:
   - Open the file: `docs/COMPLETE_DATABASE_SCHEMA.sql`
   - Copy the ENTIRE contents
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter

The schema will create these tables:
- `users` - User accounts and authentication
- `inventory_items` - Product inventory
- `item_compatibilities` - Vehicle compatibility data
- `inventory_audit_logs` - Inventory change history
- `system_activity_logs` - System-wide activity tracking

4. Get your credentials:
   - Go to Settings → API
   - Copy "Project URL" (looks like: `https://xxxxx.supabase.co`)
   - Copy "service_role" key (under "Project API keys")

## Step 3: Configure Backend

1. Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your credentials:
```env
NODE_ENV=development
PORT=8080

# Supabase (paste your credentials here)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (generate a strong one)
JWT_SECRET=your-strong-random-secret-here

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:5173

# Your admin email
SYSTEM_OWNER_EMAILS=your-email@example.com
```

3. Generate a strong JWT secret:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 4: Create Admin User

The admin user is automatically created when you run the complete schema in Step 2.

**IMPORTANT**: Edit the email and name in `COMPLETE_DATABASE_SCHEMA.sql` before running it!

Default credentials:
- Email: (the one you set in the schema)
- Password: `Admin#1234`

**You MUST change this password after first login!**

## Step 5: Configure Frontend

1. Create frontend environment file:
```bash
cd frontend
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env
```

## Step 6: Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
IMS API listening on :8080 (development)
CORS: http://localhost:5173
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 7: Login & Test

1. Open your browser to `http://localhost:5173`
2. Login with:
   - Email: `your-email@example.com`
   - Password: `Admin#1234`
3. Change your password immediately:
   - Click your profile
   - Go to "Change Password"
   - Set a strong new password

## Step 8: Test Features

Try these features to verify everything works:

1. **User Management**
   - Create a new staff user
   - Create a new admin user
   - Test role permissions

2. **Inventory**
   - Add a new item
   - Update item details
   - Adjust stock levels
   - Archive an item

3. **Analytics**
   - View dashboard
   - Check inventory reports
   - Review activity logs

## Troubleshooting

### Backend won't start

**Error: "Cannot connect to database"**
- Check your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Verify Supabase project is active
- Ensure tables are created

**Error: "Port 8080 already in use"**
```bash
# Change PORT in backend/.env
PORT=8081
```

### Frontend won't start

**Error: "Cannot connect to API"**
- Verify backend is running on port 8080
- Check `VITE_API_BASE_URL` in `frontend/.env`
- Test backend health: `http://localhost:8080/api/health`

**Error: "CORS error"**
- Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
- Restart backend after changing CORS settings

### Login fails

**Error: "Invalid credentials"**
- Verify you created the admin user in Supabase
- Check the email matches exactly
- Default password is `Admin#1234` (case-sensitive)

**Error: "Token expired"**
- Clear browser localStorage
- Try logging in again

### Database errors

**Error: "relation does not exist"**
- Run the SQL schema in Supabase SQL Editor
- Verify all tables are created
- Check table names match exactly

## Next Steps

Now that you're running locally:

1. **Customize the system**
   - Update branding in `frontend/src`
   - Modify inventory fields as needed
   - Add custom reports

2. **Add more users**
   - Create staff accounts for your team
   - Set up proper roles and permissions

3. **Deploy to production**
   - Follow `DEPLOYMENT.md` for Vercel + Render setup
   - Use strong secrets in production
   - Enable HTTPS

4. **Configure optional features**
   - Email service (SMTP) for password resets
   - Gemini AI for smart features
   - Custom analytics

## Security Reminders

- ✅ Change default admin password immediately
- ✅ Use strong JWT secret (not the example)
- ✅ Never commit `.env` files to Git
- ✅ Use different secrets for dev/production
- ✅ Enable HTTPS in production
- ✅ Review `SECURITY.md` for best practices

## Getting Help

- Check `DEPLOYMENT.md` for production setup
- Review `SECURITY.md` for security features
- Check logs in terminal for error details
- Verify environment variables are set correctly

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Development with auto-reload
npm start            # Production mode

# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
# Use Supabase dashboard SQL Editor for queries
```

## Success Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Can login with admin credentials
- [ ] Can create new users
- [ ] Can add inventory items
- [ ] Dashboard loads correctly
- [ ] No console errors
- [ ] Changed default password

Congratulations! Your IMS is ready to use. 🎉
