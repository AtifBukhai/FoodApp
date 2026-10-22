# KhaanaDa — Milestone 6 Implementation Plan

## Payment Gateway Integration

**Objective:** Integrate JazzCash and easypaisa payment gateways with a provider-agnostic architecture  
**Status:** Planning Phase  
**Date:** 2024-01-16

---

## Phase 1: Repository Inspection Summary

### Current State Analysis

**Order Model (Prisma Schema)**
- ✅ `paymentMethod` enum: COD, ONLINE
- ✅ `paymentStatus` enum: PENDING, COMPLETED, FAILED, REFUNDED
- ✅ All monetary values in paisa (integer minor units)
- ❌ No dedicated Payment model
- ❌ No payment transaction tracking
- ❌ No webhook/callback handling

**Checkout Flow**
- ✅ Existing checkout page with address selection
- ✅ Cart total calculation (server-side)
- ✅ Payment method selection (COD/online)
- ❌ No specific gateway selection
- ❌ No payment initiation flow
- ❌ No payment status tracking

**Backend Order Service**
- ✅ Server-side price calculation
- ✅ Transaction-based order creation
- ✅ Payment status tracking (basic)
- ❌ No payment gateway integration
- ❌ No webhook handlers
- ❌ No payment verification

**Frontend API Client**
- ✅ Order creation endpoint
- ✅ Payment method field
- ❌ No payment initiation endpoint
- ❌ No payment status polling
- ❌ No gateway-specific flows

### Key Findings

1. **Monetary Handling**: Already using integer paisa (good for payment gateways)
2. **Payment Status**: Basic enum exists but no detailed tracking
3. **No Payment Model**: Need to add dedicated payment tracking
4. **No Webhook Infrastructure**: Need callback URL handling
5. **No Gateway Abstraction**: Need provider-agnostic interface

---

## Phase 2: Implementation Plan

### 2.1 Database Schema Changes

**New Model: Payment**
```prisma
model Payment {
  id                String          @id @default(uuid())
  orderId           String          @unique
  order             Order           @relation(fields: [orderId], references: [id])
  
  // Payment details
  provider          PaymentProvider // JAZZCASH, EASYPAISA
  providerTxnId     String?         // Transaction ID from gateway
  amount            Int             // In paisa
  currency          String          @default("PKR")
  
  // Status tracking
  status            PaymentStatus   // PENDING, COMPLETED, FAILED, REFUNDED
  gatewayStatus     String?         // Raw status from gateway
  
  // Request/Response tracking
  requestPayload    Json?           // Request sent to gateway
  responsePayload   Json?           // Response from gateway
  webhookPayload    Json?           // Webhook/callback data
  
  // Security
  signatureVerified Boolean         @default(false)
  
  // Timestamps
  initiatedAt       DateTime        @default(now())
  completedAt       DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@index([orderId])
  @@index([provider])
  @@index([status])
  @@index([providerTxnId])
}

enum PaymentProvider {
  JAZZCASH
  EASYPAISA
}
```

**Update Order Model**
- Add relation to Payment model
- Keep existing paymentMethod and paymentStatus for backward compatibility

### 2.2 Backend Architecture

**New Module Structure**
```
backend/src/
├── payments/
│   ├── payments.module.ts
│   ├── payments.service.ts
│   ├── payments.controller.ts
│   ├── interfaces/
│   │   └── payment-provider.interface.ts
│   ├── providers/
│   │   ├── base-payment-provider.ts
│   │   ├── jazzcash.provider.ts
│   │   └── easypaisa.provider.ts
│   ├── dto/
│   │   ├── initiate-payment.dto.ts
│   │   └── payment-callback.dto.ts
│   └── payments.service.spec.ts
```

**Payment Provider Interface**
```typescript
interface IPaymentProvider {
  // Initialize payment and return redirect URL/data
  initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult>;
  
  // Verify callback/webhook signature
  verifyCallback(data: CallbackData): Promise<CallbackVerification>;
  
  // Check payment status
  checkStatus(transactionId: string): Promise<PaymentStatus>;
  
  // Process refund
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
```

