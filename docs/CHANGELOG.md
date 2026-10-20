# Changelog

All notable changes to the KhaanaDa project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2024-01-16

### 🎉 Initial Release — Milestone 1: Customer Web Application

#### Added
- **Restaurant Discovery**
  - Browse all restaurants with grid layout
  - Search by restaurant name, cuisine, or dish
  - Filter by cuisine category (12 categories)
  - Sort by rating, delivery time, or price
  - Restaurant cards with ratings, delivery info, and status

- **Restaurant Detail Pages**
  - Hero banner with restaurant image
  - Tabbed interface (Menu, About, Reviews)
  - Category-based menu navigation
  - Menu items with images, descriptions, and prices
  - Dietary indicators (vegetarian, vegan, spicy)
  - Popular item badges
  - Add to cart with quantity controls
  - Restaurant info (address, hours, delivery details)
  - Sample customer reviews

- **Shopping Cart**
  - Slide-out cart drawer
  - Real-time item count badge
  - Quantity adjustment (+/-)
  - Item removal
  - Price breakdown (subtotal, delivery fee, tax)
  - Empty cart state with CTA

- **Checkout Flow**
  - Delivery address selection
  - Payment method selection (COD/Online)
  - Order summary with item details
  - Price breakdown display
  - Order confirmation screen
  - Order ID generation

- **Order Management**
  - Order history page
  - Order status tracking with timeline
  - Visual progress indicator
  - Order details view
  - Estimated delivery time
  - Reorder button for delivered orders

- **User Authentication (Demo)**
  - Login page with email/password
  - Registration page with name, email, phone
  - Password visibility toggle
  - Form validation
  - Demo session management

- **User Profile**
  - Profile information display
  - Edit profile form
  - Saved addresses management
  - Add/delete addresses
  - Default address marking
  - Language preference setting

- **Partner Information**
  - Partner benefits overview
  - How it works steps
  - Platform statistics
  - Registration CTA (informational only)

- **Localization**
  - Full English language support
  - Full Urdu language support (اردو)
  - RTL layout for Urdu
  - Language toggle in header
  - Localized content throughout

- **Design & UI**
  - KhaanaDa branding (orange, green, cream palette)
  - Responsive design (mobile-first)
  - Mobile bottom navigation
  - Desktop header navigation
  - Smooth animations and transitions
  - Card hover effects
  - Toast notifications
  - Loading states
  - Accessible focus states
  - Custom scrollbar styling

- **Technical Foundation**
  - React 18.2 with TypeScript
  - Vite 6.3 build system
  - Tailwind CSS 4.1 with custom theme
  - React Router DOM for navigation
  - React Context for state management
  - Type-safe data models
  - Modular component architecture
  - Clean code organization

#### Technical Details
- **Dependencies**: React 18.2, React Router DOM 6.8, Lucide React, Framer Motion, date-fns, uuid
- **Dev Dependencies**: TypeScript 5.7, Vite 6.3, Tailwind CSS 4.1
- **Build Output**: 281KB JS (78KB gzipped), 37KB CSS (7.4KB gzipped)
- **Routes**: 9 pages with proper navigation
- **Components**: 15+ reusable components
- **Type Definitions**: Complete TypeScript interfaces for all data models

#### Known Limitations
- Demo mode only — no real backend or database
- Authentication is simulated — no real credential validation
- Data not persisted — lost on page refresh
- Payment processing not integrated
- Restaurant data is mock/seed data
- No real-time order tracking
- No real address validation or geocoding

---

## [Unreleased]

### Planned for Milestone 2: Backend API & Database
- NestJS backend setup
- PostgreSQL database with Prisma ORM
- Restaurant catalog API endpoints
- User authentication API (JWT)
- Order management API
- API documentation (OpenAPI/Swagger)
- Frontend API integration layer
- Data persistence for orders and users

### Planned for Milestone 3: Secure Authentication
- JWT token implementation
- Password hashing (Argon2id)
- Email verification flow
- Password recovery
- Secure session management
- CSRF protection
- Rate limiting

### Planned for Milestone 4: Restaurant Partner Portal
- Restaurant registration and approval
- Menu management system
- Order acceptance workflow
- Sales dashboard
- Staff management

---

## Version History

| Version | Date | Milestone | Status |
|---------|------|-----------|--------|
| 0.1.0 | 2024-01-16 | Customer Web App | ✅ Complete |
| 0.2.0 | TBD | Backend API | 🔄 In Progress |
| 0.3.0 | TBD | Secure Auth | ⏳ Planned |
| 0.4.0 | TBD | Restaurant Portal | ⏳ Planned |
| 0.5.0 | TBD | Rider App | ⏳ Planned |
| 0.6.0 | TBD | Admin Dashboard | ⏳ Planned |
| 1.0.0 | TBD | Production Release | ⏳ Planned |

---

## Contributing

For significant changes, please open an issue first to discuss what you would like to change.

---

**Keep a Changelog**: [https://keepachangelog.com](https://keepachangelog.com/en/1.0.0/)
