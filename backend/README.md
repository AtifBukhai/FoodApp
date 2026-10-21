# KhaanaDa Backend API

**NestJS + PostgreSQL + Prisma**

Backend API for the KhaanaDa food delivery platform.

---

## 📋 Overview

This is the backend API for KhaanaDa, built with:
- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Relational database
- **Prisma** - Next-generation ORM
- **JWT** - Authentication
- **Swagger** - API documentation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ **OR** Supabase account (recommended)
- Git

### Option A: Supabase (Recommended) ⭐

**Fastest way to get started — no local PostgreSQL needed!**

👉 **[See Supabase Quick Start](./SUPABASE_QUICKSTART.md)** (5-minute setup)

📚 **[Full Supabase Guide](../SUPABASE_SETUP_GUIDE.md)** (detailed instructions)

```bash
# After configuring Supabase:
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run db:test  # Verify connection
```

### Option B: Local PostgreSQL

If you prefer running PostgreSQL locally:

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### Database Setup (Local PostgreSQL)

```bash
# Start PostgreSQL (if not running)
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
createdb khaanada

# Or using psql
psql -U postgres
CREATE DATABASE khaanada;
CREATE USER khaanada WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE khaanada TO khaanada;
\q

# Run migrations
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed
```

### Start Development Server

```bash
npm run start:dev
```

API will be available at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

---

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ahmed Khan",
  "email": "ahmed@example.com",
  "phone": "+923001234567",
  "password": "SecurePass123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "ahmed@example.com",
    "name": "Ahmed Khan",
    "role": "CUSTOMER"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Restaurants

#### List Restaurants
```http
GET /api/restaurants?cuisine=pakistani&sortBy=rating&page=1&limit=20
```

#### Get Restaurant Details
```http
GET /api/restaurants/:id
```

#### Get Restaurant Menu
```http
GET /api/restaurants/:id/menu
```

### Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "notes": "Extra spicy"
    }
  ],
  "deliveryAddressId": "uuid",
  "paymentMethod": "cod"
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Get Order Details
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Cancel Order
```http
PATCH /api/orders/:id/cancel
Authorization: Bearer <token>
```

### Addresses

#### Create Address
```http
POST /api/users/me/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "Home",
  "street": "45-B, Street 7, DHA Phase 5",
  "area": "DHA",
  "city": "Lahore",
  "isDefault": true
}
```

#### Get User Addresses
```http
GET /api/users/me/addresses
Authorization: Bearer <token>
```

---

## 🗄️ Database Schema

### Key Design Decisions

1. **Monetary Values**: All prices stored as integers in paisa (1 PKR = 100 paisa) to avoid floating-point errors
2. **UUIDs**: Primary keys use UUIDs to prevent enumeration attacks
3. **Soft Deletes**: Entities have `deletedAt` fields for audit trail
4. **Indexes**: Comprehensive indexing for query performance
5. **Enums**: Status fields use database enums for data integrity
6. **Transactions**: Order creation uses database transactions for consistency

### Main Tables

- `User` - User accounts with roles
- `Address` - Customer delivery addresses
- `Restaurant` - Restaurant information
- `MenuCategory` - Menu organization
- `MenuItem` - Food items with prices
- `Order` - Customer orders
- `OrderItem` - Items within orders
- `OrderStatusHistory` - Order tracking events
- `Review` - Customer reviews

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Role-based access control
- ✅ Input validation with class-validator
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Rate limiting (100 requests/minute)
- ✅ Security headers (Helmet)
- ✅ Request compression

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

---

## 📦 Available Scripts

```bash
# Development
npm run start:dev          # Start dev server with hot reload
npm run start:debug        # Start with debugger

# Build
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:migrate:deploy  # Deploy migrations (production)
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

---

## 🌍 Environment Variables

See `.env.example` for all available environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRATION` - Token expiration time (seconds)

**Optional:**
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origin
- `THROTTLE_TTL` - Rate limit time window
- `THROTTLE_LIMIT` - Max requests per window

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/           # Request DTOs
│   │   ├── guards/        # Auth guards
│   │   ├── strategies/    # Passport strategies
│   │   └── decorators/    # Custom decorators
│   ├── users/             # User management
│   ├── restaurants/       # Restaurant discovery
│   ├── orders/            # Order management
│   ├── addresses/         # Address management
│   ├── prisma/            # Database service
│   └── config/            # Configuration
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Seed data
└── test/                  # E2E tests
```

---

## 🚧 Current Status

### ✅ Implemented
- User registration and login
- JWT authentication
- Restaurant discovery with filters
- Menu retrieval
- Order creation with validation
- Order tracking
- Address management
- Role-based access control
- Rate limiting
- Swagger documentation

### ⏳ Planned
- Restaurant owner portal
- Rider application
- Admin dashboard
- Payment gateway integration (JazzCash, easypaisa)
- Real-time order tracking (WebSockets)
- Email/SMS notifications
- Review and rating system
- Coupon and discount system

---

## 📝 Notes

- All monetary calculations are done server-side from database prices
- Client-submitted prices are ignored for security
- Order creation uses database transactions
- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 1 hour (configurable)
- Rate limiting: 100 requests per minute per IP

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Submit a pull request

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for Pakistan**

*KhaanaDa — Cravings Delivered.* 🍛🚀
