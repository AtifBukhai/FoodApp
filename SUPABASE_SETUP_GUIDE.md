# KhaanaDa — Supabase Database Setup Guide

**Version**: 1.0  
**Last Updated**: 2024-01-16

---

## Overview

This guide walks you through connecting your KhaanaDa backend to a Supabase PostgreSQL database. Supabase provides a managed PostgreSQL instance with connection pooling, backups, and a dashboard for database management.

**What you'll accomplish**:
- ✅ Create a custom database user for Prisma
- ✅ Configure your backend to use Supabase
- ✅ Run database migrations
- ✅ Seed development data
- ✅ Verify the connection works

**Time required**: 15-20 minutes

---

## Prerequisites

Before starting, ensure you have:

1. ✅ **Supabase Account**: Sign up at [supabase.com](https://supabase.com) (free tier available)
2. ✅ **Supabase Project**: Create a new project or use an existing one
3. ✅ **Node.js 18+** and npm installed
4. ✅ **Backend dependencies installed**: `cd backend && npm install`

---

## Step 1: Create Custom Prisma User in Supabase

**Why**: Supabase recommends creating a dedicated user for Prisma with specific permissions. This provides better security and monitoring.

### Instructions

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the following SQL** to create the Prisma user:

```sql
-- Create custom user for Prisma
create user "prisma" with password 'your_secure_password_here' bypassrls createdb;

-- Grant prisma role to postgres (necessary for dashboard visibility)
grant "prisma" to "postgres";

-- Grant permissions on public schema
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;

-- Set default privileges for future tables
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

**Important**: 
- Replace `'your_secure_password_here'` with a strong password (use a password generator)
- **Save this password** — you'll need it for the connection string
- Click "Run" to execute the SQL

4. **Verify the user was created**
   - Go to "Authentication" → "Users" in the sidebar
   - You should see the `prisma` user in the list

---

## Step 2: Get Your Supabase Connection String

### Instructions

1. **Open Connection Settings**
   - In your Supabase Dashboard, click "Connect" at the top of the page
   - Or go to: Settings → Database → Connection string

2. **Select Connection Type**
   - Choose **"URI"** tab (not "ORM" or other options)
   - Select **"Session"** mode (port 5432)
   - **Do NOT use Transaction mode** (port 6543) for local development

3. **Copy the Connection String**
   - It will look like this:
   ```
   postgres://postgres.abcdefghijklmnop:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

4. **Modify the Connection String**
   - Replace `postgres` (the user) with `prisma`
   - Replace the password with the password you created in Step 1
   
   **Example**:
   ```
   postgres://prisma.abcdefghijklmnop:your_secure_password_here@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

**Important**: 
- Keep this connection string secure
- Never commit it to Git
- The format is: `postgres://[USER].[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres`

---

## Step 3: Configure Your Backend .env File

### Instructions

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit the .env file**
   ```bash
   nano .env  # or use your preferred editor
   ```

4. **Update the DATABASE_URL**
   Replace the placeholder with your actual Supabase connection string:
   
   ```bash
   DATABASE_URL="postgres://prisma.abcdefghijklmnop:your_secure_password_here@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   ```

5. **Update JWT_SECRET** (if not already done)
   Generate a strong random string (at least 32 characters):
   ```bash
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
   ```

6. **Save the file**

**Verify your .env file looks like this**:
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="postgres://prisma.abcdefghijklmnop:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRATION=3600
CORS_ORIGIN=http://localhost:5173
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## Step 4: Verify .env is Git-Ignored

**Critical**: Ensure your `.env` file is not committed to Git.

### Check .gitignore

1. **Verify .gitignore includes .env**
   ```bash
   cat .gitignore | grep .env
   ```
   
   You should see:
   ```
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   ```

2. **If .env is already tracked by Git** (shouldn't be, but just in case):
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   ```

---

## Step 5: Generate Prisma Client

Before running migrations, generate the Prisma Client:

```bash
cd backend
npm run prisma:generate
```

**Expected output**:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

## Step 6: Run Database Migrations

This will create all the tables in your Supabase database.

### Instructions

1. **Run the migration command**
   ```bash
   npm run prisma:migrate
   ```

2. **When prompted, name the migration**
   ```
   Enter a name for the new migration: › init
   ```

3. **Wait for completion**
   - Prisma will connect to Supabase
   - Create all tables defined in `schema.prisma`
   - Apply indexes and constraints
   
**Expected output**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public"

Applying migration `init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240116000000_init/
    └─ migration.sql

✔ Generated Prisma Client to ./node_modules/@prisma/client

The following migration(s) have been applied:

migrations/
  └─ 20240116000000_init/
    └─ migration.sql

✔ No seed file found.

✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Verify Tables Were Created

1. **Open Supabase Dashboard**
2. **Go to "Table Editor"** in the left sidebar
3. **You should see these tables**:
   - User
   - Address
   - Restaurant
   - MenuCategory
   - MenuItem
   - Modifier
   - ModifierOption
   - MenuItemModifier
   - Order
   - OrderItem
   - OrderStatusHistory
   - Review

---

## Step 7: Seed Development Data

Populate your database with demo data for testing.

### Instructions

```bash
npm run prisma:seed
```

**Expected output**:
```
🌱 Starting database seed...
✅ Created demo user: demo@khaanada.pk
✅ Created 2 addresses
✅ Created 2 restaurants
✅ Created 3 menu items
🎉 Database seed completed successfully!
```

### Verify Seed Data

1. **Open Supabase Dashboard → Table Editor**
2. **Check the "User" table** — you should see `demo@khaanada.pk`
3. **Check the "Restaurant" table** — you should see 2 restaurants
4. **Check the "MenuItem" table** — you should see 3 menu items

---

## Step 8: Test Database Connection

Start the backend and verify it connects to Supabase successfully.

### Instructions

1. **Start the backend server**
   ```bash
   npm run start:dev
   ```

2. **Expected output**:
   ```
   [Nest] Starting Nest application...
   [Nest] Application successfully started
   🚀 KhaanaDa API running on: http://localhost:3000
   📚 Swagger docs: http://localhost:3000/api/docs
   🌍 CORS enabled for: http://localhost:5173
   ```

3. **Test the API** (in a new terminal):
   ```bash
   # Test restaurant categories (no auth required)
   curl http://localhost:3000/api/restaurants/categories
   
   # Should return a list of categories
   ```

4. **Test login with demo user**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@khaanada.pk","password":"Demo123!"}'
   ```
   
   **Expected response**:
   ```json
   {
     "user": {
       "id": "uuid-here",
       "email": "demo@khaanada.pk",
       "name": "Demo User",
       "role": "CUSTOMER"
     },
     "accessToken": "jwt-token-here",
     "refreshToken": "refresh-token-here"
   }
   ```

5. **Test order creation** (requires authentication):
   ```bash
   # First, get the token from the login response above
   TOKEN="your-access-token-here"
   
   # Create an order
   curl -X POST http://localhost:3000/api/orders \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "restaurantId": "restaurant-uuid-from-seed",
       "items": [{"menuItemId": "menu-item-uuid", "quantity": 2}],
       "deliveryAddressId": "addr-1",
       "paymentMethod": "cod"
     }'
   ```

6. **Verify in Supabase Dashboard**:
   - Go to Table Editor → Order
   - You should see your test order

---

## Step 9: Configure Frontend to Use Backend API

Update the frontend to connect to your backend instead of using demo mode.

### Instructions

1. **Navigate to project root**
   ```bash
   cd ..  # Go back to project root
   ```

2. **Create or edit .env file**
   ```bash
   nano .env
   ```

3. **Add these lines**:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   VITE_USE_API=true
   ```

4. **Restart the frontend dev server**
   ```bash
   npm run dev
   ```

5. **Test the customer journey**:
   - Open http://localhost:5173
   - Login with `demo@khaanada.pk` / `Demo123!`
   - Browse restaurants
   - Add items to cart
   - Place an order
   - Check order history

---

## Troubleshooting

### Error: "Can't reach database server"

**Cause**: Connection string is incorrect or Supabase is unreachable

**Solutions**:
1. Verify your connection string format
2. Check that your Supabase project is active (not paused)
3. Verify the password is correct
4. Check your network connection
5. Try pinging the host: `ping aws-0-us-east-1.pooler.supabase.com`

### Error: "password authentication failed"

**Cause**: Incorrect password in connection string

**Solutions**:
1. Verify the password matches what you set in Step 1
2. Check for special characters that need URL encoding
3. Reset the password in Supabase:
   ```sql
   alter user "prisma" with password 'new_password';
   ```

### Error: "relation already exists"

**Cause**: Tables already exist in the database

**Solutions**:
1. If this is a fresh setup, drop all tables in Supabase Dashboard
2. Or use `npm run prisma:migrate:deploy` instead of `npm run prisma:migrate`
3. Or reset the database (WARNING: deletes all data):
   ```bash
   npx prisma migrate reset
   ```

### Error: "Prisma Client not generated"

**Cause**: Prisma Client needs to be regenerated

**Solution**:
```bash
npm run prisma:generate
```

### Error: "Migration failed"

**Cause**: Schema incompatibility or database error

**Solutions**:
1. Check the error message for specific issues
2. Verify your Prisma schema is valid: `npx prisma validate`
3. Check Supabase logs in the Dashboard
4. Try running the migration SQL manually in Supabase SQL Editor

### Error: "Connection timeout"

**Cause**: Network issues or Supabase pooler is slow

**Solutions**:
1. Wait and retry
2. Check Supabase status: [status.supabase.com](https://status.supabase.com)
3. Try using direct connection instead of pooler (Settings → Database → Connection string → Direct)

### Frontend not connecting to backend

**Cause**: CORS or API URL misconfiguration

**Solutions**:
1. Verify `CORS_ORIGIN` in backend `.env` matches your frontend URL
2. Verify `VITE_API_URL` in frontend `.env` is correct
3. Check browser console for CORS errors
4. Restart both backend and frontend

---

## Security Best Practices

### 1. Never Commit .env Files
- ✅ `.env` is in `.gitignore`
- ✅ Only commit `.env.example` with placeholders
- ❌ Never commit actual passwords or connection strings

### 2. Use Strong Passwords
- Use a password generator for database passwords
- Minimum 32 characters for JWT_SECRET
- Rotate passwords periodically

### 3. Limit Database User Permissions
- ✅ Created dedicated `prisma` user
- ✅ Granted only necessary permissions
- ❌ Don't use the `postgres` superuser for applications

### 4. Enable Row Level Security (RLS)
- Supabase has RLS enabled by default
- For production, define RLS policies for each table
- Reference: [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

### 5. Monitor Database Activity
- Use Supabase Query Performance Dashboard
- Check logs for suspicious activity
- Set up alerts for unusual patterns

---

## Connection String Reference

### Supabase Session Pooler (Recommended for Development)
```
postgres://prisma.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres
```
- Port: 5432
- Use for: Local development, migrations, Prisma Studio
- Features: Full PostgreSQL support, prepared statements

### Supabase Direct Connection (Alternative)
```
postgres://prisma:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
- Port: 5432
- Use for: When pooler is unavailable
- Note: Requires IPv4 add-on in some regions

### Supabase Transaction Pooler (For Serverless)
```
postgres://prisma.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres
```
- Port: 6543
- Use for: Serverless deployments (Vercel, Netlify)
- Limitations: No prepared statements, no temporary tables

---

## Next Steps

After successfully connecting to Supabase:

1. ✅ **Test the full customer journey** (login → order → track)
2. ✅ **Run backend tests**: `npm run test`
3. ✅ **Verify data persistence** (refresh page, check data remains)
4. ✅ **Test concurrent operations** (multiple orders)
5. ✅ **Monitor Supabase dashboard** for query performance

### Production Deployment

When ready for production:

1. **Use environment-specific databases**
   - Separate Supabase projects for dev/staging/prod
   - Different connection strings for each environment

2. **Enable additional security**
   - Row Level Security (RLS) policies
   - Network restrictions
   - Backup schedules

3. **Monitor and optimize**
   - Query performance
   - Connection pool usage
   - Storage and compute metrics

---

## Support Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Prisma Discord**: [discord.prisma.io](https://discord.prisma.io)

---

## Verification Checklist

Before marking setup as complete, verify:

- [ ] Custom `prisma` user created in Supabase
- [ ] Connection string configured in `.env`
- [ ] `.env` is git-ignored
- [ ] Prisma Client generated successfully
- [ ] Migrations applied without errors
- [ ] All 12 tables visible in Supabase Table Editor
- [ ] Seed data inserted (demo user, restaurants, menu items)
- [ ] Backend starts without errors
- [ ] Can login with demo credentials
- [ ] Can create and retrieve orders
- [ ] Frontend connects to backend API
- [ ] Full customer journey works end-to-end

---

**Setup Complete!** 🎉

Your KhaanaDa backend is now connected to Supabase PostgreSQL. All data is persisted in the cloud database with automatic backups, connection pooling, and a management dashboard.

---

*KhaanaDa — Cravings Delivered.* 🍛🚀
