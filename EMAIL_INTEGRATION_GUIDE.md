# KhaanaDa Email Integration - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Option 1: Demo Mode (No Setup Required)

The email system works out of the box in demo mode. Emails are logged to the console instead of being sent.

```bash
# Start the backend
cd backend
npm run start:dev

# Register a user - check console for email output
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+923001234567",
    "password": "Test123!"
  }'
```

You'll see the email content logged in the console with a clear visual separator.

### Option 2: Production Mode with Resend

#### Prerequisites

1. **Create Resend Account**
   - Go to https://resend.com
   - Sign up for a free account
   - Navigate to API Keys section

2. **Verify Your Domain** (Required for production)
   - Go to Domains → Add Domain
   - Add your domain (e.g., khaanada.pk)
   - Add the DNS records shown in Resend dashboard
   - Wait for DNS propagation (up to 48 hours)
   - Domain status should show "Verified"

3. **Generate API Key**
   - Go to API Keys → Create API Key
   - Name it "KhaanaDa Production"
   - Copy the API key (starts with `re_`)

#### Configuration

1. **Update .env file**

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add:

```bash
# Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=KhaanaDa
FRONTEND_URL=https://khaanada.pk
EMAIL_ENABLED=true

# Make sure NODE_ENV is production
NODE_ENV=production
```

2. **Restart the backend**

```bash
npm run start:dev
```

3. **Test email delivery**

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-real-email@example.com",
    "phone": "+923001234567",
    "password": "Test123!"
  }'

# Check your email inbox (and spam folder)
```

4. **Verify in Resend Dashboard**
   - Go to Resend dashboard → Emails
   - You should see the sent email
   - Check delivery status

---

## 📧 Email Types

### 1. Welcome Email
Sent when a user registers successfully.

**Content:**
- Personalized greeting
- KhaanaDa branding
- Call-to-action button
- Feature highlights

**When:** Immediately after registration

### 2. Verification Email
Sent when a user registers (requires email verification).

**Content:**
- Verification link with token
- 24-hour expiration warning
- Safety message

**When:** Immediately after registration

**Token:** JWT with 24-hour expiration

### 3. Password Reset Email
Sent when user requests password reset.

**Content:**
- Reset link with token
- 1-hour expiration warning
- Security reminder

**When:** When user clicks "Forgot password?"

**Token:** JWT with 1-hour expiration

### 4. Password Changed Confirmation
Sent after successful password reset.

**Content:**
- Confirmation message
- Security warning
- Recommendations

**When:** After password is successfully changed

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Production | - | Resend API key |
| `EMAIL_FROM` | Production | `noreply@khaanada.pk` | Sender email |
| `EMAIL_FROM_NAME` | No | `KhaanaDa` | Sender name |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend URL for links |
| `EMAIL_ENABLED` | No | `false` | Force enable email |

### Mode Selection Logic

```
IF (NODE_ENV === 'production' OR EMAIL_ENABLED === 'true') 
   AND RESEND_API_KEY is set:
    → Use Resend (send real emails)
ELSE:
    → Use Console (log to console)
```

### Development Mode

```bash
NODE_ENV=development
# No RESEND_API_KEY needed
# Emails logged to console
# Tokens logged for testing
```

### Production Mode

```bash
NODE_ENV=production
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
# Real emails sent via Resend
# Tokens NOT logged (security)
```

---

## 🧪 Testing Emails

### Test Registration Flow

```bash
# 1. Start backend
npm run start:dev

# 2. Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Khan",
    "email": "ahmed@example.com",
    "phone": "+923001234567",
    "password": "SecurePass123!"
  }'

# 3. Check console for:
#    - Welcome email content
#    - Verification email content
#    - Verification token (dev mode only)
```

### Test Password Reset Flow

```bash
# 1. Request password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed@example.com"}'

# 2. Check console for:
#    - Password reset email content
#    - Reset token (dev mode only)

# 3. Use token to reset password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_CONSOLE",
    "newPassword": "NewSecurePass456!"
  }'

# 4. Check console for:
#    - Password changed confirmation email
```

### Test Email Verification

```bash
# 1. Get verification token from registration console output

# 2. Verify email
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_FROM_CONSOLE"}'

