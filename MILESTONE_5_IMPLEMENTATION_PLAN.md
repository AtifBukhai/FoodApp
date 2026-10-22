# KhaanaDa — Milestone 5 Implementation Plan

## Rider Application & Delivery Management

**Date:** 2024-01-16  
**Status:** Planning Phase  
**Repository:** https://github.com/AtifBukhai/FoodApp

---

## 📋 Current State Analysis

### Existing Architecture

**Database Schema:**
- ✅ UserRole enum includes RIDER role
- ✅ Order model with status tracking (PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → PICKED_UP → DELIVERED)
- ✅ OrderStatusHistory for audit trail
- ✅ User model with role-based access
- ❌ No Rider-specific model
- ❌ No Delivery/Assignment tracking
- ❌ No rider availability tracking
- ❌ No earnings tracking

**Backend Modules:**
- ✅ Auth module with JWT and role-based guards
- ✅ Orders module with status transitions
- ✅ Restaurant-partners module with order management
- ❌ No rider module
- ❌ No delivery assignment logic

**Frontend:**
- ✅ Customer pages (home, restaurants, orders, etc.)
- ✅ Partner pages (dashboard, restaurants, orders)
- ❌ No rider pages
- ❌ No delivery tracking UI

**Order Workflow (Current):**
1. Customer places order → PENDING
2. Restaurant accepts → CONFIRMED
3. Restaurant prepares → PREPARING
4. Restaurant marks ready → READY_FOR_PICKUP
5. ❌ Rider picks up → PICKED_UP (NOT IMPLEMENTED)
6. ❌ Rider delivers → DELIVERED (NOT IMPLEMENTED)

---

## 🎯 Implementation Plan

### Phase 1: Database Schema Extensions

**New Models Needed:**

1. **Rider Model** (extends User concept)
   ```prisma
   model Rider {
     id              String    @id @default(uuid())
     userId          String    @unique
     user            User      @relation(fields: [userId], references: [id])
     
     // Rider-specific fields
     vehicleType     String    // "motorcycle", "car", "bicycle"
     vehicleNumber   String?
     licenseNumber   String?
     
     // Approval & Status
     isApproved      Boolean   @default(false)
     isAvailable     Boolean   @default(false)
     
     // Location (optional, for dispatch)
     currentLat      Float?
     currentLng      Float?
     lastLocationUpdate DateTime?
     
     // Performance
     totalDeliveries Int       @default(0)
     rating          Float     @default(0)
     
     // Timestamps
     createdAt       DateTime  @default(now())
     updatedAt       DateTime  @updatedAt
     deletedAt       DateTime?
     
     @@index([userId])
     @@index([isApproved])
     @@index([isAvailable])
   }
   ```

2. **Delivery Model** (tracks rider assignments)
   ```prisma
   model Delivery {
     id              String    @id @default(uuid())
     orderId         String    @unique
     order           Order     @relation(fields: [orderId], references: [id])
     
     riderId         String?
     rider           Rider?    @relation(fields: [riderId], references: [id])
     
     // Delivery status
     status          DeliveryStatus @default(ASSIGNED)
     
     // Timestamps for tracking
     assignedAt      DateTime?
     acceptedAt      DateTime?
     pickedUpAt      DateTime?
     deliveredAt     DateTime?
     
     // Earnings
     baseFee         Int       // In paisa
     tip             Int       @default(0)
     totalEarnings   Int       @default(0)
     
     // Notes
     pickupNotes     String?
     deliveryNotes   String?
     issueReport     String?
     
     // Timestamps
     createdAt       DateTime  @default(now())
     updatedAt       DateTime  @updatedAt
     
     @@index([orderId])
     @@index([riderId])
     @@index([status])
   }
   
   enum DeliveryStatus {
     ASSIGNED        // Assigned to rider, awaiting acceptance
     ACCEPTED        // Rider accepted, heading to pickup
     PICKED_UP       // Rider picked up order
     DELIVERED       // Order delivered
     CANCELLED       // Delivery cancelled
     FAILED          // Delivery failed
   }
   ```

3. **Update User Model**
   ```prisma
   // Add relation to Rider
   model User {
     // ... existing fields
     rider           Rider?
   }
   ```

4. **Update Order Model**
   ```prisma
   model Order {
     // ... existing fields
     delivery        Delivery?
   }
   ```

**Migration Strategy:**
- Create new migration file
- Add Rider model
- Add Delivery model
- Add DeliveryStatus enum
- Update User and Order models with relations
- No data reset required

---

### Phase 2: Backend Implementation

**New Module:** `backend/src/riders/`

