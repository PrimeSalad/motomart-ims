# MotoMart IMS - Inventory Management System

A secure, modern inventory management system built with React, Node.js, Express, and Supabase PostgreSQL. Features role-based access control, comprehensive audit logging, and a beautiful dark-themed UI.

## 🚀 Quick Links

- [Quick Start Guide](docs/QUICKSTART.md) - Get running in 5 minutes
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to Vercel + Render
- [Security Documentation](docs/SECURITY.md) - Security features and best practices
- [All Documentation](docs/README.md) - Complete documentation index

## ✨ Features

### Core Functionality
- 📦 Complete inventory management (CRUD operations)
- 👥 User management with role-based access control
- 📊 Real-time analytics and reporting
- 🔍 Advanced search and filtering
- 📱 Responsive design for all devices
- 🌙 Beautiful dark-themed UI with MotoMart design

### Security Features
- 🔐 JWT-based authentication
- 🛡️ Role-based access control (Staff, Admin, Super Admin)
- 🔒 Bcrypt password hashing (12 rounds)
- 🚦 Rate limiting (120 req/min)
- 🔑 Strong password requirements
- 📝 Comprehensive audit logging
- 🛡️ Helmet.js security headers
- 🚫 CORS protection
- 🔐 Protected system owner accounts

### User Roles

| Role | Permissions |
|------|-------------|
| **Staff** | View inventory, create/update items, basic operations |
| **Admin** | All staff permissions + user management, advanced operations |
| **Super Admin** | Full system access, can manage all users including admins |

## 🏗️ Tech Stack

### Frontend
- React 18
- React Router v6
- TanStack Query (React Query)
- Axios
- Framer Motion
- Tailwind CSS
- Lucide Icons
- Recharts (Analytics)
- jsPDF (Export)

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL)
- JWT (jsonwebtoken)
- Bcrypt
- Helmet.js
- Express Rate Limit
- Nodemailer (Email)

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account (free tier works)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd motomart-ims
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema (see [Quick Start Guide](docs/QUICKSTART.md))
3. Get your credentials from Settings → API

### 4. Configure Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=8080

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=your-strong-random-secret
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
APP_PUBLIC_URL=http://localhost:5173

SYSTEM_OWNER_EMAILS=your-email@example.com
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 5. Create Admin User

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO users (email, full_name, role, password_hash, is_active)
VALUES (
  'your-email@example.com',
  'Admin User',
  'super_admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEgEn4i',
  true
);
```

Default password: `Admin#1234` (change immediately after login!)

### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` and login with your credentials.

## 📦 Deployment

### Production Deployment (Vercel + Render)

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

**Quick Summary:**
1. Deploy backend to Render (free tier)
2. Deploy frontend to Vercel (free tier)
3. Update environment variables
4. Configure CORS settings

**Cost:** $0/month for small projects

## 🔒 Security

This system implements enterprise-grade security features:

- ✅ JWT authentication with secure token handling
- ✅ Bcrypt password hashing (12 salt rounds)
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, number)
- ✅ Rate limiting (120 requests per minute)
- ✅ CORS protection with whitelist
- ✅ Security headers (Helmet.js)
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Protected system owner accounts
- ✅ Comprehensive audit logging
- ✅ XSS protection
- ✅ HTTPS enforcement in production

See [Security Documentation](docs/SECURITY.md) for complete security documentation.

## 📚 Documentation

- [Quick Start Guide](docs/QUICKSTART.md) - Quick start guide for local development
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment guide
- [Security Documentation](docs/SECURITY.md) - Security features and best practices
- [All Documentation](docs/README.md) - Complete documentation index

## 🛠️ Development

### Project Structure

```
motomart-ims/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── .env                # Environment variables
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utilities
│   │   ├── routes/         # Route components
│   │   ├── state/          # State management
│   │   ├── views/          # Page components
│   │   └── widgets/        # Reusable components
│   └── .env                # Environment variables
└── README.md
```

### Available Scripts

**Backend:**
```bash
npm run dev      # Development with auto-reload
npm start        # Production mode
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL exactly
- Restart backend after changing CORS settings

**Database Connection Errors**
- Check Supabase credentials
- Verify Supabase project is active
- Ensure database tables are created

**Login Fails**
- Verify admin user was created in database
- Check email matches exactly
- Default password is `Admin#1234` (case-sensitive)

See [Quick Start Guide](docs/QUICKSTART.md) for more troubleshooting tips.

## 📝 API Documentation

### Authentication Endpoints

```
POST /api/auth/login              # Login
POST /api/auth/forgot-password    # Request password reset
POST /api/auth/reset-password     # Reset password
POST /api/auth/change-password    # Change password (authenticated)
```

### User Management

```
GET    /api/users                 # List users (Staff+)
POST   /api/users                 # Create user (Admin+)
PATCH  /api/users/:id/status      # Toggle user status (Admin+)
DELETE /api/users/:id             # Delete user (Admin+)
PATCH  /api/users/profile         # Update own profile
```

### Inventory Management

```
GET    /api/inventory             # List items
GET    /api/inventory/:id         # Get item by ID
GET    /api/inventory/sku/:sku    # Get item by SKU
POST   /api/inventory             # Create item (Staff+)
PUT    /api/inventory/:id         # Update item (Staff+)
PATCH  /api/inventory/:id/archive # Archive item (Staff+)
PATCH  /api/inventory/:id/restore # Restore item (Staff+)
DELETE /api/inventory/:id/permanent # Delete permanently (Admin+)
PATCH  /api/inventory/:id/stock   # Adjust stock (Staff+)
```

### Analytics

```
GET /api/analytics/summary        # Dashboard summary
GET /api/analytics/low-stock      # Low stock items
GET /api/analytics/top-items      # Top items by value
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👨‍💻 Developed By

**DotOrbit**

## 🙏 Acknowledgments

- React team for the amazing framework
- Supabase for the database platform
- Vercel and Render for hosting
- All open-source contributors

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the troubleshooting section
3. Check logs in terminal/dashboard
4. Open an issue on GitHub

---

**Note:** This is a production-ready system with enterprise-grade security. Always follow security best practices and keep dependencies updated.
