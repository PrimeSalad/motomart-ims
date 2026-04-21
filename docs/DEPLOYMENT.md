# Deployment Guide - MotoMart IMS

This guide covers deploying the frontend to Vercel and the backend to Render.

## Security Improvements Made

### Backend Security
- ✅ Helmet.js for security headers
- ✅ Rate limiting (120 requests per minute)
- ✅ Strong password validation (min 8 chars, uppercase, lowercase, number)
- ✅ Bcrypt salt rounds increased to 12
- ✅ JWT secret validation in production
- ✅ CORS with credentials support
- ✅ Request body size limits (10MB)
- ✅ Server fingerprint removal
- ✅ Input sanitization and validation
- ✅ Protected system owner accounts
- ✅ Role-based access control (RBAC)

### Frontend Security
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- ✅ XSS protection
- ✅ Secure token storage (localStorage/sessionStorage)
- ✅ HTTPS enforcement in production

## Prerequisites

1. **Supabase Account** - Database hosting
2. **Vercel Account** - Frontend hosting
3. **Render Account** - Backend hosting
4. **Git Repository** - Push your code to GitHub/GitLab

## Step 1: Setup Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your credentials:
   - Project URL: `https://your-project-ref.supabase.co`
   - Service Role Key: Found in Settings > API
3. Create the required tables (users, inventory, etc.) using your existing schema

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [render.com](https://render.com) and create a new account
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will detect `render.yaml` automatically
6. Set the following environment variables in Render dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `JWT_SECRET`: Generate a strong random secret (use: `openssl rand -base64 32`)
   - `CORS_ORIGIN`: Your Vercel frontend URL (add after frontend deployment)
   - `APP_PUBLIC_URL`: Your Vercel frontend URL (add after frontend deployment)
   - `SYSTEM_OWNER_EMAILS`: Your admin email address
7. Click "Apply" to deploy

### Option B: Manual Setup

1. Go to Render dashboard
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: motomart-ims-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add all environment variables from `backend/.env.production.example`
6. Click "Create Web Service"

### Get Your Backend URL

After deployment, your backend URL will be:
```
https://your-backend-app.onrender.com
```

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and create an account
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL`: Your Render backend URL + `/api`
   - Example: `https://your-backend-app.onrender.com/api`
6. Click "Deploy"

### Get Your Frontend URL

After deployment, your frontend URL will be:
```
https://your-app.vercel.app
```

## Step 4: Update Backend CORS Settings

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Update these variables:
   - `CORS_ORIGIN`: `https://your-app.vercel.app`
   - `APP_PUBLIC_URL`: `https://your-app.vercel.app`
5. Save changes (this will trigger a redeploy)

## Step 5: Generate Strong JWT Secret

Generate a secure JWT secret:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Update the `JWT_SECRET` in Render environment variables.

## Step 6: Create Initial Admin User

After deployment, you need to create your first admin user. You have two options:

### Option A: Using Supabase SQL Editor

Run this SQL in your Supabase SQL Editor:

```sql
INSERT INTO users (email, full_name, role, password_hash, is_active)
VALUES (
  'your-email@example.com',
  'Admin User',
  'super_admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgEn4i', -- Password: Admin#1234
  true
);
```

**Important**: Change the password immediately after first login!

### Option B: Using Backend Script

If you have the backend running locally:

```bash
cd backend
node scripts/reset_admin.js
```

## Step 7: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try logging in with your admin credentials
3. Test the following:
   - Login/logout
   - Password change
   - User creation
   - Inventory management
   - All CRUD operations

## Security Checklist

Before going live, ensure:

- [ ] Strong JWT_SECRET is set (not the default)
- [ ] SYSTEM_OWNER_EMAILS is set to your email
- [ ] CORS_ORIGIN is set to your exact frontend URL
- [ ] Default admin password has been changed
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] Environment variables are not exposed in frontend code
- [ ] Database credentials are secure
- [ ] Rate limiting is enabled
- [ ] All test accounts are removed

## Monitoring & Maintenance

### Render (Backend)
- View logs: Dashboard → Your Service → Logs
- Monitor health: `/api/health` endpoint
- Free tier sleeps after 15 min inactivity (first request takes ~30s)

### Vercel (Frontend)
- View deployments: Dashboard → Your Project → Deployments
- Analytics: Dashboard → Your Project → Analytics
- Logs: Dashboard → Your Project → Logs

## Troubleshooting

### Backend Issues

**CORS Errors**
- Ensure `CORS_ORIGIN` matches your frontend URL exactly
- Check for trailing slashes
- Verify both HTTP and HTTPS

**Database Connection Errors**
- Verify Supabase credentials
- Check if Supabase project is active
- Ensure tables are created

**JWT Errors**
- Verify `JWT_SECRET` is set
- Check token expiration settings

### Frontend Issues

**API Connection Errors**
- Verify `VITE_API_BASE_URL` is correct
- Check if backend is running
- Test backend health endpoint directly

**Build Errors**
- Clear node_modules and reinstall
- Check for missing dependencies
- Verify Node.js version compatibility

## Environment Variables Reference

### Backend (Render)
```
NODE_ENV=production
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
JWT_SECRET=your-strong-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app.vercel.app
APP_PUBLIC_URL=https://your-app.vercel.app
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
SYSTEM_OWNER_EMAILS=your-email@example.com
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

## Cost Estimate

- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Render**: Free tier (750 hours/month, sleeps after inactivity)
- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)

**Total**: $0/month for small projects

## Support

For issues:
1. Check logs in Render/Vercel dashboards
2. Verify all environment variables
3. Test backend health endpoint
4. Check browser console for frontend errors

## Next Steps

- Set up custom domain (optional)
- Configure email service for password resets
- Enable monitoring and alerts
- Set up automated backups
- Configure CI/CD pipelines