**Payment Service**
- Provider selection based on configuration
- Payment initiation with order validation
- Callback/webhook handling with signature verification
- Idempotent payment processing
- Status synchronization

### 2.3 Frontend Changes

**Checkout Page Updates**
- Add specific payment method options (JazzCash, easypaisa)
- Show payment initiation UI
- Handle redirect to gateway
- Handle return from gateway
- Show payment status
- Poll for payment confirmation

**New Pages/Components**
- Payment pending screen
- Payment success screen
- Payment failure screen
- Payment status polling component

### 2.4 API Endpoints

**New Endpoints**
```
POST   /api/payments/initiate          - Start payment process
POST   /api/payments/callback/jazzcash - JazzCash webhook handler
POST   /api/payments/callback/easypaisa - easypaisa webhook handler
GET    /api/payments/:orderId/status   - Check payment status
POST   /api/payments/:id/refund        - Process refund (admin)
```

**Updated Endpoints**
- `POST /api/orders` - Accept specific payment provider
- `GET /api/orders/:id` - Include payment details

### 2.5 Configuration

**Environment Variables**
```bash
# Payment Mode: demo | sandbox | live
PAYMENT_MODE=demo

# JazzCash Configuration
JAZZCASH_SANDBOX=true
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_RETURN_URL=http://localhost:3000/api/payments/callback/jazzcash

# easypaisa Configuration
EASYPAISA_SANDBOX=true
EASYPAISA_MERCHANT_ID=
EASYPAISA_HASH_KEY=
EASYPAISA_RETURN_URL=http://localhost:3000/api/payments/callback/easypaisa
```

---

## Phase 3: Implementation Steps

### Step 1: Database Schema (30 min)
1. Add Payment model to schema.prisma
2. Add PaymentProvider enum
3. Update Order model with Payment relation
4. Create migration file
5. Document migration application process

### Step 2: Payment Provider Interface (1 hour)
1. Create `IPaymentProvider` interface
2. Define all required methods
3. Create DTOs for payment operations
4. Define error types

### Step 3: Demo Payment Provider (1 hour)
1. Implement `DemoPaymentProvider`
2. Simulate payment flows
3. Generate mock transaction IDs
4. Handle all payment states

### Step 4: JazzCash Provider (2 hours)
1. Research official JazzCash API documentation
2. Implement request signing
3. Implement payment initiation
4. Implement callback verification
5. Implement status checking
6. Add comprehensive error handling

### Step 5: easypaisa Provider (2 hours)
1. Research official easypaisa API documentation
2. Implement hash generation
3. Implement payment initiation
4. Implement callback verification
5. Implement status checking
6. Add comprehensive error handling

### Step 6: Payment Service (2 hours)
1. Implement provider selection logic
2. Implement payment initiation flow
3. Implement callback handling
4. Implement idempotency checks
5. Implement status synchronization
6. Add comprehensive logging

### Step 7: Payment Controller (1 hour)
1. Create payment initiation endpoint
2. Create callback endpoints for each provider
3. Create status check endpoint
4. Add proper validation
5. Add security checks

### Step 8: Order Service Integration (1 hour)
1. Update order creation to accept payment provider
2. Link payment to order
3. Update order status based on payment
4. Add payment details to order response

### Step 9: Frontend - Checkout Updates (2 hours)
1. Add payment method selection UI
2. Add JazzCash option
3. Add easypaisa option
4. Handle payment initiation
5. Handle redirect flow
6. Add loading states

### Step 10: Frontend - Payment Status (1 hour)
1. Create payment pending screen
2. Create payment success screen
3. Create payment failure screen
4. Implement status polling
5. Add retry options

### Step 11: Testing (2 hours)
1. Unit tests for payment providers
2. Unit tests for payment service
3. Integration tests for payment flow
4. Security tests (signature verification)
5. Idempotency tests
6. Error handling tests

