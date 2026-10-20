# KhaanaDa Backend Setup Guide

**Quick Start Guide for Running the Backend**

---

## Prerequisites

Before starting, ensure you have:

1. **Node.js 18+** and npm installed
2. **PostgreSQL 14+** installed and running
3. **Git** for version control

---

## Step 1: Install PostgreSQL

### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

---

## Step 2: Create Database

### Using psql (Command Line)
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE khaanada;
CREATE USER khaanada WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE khaanada TO khaanada;
\q
```

### Using pgAdmin or Other Tools
1. Open your PostgreSQL management tool
2. Create database: `khaanada`
3. Create user: `khaanada` with a secure password
4. Grant all privileges to the user

---

## Step 3: Configure Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

### Update .env with your database credentials:
```bash
DATABASE_URL=postgresql://khaanada:your_secure_password@localhost:5432/khaanada?schema=public

# Generate a strong JWT secret (at least 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Other settings (defaults are fine for development)
JWT_EXPIRATION=3600
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Important**: 
- Replace `your_secure_password` with your actual PostgreSQL password
- Generate a unique JWT secret for production (use a password generator)

---

## Step 4: Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed
```

**Expected output:**
```
✅ Created demo user: demo@khaanada.pk
✅ Created 2 addresses
✅ Created 2 restaurants
✅ Created 3 menu items
🎉 Database seed completed successfully!
```

---

## Step 5: Start Backend Server

```bash
# Development mode (with hot reload)
npm run start:dev
```

**Expected output:**
```
🚀 KhaanaDa API running on: http://localhost:3000
📚 Swagger docs: http://localhost:3000/api/docs
🌍 CORS enabled for: http://localhost:5173
```

---

## Step 6: Verify Backend is Running

### Test with curl
```bash
# Test health (should return categories)
curl http://localhost:3000/api/restaurants/categories

# Test login with demo user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@khaanada.pk","password":"Demo123!"}'
```

### Test with Browser
1. Open `http://localhost:3000/api/docs`
2. You should see Swagger API documentation
3. Try the "Try it out" feature

---

## Step 7: Connect Frontend to Backend

### Update frontend .env
```bash
# In the root directory (not backend/)
nano .env

# Add these lines:
VITE_API_URL=http://localhost:3000/api
VITE_USE_API=true
```

### Start Frontend
```bash
# In the root directory
npm run dev
```

Now the frontend will use the real backend API instead of mock data!

---

## Demo Credentials

After seeding the database, you can login with:

- **Email**: `demo@khaanada.pk`
- **Password**: `Demo123!`

---

## Troubleshooting

### Error: "Database connection failed"
**Solution**: 
- Check PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Verify DATABASE_URL in .env
- Test connection: `psql -U khaanada -d khaanada`

### Error: "relation already exists"
**Solution**: 
```bash
# Reset database
npm run prisma:migrate reset
```

### Error: "Port 3000 already in use"
**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in .env
PORT=3001
```

### Error: "Cannot find module '@prisma/client'"
**Solution**:
```bash
npm run prisma:generate
```

### Frontend not connecting to backend
**Solution**:
- Check CORS_ORIGIN in backend .env matches your frontend URL
- Verify VITE_API_URL in frontend .env
- Check browser console for CORS errors

---

## Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:migrate:reset  # Reset database
npm run prisma:seed        # Seed with demo data
npm run prisma:studio      # Open database GUI

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Restaurants
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/:id` - Get restaurant
- `GET /api/restaurants/:id/menu` - Get menu
- `GET /api/restaurants/categories` - Get categories

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order

### User Profile
- `GET /api/users/me` - Get profile
- `PATCH /api/users/me` - Update profile
- `GET /api/users/me/addresses` - Get addresses
- `POST /api/users/me/addresses` - Create address
- `DELETE /api/users/me/addresses/:id` - Delete address

**Full API documentation**: http://localhost:3000/api/docs

---

## Database Schema

View the complete schema in `backend/prisma/schema.prisma`

**Main tables:**
- User - User accounts
- Address - Delivery addresses
- Restaurant - Restaurant information
- MenuCategory - Menu organization
- MenuItem - Food items
- Order - Customer orders
- OrderItem - Items in orders
- OrderStatusHistory - Order tracking

---

## Next Steps

1. ✅ Backend is running
2. ✅ Frontend is connected
3. 🔄 Test the complete user journey:
   - Register a new user
   - Browse restaurants
   - Add items to cart
   - Place an order
   - View order history

4. 🔄 Explore the API documentation at `/api/docs`
5. 🔄 Check the database with `npm run prisma:studio`

---

## Support

- **Backend Documentation**: `backend/README.md`
- **API Documentation**: http://localhost:3000/api/docs
- **Troubleshooting**: `docs/guides/troubleshooting-guide.md`
- **Architecture**: `docs/architecture/system-overview.md`

---

**Happy Coding!** 🚀

*KhaanaDa — Cravings Delivered.* 🍛