**Files to Create:**

1. **riders.module.ts** - Module definition
2. **riders.service.ts** - Business logic
3. **riders.controller.ts** - API endpoints
4. **riders.service.spec.ts** - Unit tests
5. **dto/** - DTOs for validation

**API Endpoints:**

**Rider Profile & Availability:**
- `GET /api/rider/profile` - Get rider profile
- `PATCH /api/rider/profile` - Update rider profile
- `POST /api/rider/availability` - Set availability (online/offline)
- `POST /api/rider/location` - Update location (optional)

**Delivery Management:**
- `GET /api/rider/deliveries/available` - Get available delivery offers
- `POST /api/rider/deliveries/:id/accept` - Accept delivery
- `POST /api/rider/deliveries/:id/decline` - Decline delivery
- `GET /api/rider/deliveries/active` - Get active deliveries
- `GET /api/rider/deliveries/completed` - Get completed deliveries
- `POST /api/rider/deliveries/:id/pickup` - Confirm pickup
- `POST /api/rider/deliveries/:id/delivered` - Confirm delivery

**Earnings:**
- `GET /api/rider/earnings` - Get earnings summary
- `GET /api/rider/earnings/history` - Get earnings history

**Authorization:**
- All endpoints require JWT authentication
- All endpoints require RIDER role
- Riders can only access their own data
- Riders cannot access other riders' data
- Riders cannot access customer orders not assigned to them

**Business Logic:**

**Delivery Assignment Flow:**
1. Restaurant marks order READY_FOR_PICKUP
2. System creates Delivery record with status ASSIGNED
3. Available riders see the offer
4. Rider accepts → status changes to ACCEPTED
5. Rider picks up → status changes to PICKED_UP, order status → PICKED_UP
6. Rider delivers → status changes to DELIVERED, order status → DELIVERED

**Concurrency Protection:**
- Use database transactions for assignment
- Use optimistic locking or unique constraints to prevent double-acceptance
- Validate delivery status before transitions

**Earnings Calculation:**
- Base fee from restaurant.deliveryFee
- Tip (if provided by customer)
- Total earnings = base fee + tip
- Platform commission (future enhancement)

---

### Phase 3: Frontend Implementation

**New Pages:** `src/pages/rider/`

**Files to Create:**

1. **DashboardPage.tsx** - Main rider dashboard
   - Availability toggle (online/offline)
   - Current active delivery (if any)
   - Available delivery offers
   - Recent deliveries
   - Earnings summary

2. **DeliveriesPage.tsx** - Delivery management
   - List of available deliveries
   - Active deliveries
   - Completed deliveries
   - Delivery details modal

3. **DeliveryDetailPage.tsx** - Single delivery view
   - Restaurant pickup info
   - Customer delivery info
   - Order items summary
   - Status timeline
   - Action buttons (accept, pickup, deliver)

4. **EarningsPage.tsx** - Earnings dashboard
   - Total earnings
   - Today's earnings
   - This week's earnings
   - Delivery history with earnings

5. **ProfilePage.tsx** - Rider profile
   - Personal info
   - Vehicle info
   - Approval status
   - Performance metrics

**Routing:**
```typescript
/rider/dashboard
/rider/deliveries
/rider/deliveries/:id
/rider/earnings
/rider/profile
```

**Components:**
- AvailabilityToggle
- DeliveryCard
- DeliveryStatusBadge
- EarningsCard
- LocationButton (optional, for future GPS)

**State Management:**
- Use existing AppContext
- Add rider-specific state (availability, active delivery)
- Polling for new delivery offers (or WebSocket in future)

**Bilingual Support:**
- All text in English and Urdu
- RTL layout for Urdu
- Consistent with existing KhaanaDa branding

---

### Phase 4: Integration Points

**With Restaurant Partners:**
- Restaurant marks order READY_FOR_PICKUP
- This triggers delivery availability for riders
- Restaurant can see assigned rider info

**With Customer App:**
- Customer sees delivery status updates
- Customer sees rider info (name, contact) after assignment
- Customer tracking page shows delivery timeline

**With Orders Module:**
- Delivery status updates order status
- Order status history includes delivery events
- Payment status remains separate from delivery status

---

### Phase 5: Testing Strategy

**Unit Tests:**
- Rider service methods
- Delivery assignment logic
- Status transition validation
- Authorization checks
- Earnings calculations

**Integration Tests:**
- Full delivery workflow
- Concurrent assignment handling
- Cancelled order handling
- Failed delivery handling

**Security Tests:**
- Riders cannot access other riders' data
- Riders cannot access unassigned orders
- Riders cannot modify order totals
- Riders cannot mark orders as paid

**Manual Tests:**
- Rider registration flow
- Availability toggle
- Delivery acceptance
- Pickup confirmation
- Delivery completion
- Earnings calculation

---

### Phase 6: Documentation

**Files to Create:**
1. **MILESTONE_5_COMPLETION.md** - Completion report
2. **RIDER_API_DOCUMENTATION.md** - API reference
3. **DELIVERY_WORKFLOW.md** - Workflow documentation
4. Update **ROADMAP_STATUS.md** - Mark Milestone 5 complete

---

## 🚀 Implementation Sequence

### Step 1: Database Schema (30 min)
1. Update Prisma schema with Rider and Delivery models
2. Add DeliveryStatus enum
3. Update User and Order models
4. Create migration file
5. Document migration

### Step 2: Backend Module (2 hours)
1. Create riders.module.ts
2. Create DTOs for validation
3. Create riders.service.ts with all business logic
4. Create riders.controller.ts with all endpoints
5. Add authorization guards
6. Implement delivery assignment logic
7. Implement status transitions

### Step 3: Backend Tests (1 hour)
1. Create riders.service.spec.ts
2. Test rider profile management
3. Test delivery assignment
4. Test status transitions
5. Test authorization
6. Test earnings calculations

### Step 4: Frontend Pages (3 hours)
1. Create DashboardPage.tsx
2. Create DeliveriesPage.tsx
3. Create DeliveryDetailPage.tsx
4. Create EarningsPage.tsx
5. Create ProfilePage.tsx
6. Add routing
7. Add bilingual support

### Step 5: Integration (1 hour)
1. Connect rider pages to backend API
2. Update customer order tracking to show delivery info
3. Update restaurant partner portal to show rider info
4. Test end-to-end workflow

### Step 6: Documentation (30 min)
1. Create MILESTONE_5_COMPLETION.md
2. Update ROADMAP_STATUS.md
3. Create API documentation
4. Create workflow documentation

**Total Estimated Time:** 8-9 hours

---

## 🔒 Security Considerations

**Rider Authorization:**
- Only users with RIDER role can access rider endpoints
- Riders can only view their own profile and deliveries
- Riders cannot modify other riders' data
- Riders cannot access customer orders not assigned to them

**Data Protection:**
- Customer addresses only visible to assigned rider
- Customer phone numbers masked or hidden
- Rider location only collected when online and on delivery
- No sensitive data in logs

**Concurrency:**
- Database transactions for delivery assignment
- Unique constraints to prevent double-acceptance
- Optimistic locking for status updates

**Validation:**
- All inputs validated with DTOs
- Status transitions validated
- Ownership validated on every operation

---

## 📊 Demo vs API Mode

**Demo Mode:**
- Mock rider data
- Mock delivery offers
- Mock earnings calculations
- Clearly labeled as demo data
- No real database operations

**API Mode:**
- Real backend endpoints
- Real database operations
- Real delivery assignments
- Real earnings tracking
- Requires Supabase connection

---

## 🎯 Success Criteria

**Functional:**
- ✅ Riders can register and get approved
- ✅ Riders can toggle availability
- ✅ Riders can see available deliveries
- ✅ Riders can accept/decline deliveries
- ✅ Riders can confirm pickup
- ✅ Riders can confirm delivery
- ✅ Riders can view earnings
- ✅ Customers can see delivery status
- ✅ Restaurants can see assigned rider

**Security:**
- ✅ Role-based access control
- ✅ Ownership validation
- ✅ No data leakage
- ✅ Concurrent assignment protection

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

**Current Limitations:**
1. No real-time GPS tracking (future enhancement)
2. No automated dispatch algorithm (manual acceptance)
3. No rider rating system (future enhancement)
4. No push notifications (future enhancement)
5. No route optimization (future enhancement)

**Future Enhancements:**
1. WebSocket for real-time updates
2. GPS tracking with location permissions
3. Automated dispatch based on proximity
4. Rider rating and review system
5. Route optimization
6. Multi-delivery batching
7. In-app chat between rider and customer

---

## 📝 Next Steps

1. **Immediate:** Review and approve this plan
2. **Step 1:** Update database schema
3. **Step 2:** Implement backend module
4. **Step 3:** Write backend tests
5. **Step 4:** Implement frontend pages
6. **Step 5:** Integrate with existing modules
7. **Step 6:** Write documentation
8. **Step 7:** Run all tests and verify

---

**Plan Status:** Ready for Implementation  
**Approved By:** [Pending]  
**Implementation Start:** [Pending]
