# KhaanaDa — Milestone 6 Implementation Plan

## Admin Dashboard & Platform Management

**Date:** 2024-01-16  
**Status:** Planning Phase  
**Repository:** https://github.com/AtifBukhai/FoodApp

---

## 📋 Current State Analysis

### Existing Architecture

**Database Schema:**
- ✅ UserRole enum includes ADMIN role
- ✅ User model has isActive field for suspension
- ✅ All necessary models exist (User, Restaurant, Rider, Order, Delivery, Payment)
- ❌ No AuditLog model for tracking admin actions
- ❌ No platform configuration model

**Backend Modules:**
- ✅ Auth module with JWT and role-based guards
- ✅ Users module (basic CRUD)
- ✅ Restaurants module (customer-facing)
- ✅ Restaurant-partners module (owner-facing)
- ✅ Riders module (rider-facing)
- ✅ Orders module
- ❌ No admin module

**Frontend:**
- ✅ Customer pages
- ✅ Partner pages (4 pages)
- ✅ Rider pages (4 pages)
- ❌ No admin pages

**Authorization:**
- ✅ RolesGuard exists
- ✅ @Roles() decorator exists
- ✅ JWT authentication working
- ❌ No admin-specific endpoints
- ❌ No audit logging

---

## 🎯 Implementation Plan

### Phase 1: Database Schema Extensions

**New Models Needed:**

1. **AuditLog Model** (for tracking admin actions)
   ```prisma
   model AuditLog {
     id          String    @id @default(uuid())
     actorId     String              // Admin who performed action
     actor       User      @relation(fields: [actorId], references: [id])
     
     action      String              // "USER_SUSPEND", "RESTAURANT_APPROVE", etc.
     targetType  String              // "User", "Restaurant", "Rider", "Order"
     targetId    String              // ID of affected record
     
     details     Json?               // Additional context (safe, no secrets)
     reason      String?             // Reason for action
     
     createdAt   DateTime  @default(now())
     
     @@index([actorId])
     @@index([targetType, targetId])
     @@index([createdAt])
   }
   ```

2. **PlatformConfig Model** (for operational settings)
   ```prisma
   model PlatformConfig {
     id          String    @id @default(uuid())
     key         String    @unique
     value       String
     description String?
     
     updatedAt   DateTime  @updatedAt
     updatedBy   String?
     
     @@index([key])
   }
   ```

3. **Update User Model**
   ```prisma
   model User {
     // ... existing fields
     auditLogs   AuditLog[]  @relation("AuditActor")
   }
   ```

**Migration Strategy:**
- Create new migration file
- Add AuditLog and PlatformConfig models
- Add relations to User model
- No data reset required

---

### Phase 2: Backend Implementation

**New Module:** `backend/src/admin/`

**Files to Create:**