# 3. Check response:
#    {"message": "Email verified successfully"}
```

### Test Resend Verification

```bash
# 1. Resend verification email
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 2. Check console for new verification email
```

---

## 🎨 Email Template Customization

### Template Location

All templates are in: `backend/src/email/templates/email-templates.ts`

### Brand Colors

```typescript
const BRAND_COLORS = {
  orange: '#F97316',      // Primary
  orangeDark: '#EA580C',  // Hover
  green: '#166534',       // Brand
  greenDark: '#14532D',   // Dark
  cream: '#FFF8F0',       // Background
};
```

### Modifying Templates

1. **Edit template function**
   ```typescript
   export function welcomeEmailTemplate(data: EmailTemplateData) {
     const html = `...`; // Modify HTML here
     const text = `...`; // Modify plain text here
     return { html, text, subject };
   }
   ```

2. **Restart backend**
   ```bash
   npm run start:dev
   ```

3. **Test changes**
   - Register a new user
   - Check console for updated template

---

## 📊 Monitoring Email Delivery

### Resend Dashboard

1. **Go to Resend Dashboard**
   - https://resend.com
   - Login to your account

2. **Check Emails**
   - Navigate to "Emails" section
   - View sent emails
   - Check delivery status
   - See open/click rates (if enabled)

3. **Monitor Metrics**
   - Delivery rate
   - Bounce rate
   - Open rate
   - Click rate

### Application Logs

```bash
# Check backend logs for email events
npm run start:dev

# Look for:
# "Email sent successfully to user@example.com (ID: ...)"
# "Failed to send email to user@example.com: ..."
```

---

## 🐛 Troubleshooting

### Emails Not Sending

**Problem:** Emails not appearing in Resend dashboard

**Solutions:**
1. Check `RESEND_API_KEY` is set correctly
2. Verify `NODE_ENV=production`
3. Check domain is verified in Resend
4. Check Resend dashboard for errors
5. Verify sender email is verified

### Emails Going to Spam

**Problem:** Emails landing in spam folder

**Solutions:**
1. Verify sender domain in Resend
2. Add SPF, DKIM, DMARC records
3. Use consistent sender email
4. Avoid spam trigger words
5. Include plain text version

### Console Mode Not Working

**Problem:** Console not showing emails

**Solutions:**
1. Check `NODE_ENV=development`
2. Ensure `RESEND_API_KEY` is NOT set
3. Restart backend
4. Check terminal output

### Token Not Appearing in Logs

**Problem:** Tokens not logged in development

**Solutions:**
1. Verify `NODE_ENV=development`
2. Check email service is using console mode
3. Look for `[DEV]` prefix in logs

---

## 🔒 Security Best Practices

### For Production

1. **Never commit .env file**
   ```bash
   # .env is in .gitignore
   # Never add it to git
   ```

2. **Use strong API keys**
   - Resend API keys are long and secure
   - Never share or expose them
   - Rotate keys periodically

3. **Verify sender domain**
   - Prevents spoofing
   - Improves deliverability
   - Required for production

4. **Monitor email logs**
   - Check for suspicious activity
   - Monitor bounce rates
   - Track delivery success

### For Development

1. **Use console mode**
   - No real emails sent
   - Tokens logged for testing
   - Safe for local development

2. **Test with dummy emails**
   - Use test@example.com
   - Don't send to real users
   - Avoid spam complaints

3. **Review logs carefully**
   - Tokens visible in dev mode
   - Don't share log output
   - Clear logs regularly

---

## 📚 Additional Resources

### Resend Documentation
- https://resend.com/docs
- API reference: https://resend.com/docs/api-reference
- Best practices: https://resend.com/blog

### Email Design
- Responsive email patterns: https://responsiveemailpatterns.com
- Email on acid: https://www.emailonacid.com
- Litmus: https://litmus.com

### Security
- OWASP email security: https://owasp.org/www-project-web-security-testing-guide/
- JWT best practices: https://tools.ietf.org/html/rfc7519

---

## ✅ Checklist

### Before Going to Production

- [ ] Resend account created
- [ ] Sender domain verified
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] API key generated
- [ ] Environment variables set
- [ ] Test email sent successfully
- [ ] Email templates reviewed
- [ ] Mobile responsiveness tested
- [ ] Links working in emails
- [ ] Security review completed
- [ ] Monitoring set up
- [ ] Backup plan for email failures

### Development Setup

- [ ] Backend running
- [ ] Console mode working
- [ ] Test registration flow
- [ ] Test password reset flow
- [ ] Test email verification
- [ ] Templates rendering correctly
- [ ] Tokens appearing in logs

---

## 🎯 Success Criteria

Your email integration is working when:

✅ **Demo Mode:**
- Emails logged to console
- Tokens visible in logs
- All email types generated
- Templates rendering correctly

✅ **Production Mode:**
- Emails sent via Resend
- Appearing in Resend dashboard
- Delivered to inbox (not spam)
- Links working correctly
- Mobile responsive

---

**Need Help?**

- Check `MILESTONE_5_COMPLETION.md` for full documentation
- Review inline code comments
- Check Resend documentation: https://resend.com/docs
- Review backend logs for errors

---

**Built with ❤️ for KhaanaDa — Cravings Delivered** 🍛🚀
