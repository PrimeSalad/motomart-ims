# Pre-Deployment Security Checklist

Complete this checklist before deploying to production.

## Critical Security Items

### Environment Variables
- [ ] `JWT_SECRET` is a strong random value (not default)
- [ ] `SYSTEM_OWNER_EMAILS` is set to your admin email
- [ ] `CORS_ORIGIN` matches your frontend URL exactly
- [ ] `NODE_ENV=production` in backend
- [ ] `VITE_API_BASE_URL` points to production backend

### Authentication
- [ ] Default admin password changed from `Admin#1234`
- [ ] All test accounts removed
- [ ] Strong password policy enforced

### Database
- [ ] Supabase credentials are correct
- [ ] All tables created
- [ ] Database backups enabled

### API Security
- [ ] Rate limiting enabled (120 req/min)
- [ ] Helmet.js security headers active
- [ ] CORS properly configured (no wildcards)
- [ ] All endpoints have proper auth middleware

### Testing
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Role-based access works
- [ ] CORS allows frontend, blocks others

## Red Flags - Do NOT Deploy If:
- ❌ Using default JWT_SECRET
- ❌ Using default admin password
- ❌ .env files in Git
- ❌ CORS allows all origins (*)
- ❌ HTTP (not HTTPS) in production

## Post-Deployment
1. Test all features in production
2. Monitor logs for 24 hours
3. Document production URLs
4. Set up uptime monitoring

See SECURITY.md for complete security documentation.