1. **admin.module.ts** - Module definition
2. **admin.service.ts** - Business logic
3. **admin.controller.ts** - API endpoints
4. **admin.service.spec.ts** - Unit tests
5. **dto/** - DTOs for validation

**API Endpoints:**

**Dashboard Overview:**
- `GET /api/admin/dashboard` - Get platform metrics
- `GET /api/admin/dashboard/revenue` - Get revenue breakdown

**User Management:**
- `GET /api/admin/users` - List all users (with filters)
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id/role` - Change user role
- `PATCH /api/admin/users/:id/suspend` - Suspend user
- `PATCH /api/admin/users/:id/activate` - Activate user

**Restaurant Management:**
- `GET /api/admin/restaurants` - List all restaurants
- `GET /api/admin/restaurants/:id` - Get restaurant details
- `POST /api/admin/restaurants/:id/approve` - Approve restaurant
- `POST /api/admin/restaurants/:id/reject` - Reject restaurant
- `PATCH /api/admin/restaurants/:id/suspend` - Suspend restaurant
- `PATCH /api/admin/restaurants/:id/activate` - Activate restaurant

**Rider Management:**
- `GET /api/admin/riders` - List all riders
- `GET /api/admin/riders/:id` - Get rider details
- `POST /api/admin/riders/:id/approve` - Approve rider
- `POST /api/admin/riders/:id/reject` - Reject rider
- `PATCH /api/admin/riders/:id/suspend` - Suspend rider
- `PATCH /api/admin/riders/:id/activate` - Activate rider

**Order Management:**
- `GET /api/admin/orders` - List all orders (with filters)
- `GET /api/admin/orders/:id` - Get order details
- `PATCH /api/admin/orders/:id/status` - Update order status (admin intervention)

**Payment Oversight:**
- `GET /api/admin/payments` - List all payments
- `GET /api/admin/payments/summary` - Get payment summary

**Audit Logging:**
- `GET /api/admin/audit-logs` - List audit logs (with filters)

**Platform Configuration:**
- `GET /api/admin/config` - Get platform config
- `PATCH /api/admin/config` - Update platform config

**Authorization:**
- All endpoints require JWT authentication
- All endpoints require ADMIN role
- Admins cannot change their own role (prevent lockout)
- Last active admin protection

**Business Logic:**

**Dashboard Metrics:**
```typescript
{
  totalCustomers: number,
  activeRestaurants: number,
  pendingRestaurantApprovals: number,
  registeredRiders: number,
  approvedRiders: number,
  activeOrders: number,
  completedOrders: number,
  cancelledOrders: number,
  grossOrderValue: number,  // All orders
  platformRevenue: number,  // Only delivered + paid orders
  deliveryFees: number,
  riderEarnings: number,
}
```

**Revenue Calculation:**
- Gross Order Value = Sum of all order totals (regardless of status)
- Platform Revenue = Sum of delivered orders with COMPLETED payment
- Delivery Fees = Sum of delivery fees from delivered orders
- Rider Earnings = Sum of rider earnings from delivered orders
- Platform Commission = Platform Revenue - Delivery Fees - Rider Earnings

**Audit Logging:**
- Log all admin actions
- Include actor, action, target, timestamp, reason
- Never log sensitive data (passwords, tokens, secrets)
- Store as JSON for flexibility

---

### Phase 3: Frontend Implementation

**New Pages:** `src/pages/admin/`

**Files to Create:**

1. **DashboardPage.tsx** - Overview with metrics
2. **UsersPage.tsx** - User management
3. **RestaurantsPage.tsx** - Restaurant management
4. **RidersPage.tsx** - Rider management
5. **OrdersPage.tsx** - Order monitoring
6. **PaymentsPage.tsx** - Payment oversight
7. **AuditLogsPage.tsx** - Audit log viewer
8. **SettingsPage.tsx** - Platform configuration

**Routing:**
```typescript
/admin/dashboard
/admin/users
/admin/restaurants
/admin/riders
/admin/orders
/admin/payments
/admin/audit-logs
/admin/settings
```

**Components:**
- AdminLayout (sidebar navigation)
- MetricCard (for dashboard)
- StatusBadge (for various statuses)
- ConfirmDialog (for sensitive actions)
- AuditLogEntry (for audit logs)

**State Management:**
- Use existing AppContext
- Add admin-specific state
- Fetch data from admin API endpoints

**Bilingual Support:**
- All text in English and Urdu
- RTL layout for Urdu
- Consistent with existing KhaanaDa branding

---

### Phase 4: Security Implementation

**Authorization:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
```

**Protection Rules:**
- Admins cannot change their own role
- Last active admin cannot be suspended
- Admins cannot approve their own restaurants
- All sensitive actions require confirmation
- All actions logged in audit log

**Data Protection:**
- Never expose password hashes
- Never expose authentication tokens
- Never expose payment secrets
- Never expose API keys
- Mask sensitive customer data where appropriate

---

### Phase 5: Testing Strategy

**Unit Tests:**
- Admin service methods
- Authorization checks
- Role change validation
- Suspension logic
- Audit logging
- Dashboard metric calculations

**Integration Tests:**
- Full admin workflow
- Role escalation prevention
- Last admin protection
- Audit log creation

**Security Tests:**
- Non-admins cannot access admin endpoints
- Admins cannot escalate privileges
- Admins cannot suspend themselves
- Sensitive data not exposed

---

### Phase 6: Documentation

**Files to Create:**
1. **MILESTONE_6_COMPLETION.md** - Completion report
2. **ADMIN_API_DOCUMENTATION.md** - API reference
3. **ADMIN_WORKFLOWS.md** - Workflow documentation
4. Update **ROADMAP_STATUS.md** - Mark Milestone 6 complete

---

## 🚀 Implementation Sequence

### Step 1: Database Schema (30 min)
1. Add AuditLog model to schema.prisma
2. Add PlatformConfig model
3. Update User model with audit log relation
4. Create migration file
5. Document migration

### Step 2: Backend Module (3 hours)
1. Create admin.module.ts
2. Create DTOs for all operations
3. Create admin.service.ts with all business logic
4. Create admin.controller.ts with all endpoints
5. Add authorization guards
6. Implement audit logging
7. Implement dashboard metrics
8. Implement user/restaurant/rider management
9. Implement order monitoring
10. Implement payment oversight

### Step 3: Backend Tests (1.5 hours)
1. Create admin.service.spec.ts
2. Test authorization
3. Test role changes
4. Test suspension logic
5. Test audit logging
6. Test dashboard calculations

### Step 4: Frontend Pages (4 hours)
1. Create AdminLayout component
2. Create DashboardPage with metrics
3. Create UsersPage with management
4. Create RestaurantsPage with approval workflow
5. Create RidersPage with management
6. Create OrdersPage with monitoring
7. Create PaymentsPage with oversight
8. Create AuditLogsPage
9. Create SettingsPage
10. Add routing
11. Add bilingual support

### Step 5: Integration (1 hour)
1. Connect admin pages to backend API
2. Test all workflows
3. Verify authorization
4. Test audit logging

### Step 6: Documentation (30 min)
1. Create MILESTONE_6_COMPLETION.md
2. Update ROADMAP_STATUS.md
3. Create API documentation
4. Create workflow documentation

**Total Estimated Time:** 10-11 hours

---

## 🔒 Security Considerations

### Admin Authorization
- Only users with ADMIN role can access admin endpoints
- Admins cannot change their own role
- Last active admin cannot be suspended
- All admin actions logged

### Data Protection
- Password hashes never exposed
- Authentication tokens never exposed
- Payment secrets never exposed
- API keys never exposed
- Customer data masked where appropriate

### Audit Trail
- All admin actions logged
- Actor, action, target, timestamp recorded
- Reason captured for sensitive actions
- No sensitive data in logs

### Privilege Escalation Prevention
- Admins cannot grant themselves additional privileges
- Role changes require existing admin
- Last admin protection prevents lockout
- All role changes logged

---

## 📊 Dashboard Metrics

### User Metrics
- Total customers (CUSTOMER role)
- Active customers (isActive = true)
- Suspended customers (isActive = false)

### Restaurant Metrics
- Total restaurants
- Active restaurants (isApproved = true, isOpen = true)
- Pending approval (isApproved = false)
- Suspended restaurants

### Rider Metrics
- Total riders (RIDER role)
- Approved riders (isApproved = true)
- Pending approval (isApproved = false)
- Available riders (isAvailable = true)

### Order Metrics
- Active orders (not DELIVERED or CANCELLED)
- Completed orders (DELIVERED)
- Cancelled orders (CANCELLED)
- Average order value

### Financial Metrics
- Gross order value (all orders)
- Platform revenue (delivered + paid orders)
- Delivery fees collected
- Rider earnings paid
- Platform commission

### Payment Metrics
- Pending payments
- Completed payments
- Failed payments
- Refunded payments

---

## 🎯 Success Criteria

**Functional:**
- ✅ Admin dashboard with real-time metrics
- ✅ User management with role changes
- ✅ Restaurant approval workflow
- ✅ Rider approval workflow
- ✅ Order monitoring and intervention
- ✅ Payment oversight
- ✅ Audit log viewer
- ✅ Platform configuration

**Security:**
- ✅ Role-based access control
- ✅ Privilege escalation prevention
- ✅ Last admin protection
- ✅ Audit logging
- ✅ Data protection

**Quality:**
- ✅ All tests passing
- ✅ Bilingual support
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

**Documentation:**
- ✅ API documentation
- ✅ Workflow documentation
- ✅ Completion report
- ✅ Updated roadmap

---

## 🐛 Known Limitations

### Current Limitations
1. No real-time updates (requires WebSocket)
2. No advanced analytics (requires BI tools)
3. No bulk operations (future enhancement)
4. No export functionality (future enhancement)
5. No notification system for admins (future enhancement)

### Future Enhancements
1. WebSocket for real-time updates
2. Advanced analytics and reporting
3. Bulk operations (suspend multiple users, etc.)
4. Export to CSV/Excel
5. Admin notification system
6. Multi-level admin roles (super admin, support admin, etc.)

---

## 📝 Next Steps

1. **Immediate:** Review and approve this plan
2. **Step 1:** Update database schema
3. **Step 2:** Implement backend module
4. **Step 3:** Write backend tests
5. **Step 4:** Implement frontend pages
6. **Step 5:** Integrate and test
7. **Step 6:** Write documentation

---

**Plan Status:** Ready for Implementation  
**Approved By:** [Pending]  
**Implementation Start:** [Pending]
