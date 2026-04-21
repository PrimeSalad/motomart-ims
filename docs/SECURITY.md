# Security Documentation - Carbon & Crimson IMS

## Overview

This document outlines the security measures implemented in the Carbon & Crimson Inventory Management System.

## Security Features Implemented

### 1. Authentication & Authorization

#### JWT-Based Authentication
- Stateless JWT tokens with configurable expiration (default: 7 days)
- Secure token signing with strong secret keys
- Token validation on every protected endpoint
- Automatic token expiration handling

#### Role-Based Access Control (RBAC)
- Three-tier role hierarchy:
  - **Staff** (weight: 10) - Basic inventory operations
  - **Admin** (weight: 20) - User management, advanced operations
  - **Super Admin** (weight: 30) - Full system access
- Hierarchical permissions (higher roles can manage lower roles)
- Protected system owner accounts (immutable)

#### Password Security
- Bcrypt hashing with 12 salt rounds (configurable)
- Strong password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
- Secure password reset flow with time-limited tokens (30 minutes)
- Password change requires current password verification

### 2. API Security

#### Rate Limiting
- Default: 120 requests per 60 seconds per IP
- Configurable via environment variables
- Prevents brute force attacks and DoS

#### CORS Protection
- Strict origin validation
- Whitelist-based approach
- Credentials support enabled
- Preflight request handling

#### Security Headers (Helmet.js)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content Security Policy (configurable)

#### Request Validation
- Body size limits (10MB max)
- Input sanitization
- Email normalization (lowercase, trimmed)
- Type validation on all inputs

### 3. Data Protection

#### Database Security
- Supabase PostgreSQL with Row Level Security (RLS)
- Service role key for backend operations
- Parameterized queries (SQL injection prevention)
- Unique constraints on sensitive fields (email)

#### Sensitive Data Handling
- Passwords never stored in plain text
- JWT secrets required in production
- Environment variables for all secrets
- No sensitive data in logs (production)

### 4. User Management Security

#### Protected Accounts
- System owner accounts cannot be:
  - Deleted
  - Deactivated
  - Modified by other admins
- Defined via `SYSTEM_OWNER_EMAILS` environment variable

#### Hierarchical Restrictions
- Users cannot create accounts with higher roles than their own
- Only system owners can create super admin accounts
- Users cannot delete their own accounts
- Role-based visibility (staff can't see super admins)

#### Account Deactivation
- Soft delete via `is_active` flag
- Deactivated users cannot log in
- Preserves audit trail

### 5. Audit Logging

#### Activity Tracking
- All sensitive operations logged:
  - User creation/deletion/deactivation
  - Password changes
  - Login attempts
  - Inventory modifications
- Metadata includes:
  - Actor (who performed the action)
  - Target (what was affected)
  - Timestamp
  - Action type

### 6. Frontend Security

#### Token Storage
- Secure storage in localStorage (remember me) or sessionStorage
- Automatic cleanup on logout
- No tokens in URL parameters

#### XSS Prevention
- React's built-in XSS protection
- Content Security Policy headers
- Input sanitization

#### HTTPS Enforcement
- Automatic on Vercel/Render
- Secure cookie flags in production

## Security Best Practices

### For Deployment

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, randomly generated secrets
   - Rotate secrets regularly
   - Use different secrets for dev/staging/production

2. **JWT Secret Generation**
   ```bash
   # Generate a strong secret
   openssl rand -base64 32
   ```

3. **Database Access**
   - Use service role key only in backend
   - Never expose database credentials to frontend
   - Enable Supabase RLS policies
   - Regular backups

4. **CORS Configuration**
   - Set exact frontend URL (no wildcards in production)
   - No trailing slashes
   - Update when domain changes

5. **Rate Limiting**
   - Adjust based on expected traffic
   - Monitor for abuse patterns
   - Consider IP whitelisting for admin operations

### For Development

1. **Local Development**
   - Use separate database for development
   - Don't use production credentials locally
   - Test with non-sensitive data

2. **Code Review**
   - Review all authentication/authorization changes
   - Check for hardcoded secrets
   - Validate input handling

3. **Testing**
   - Test all RBAC scenarios
   - Verify rate limiting
   - Test password reset flow
   - Check for privilege escalation

## Known Security Considerations

### 1. Password Reset
- Reset tokens valid for 30 minutes
- Tokens are single-use (stateless JWT)
- Email delivery required for security
- Consider implementing:
  - Email verification on signup
  - 2FA for admin accounts
  - Password reset attempt limiting

### 2. Session Management
- JWT tokens don't support server-side revocation
- Token remains valid until expiration
- Consider implementing:
  - Token blacklist for logout
  - Refresh token rotation
  - Device tracking

### 3. Rate Limiting
- IP-based limiting can be bypassed with proxies
- Consider implementing:
  - Account-based rate limiting
  - CAPTCHA for repeated failures
  - Temporary account locks

### 4. Audit Logging
- Logs stored in database (can grow large)
- Consider implementing:
  - Log rotation
  - External log aggregation
  - Retention policies

## Incident Response

### If Credentials Are Compromised

1. **Immediate Actions**
   - Rotate JWT_SECRET immediately
   - Invalidate all active sessions
   - Reset affected user passwords
   - Review audit logs for suspicious activity

2. **Investigation**
   - Check access logs
   - Identify affected accounts
   - Determine scope of breach
   - Document timeline

3. **Recovery**
   - Notify affected users
   - Force password resets
   - Update security measures
   - Post-mortem analysis

### Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT open a public issue
2. Email security contact: [your-email]
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Compliance Checklist

Before production deployment:

- [ ] Strong JWT_SECRET set (not default)
- [ ] SYSTEM_OWNER_EMAILS configured
- [ ] CORS_ORIGIN set to exact frontend URL
- [ ] Rate limiting enabled and configured
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Default admin password changed
- [ ] Database backups configured
- [ ] Audit logging enabled
- [ ] Error messages don't leak sensitive info
- [ ] All test accounts removed
- [ ] Environment variables secured
- [ ] Security headers verified
- [ ] Password policy enforced
- [ ] RBAC tested thoroughly

## Security Updates

### Version 2.0.0 (Current)
- ✅ Added Helmet.js security headers
- ✅ Implemented rate limiting
- ✅ Strong password validation
- ✅ Increased bcrypt rounds to 12
- ✅ JWT secret validation in production
- ✅ CORS credentials support
- ✅ Request body size limits
- ✅ Server fingerprint removal
- ✅ Input sanitization
- ✅ Protected system owner accounts

### Planned Improvements
- [ ] 2FA for admin accounts
- [ ] Email verification on signup
- [ ] Token refresh mechanism
- [ ] Account lockout after failed attempts
- [ ] CAPTCHA integration
- [ ] Security event notifications
- [ ] Advanced audit log filtering
- [ ] IP whitelisting for admin operations

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Contact

For security concerns or questions:
- Email: [your-security-email]
- Response time: 24-48 hours