### Step 12: Documentation (1 hour)
1. Create MILESTONE_6_COMPLETION.md
2. Document payment flow
3. Document configuration
4. Document testing procedures
5. Document deployment checklist

**Total Estimated Time:** 16-18 hours

---

## Phase 4: Security Considerations

### Critical Security Requirements

1. **Signature Verification**
   - Verify all callback signatures
   - Use provider-specific algorithms
   - Never accept unsigned callbacks

2. **Idempotency**
   - Prevent duplicate payment processing
   - Use transaction IDs for deduplication
   - Lock payments during processing

3. **Amount Verification**
   - Verify callback amount matches order total
   - Never trust client-side amounts
   - Use server-calculated totals

4. **Ownership Validation**
   - Verify user owns the order
   - Verify payment belongs to order
   - Prevent cross-user access

5. **Secret Management**
   - Never expose merchant credentials to frontend
   - Use environment variables
   - Rotate secrets regularly

6. **Logging**
   - Log payment events (not sensitive data)
   - Never log card numbers, PINs, OTPs
   - Mask sensitive fields in logs

---

## Phase 5: Testing Strategy

### Unit Tests
- Payment provider interface compliance
- Signature verification logic
- Amount validation
- Status mapping
- Error handling

### Integration Tests
- Payment initiation flow
- Callback processing
- Status synchronization
- Order status updates

### Security Tests
- Invalid signature rejection
- Amount mismatch detection
- Duplicate callback handling
- Unauthorized access prevention

### Demo Mode Tests
- Demo provider functionality
- Mode isolation
- Configuration validation

---

## Phase 6: Documentation Requirements

### Technical Documentation
- Architecture diagrams
- Payment flow sequences
- Provider integration details
- Configuration guide

### User Documentation
- Payment method selection
- Payment process explanation
- Troubleshooting guide

### Developer Documentation
- Adding new payment providers
- Testing payment flows
- Deployment checklist

---

## Phase 7: Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Security review completed

### Sandbox Deployment
- [ ] Sandbox credentials configured
- [ ] Callback URLs configured
- [ ] Test transactions successful
- [ ] Webhook handlers tested

### Production Deployment
- [ ] Live credentials configured
- [ ] SSL certificates valid
- [ ] Callback URLs updated
- [ ] Monitoring configured
- [ ] Rollback plan ready

---

## Phase 8: Risk Mitigation

### Identified Risks

1. **Gateway Documentation Unavailable**
   - Mitigation: Implement interface, document gaps
   - Fallback: Demo mode for testing

2. **Sandbox Access Denied**
   - Mitigation: Use demo provider
   - Fallback: Mock responses for testing

3. **Callback URL Issues**
   - Mitigation: Comprehensive logging
   - Fallback: Manual status checking

4. **Signature Verification Failures**
   - Mitigation: Extensive testing
   - Fallback: Detailed error logging

---

## Phase 9: Success Criteria

### Functional Requirements
- ✅ Users can select JazzCash or easypaisa
- ✅ Payment initiation works in demo mode
- ✅ Callback handling implemented
- ✅ Payment status tracking works
- ✅ Order status updates correctly

### Security Requirements
- ✅ Signature verification implemented
- ✅ Idempotency checks in place
- ✅ Amount verification working
- ✅ Ownership validation complete
- ✅ No sensitive data in logs

### Quality Requirements
- ✅ All tests passing
- ✅ No breaking changes
- ✅ Documentation complete
- ✅ Code review completed

---

## Next Steps

1. **Immediate**: Review and approve this plan
2. **Step 1**: Update database schema
3. **Step 2**: Create payment provider interface
4. **Step 3**: Implement demo provider
5. **Continue**: Follow implementation steps sequentially

---

**Plan Status:** Ready for Implementation  
**Approved By:** [Pending]  
**Implementation Start:** [Pending]
