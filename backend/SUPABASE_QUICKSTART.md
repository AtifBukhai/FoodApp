# KhaanaDa — Supabase Quick Start

**Connect your backend to Supabase PostgreSQL in 5 minutes**

---

## 🚀 Quick Setup (5 Steps)

### 1. Create Prisma User in Supabase
```sql
-- Run this in Supabase SQL Editor
create user "prisma" with password 'YOUR_SECURE_PASSWORD' bypassrls createdb;
grant "prisma" to "postgres";
grant all on all tables in schema public to prisma;
grant all on all sequences in schema public to prisma;
```

### 2. Get Connection String
- Go to Supabase Dashboard → Settings → Database → Connection string
- Select **URI** tab → **Session** mode (port 5432)
- Copy the connection string

### 3. Update .env File
```bash
cd backend
cp .env.example .env
nano .env
```

Update `DATABASE_URL`:
```bash
DATABASE_URL="postgres://prisma.PROJECT_REF:PASSWORD@REGION.pooler.supabase.com:5432/postgres"
```

### 4. Run Migrations & Seed
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Test Connection
```bash
npm run db:test
```

**Expected output:**
```
✅ ALL TESTS PASSED!
📊 Database Summary:
   • Users: 1
   • Restaurants: 2
   • Menu Items: 3
   • Orders: 0
```

---

## 📋 Full Documentation

- **Complete Guide**: [`SUPABASE_SETUP_GUIDE.md`](./SUPABASE_SETUP_GUIDE.md)
- **Troubleshooting**: See troubleshooting section in the guide
- **API Documentation**: Start backend and visit `http://localhost:3000/api/docs`

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore` ✅ (already configured)
- [ ] Using strong password for `prisma` user
- [ ] JWT_SECRET is at least 32 characters
- [ ] Never commit `.env` to Git
- [ ] Only commit `.env.example` with placeholders

---

## 🧪 Demo Credentials

After seeding, login with:
- **Email**: `demo@khaanada.pk`
- **Password**: `Demo123!`

---

## 📞 Need Help?

1. Check [`SUPABASE_SETUP_GUIDE.md`](./SUPABASE_SETUP_GUIDE.md) for detailed instructions
2. Review troubleshooting section for common errors
3. Check Supabase logs in Dashboard → Logs

---

## ✅ Verification Commands

```bash
# Test database connection
npm run db:test

# Start backend
npm run start:dev

# Open API docs
open http://localhost:3000/api/docs

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@khaanada.pk","password":"Demo123!"}'
```

---

**Ready?** Follow the 5 steps above or read the [full guide](./SUPABASE_SETUP_GUIDE.md).

*KhaanaDa — Cravings Delivered.* 🍛🚀
