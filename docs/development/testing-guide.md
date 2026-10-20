# KhaanaDa — Testing Guide

**Version**: 0.1.0
**Last Updated**: 2024-01-16

---

## Current Testing Status

### ✅ Implemented
- Build verification (TypeScript compilation)
- Production build testing
- Manual testing during development

### ⏳ Planned (Milestone 2+)
- Unit tests (Jest/Vitest)
- Component tests (React Testing Library)
- Integration tests (API endpoints)
- End-to-end tests (Playwright/Cypress)
- Security testing

---

## Build Verification

### TypeScript Type Checking

```bash
npm run typecheck
```

**Expected Output**:
```
✓ No type errors found
```

**What it checks**:
- Type safety across all components
- Interface compliance
- Import/export correctness
- Generic type parameters

### Production Build

```bash
npm run build
```

**Expected Output**:
```
vite v6.3.5 building for production...
✓ 1376 modules transformed.
dist/index.html                   1.07 kB
dist/assets/index-XXXXX.css      37.02 kB │ gzip:  7.46 kB
dist/assets/index-XXXXX.js      281.39 kB │ gzip: 80.94 kB
✓ built in 4.89s
```

**What it verifies**:
- All TypeScript compiles successfully
- All imports resolve correctly
- No build errors or warnings
- Output files generated in `dist/`

---

## Manual Testing Checklist

### Pre-Commit Testing

Before committing code, verify:

#### Navigation
- [ ] Home page loads correctly
- [ ] Can navigate to all pages via header
- [ ] Mobile navigation works
- [ ] Back button works in browser
- [ ] 404 page shows for invalid routes

#### Restaurant Discovery
- [ ] Restaurant list displays
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Sort options work
- [ ] Restaurant cards show correct info
- [ ] Click restaurant opens detail page

#### Menu & Cart
- [ ] Menu items display correctly
- [ ] Can add items to cart
- [ ] Cart badge updates
- [ ] Cart drawer opens/closes
- [ ] Can adjust quantities
- [ ] Can remove items
- [ ] Cart total calculates correctly

#### Checkout
- [ ] Checkout page loads with cart items
- [ ] Can select delivery address
- [ ] Can select payment method
- [ ] Order summary displays correctly
- [ ] Can place order
- [ ] Order confirmation shows

#### Orders
- [ ] Order history displays
- [ ] Order status shows correctly
- [ ] Timeline visualization works
- [ ] Order details viewable

#### Authentication
- [ ] Login page displays
- [ ] Can submit login form
- [ ] Registration form works
- [ ] User state updates after login
- [ ] Logout works

#### Profile
- [ ] Profile page displays user info
- [ ] Can edit profile
- [ ] Addresses display
- [ ] Can add/remove addresses
- [ ] Language preference changes

#### Localization
- [ ] English content displays
- [ ] Can switch to Urdu
- [ ] Urdu content displays
- [ ] RTL layout applies for Urdu
- [ ] Language toggle works

#### Responsive Design
- [ ] Mobile layout (320px)
- [ ] Tablet layout (768px)
- [ ] Desktop layout (1024px+)
- [ ] Mobile navigation shows on small screens
- [ ] Desktop navigation shows on large screens

#### Performance
- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Smooth animations
- [ ] Images load correctly

---

## Browser Testing

### Supported Browsers

Test in all major browsers:

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Required |
| Firefox | Latest | ✅ Required |
| Safari | Latest | ✅ Required |
| Edge | Latest | ✅ Required |
| Mobile Chrome | Latest | ✅ Required |
| Mobile Safari | Latest | ✅ Required |

### Browser DevTools Testing

#### Console
- Check for JavaScript errors
- Verify no warnings
- Monitor network requests

#### Network
- Verify all assets load
- Check response times
- Monitor bundle size

#### Performance
- Record performance profile
- Check for long tasks
- Verify smooth scrolling

#### Accessibility
- Run Lighthouse audit
- Check color contrast
- Verify keyboard navigation
- Test screen reader compatibility

---

## Device Testing

### Screen Sizes

Test on common device widths:

| Device Type | Width | Breakpoint |
|-------------|-------|------------|
| Mobile Small | 320px | Default |
| Mobile Large | 428px | sm |
| Tablet | 768px | md |
| Laptop | 1024px | lg |
| Desktop | 1440px | xl |

### Testing Methods

1. **Browser DevTools**: Use device emulation mode
2. **Responsive Design Mode**: Toggle in browser
3. **Real Devices**: Test on actual phones/tablets when possible

---

## Feature Testing Scenarios

### Scenario 1: New User Orders Food

**Steps**:
1. Open application
2. Browse restaurants
3. Select a restaurant
4. Add items to cart
5. Open cart
6. Proceed to checkout
7. Select address
8. Choose payment method
9. Place order
10. View order confirmation

**Expected**: Order placed successfully, confirmation shown

### Scenario 2: Search for Specific Cuisine

**Steps**:
1. Go to restaurants page
2. Click filter button
3. Select "Biryani" category
4. View filtered results
5. Verify only biryani restaurants shown

**Expected**: Only biryani restaurants displayed

### Scenario 3: Switch Language

**Steps**:
1. Open application in English
2. Click language toggle
3. Verify all content switches to Urdu
4. Verify RTL layout applies
5. Switch back to English

**Expected**: Language changes correctly, layout adjusts

### Scenario 4: Cart Persistence

**Steps**:
1. Add items to cart
2. Navigate to different pages
3. Return to home
4. Open cart

**Expected**: Cart items still present (within session)

**Known Limitation**: Cart clears on page refresh (demo mode)

### Scenario 5: Mobile Navigation

**Steps**:
1. Open on mobile device (or resize browser)
2. Verify bottom navigation appears
3. Tap each navigation item
4. Verify correct page loads

**Expected**: Mobile nav works correctly

---

## Performance Testing

### Load Time Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ~1.2s |
| Largest Contentful Paint | < 2.5s | ~2.0s |
| Time to Interactive | < 3.5s | ~2.8s |
| Cumulative Layout Shift | < 0.1 | ~0.05 |

### Bundle Size Targets

| Asset | Target | Current |
|-------|--------|---------|
| JavaScript | < 300KB | 281KB |
| CSS | < 50KB | 37KB |
| Total | < 350KB | 318KB |

### Testing Tools

- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: Online performance testing
- **GTmetrix**: Performance analysis

---

## Accessibility Testing

### WCAG 2.1 AA Compliance

#### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] No keyboard traps

#### Screen Readers
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] ARIA attributes used correctly
- [ ] Dynamic content announced

#### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1
- [ ] Large text contrast ≥ 3:1
- [ ] Not relying on color alone
- [ ] Focus indicators visible

#### Motion & Animation
- [ ] Respects prefers-reduced-motion
- [ ] No flashing content
- [ ] Animations can be paused

### Testing Tools

- **axe DevTools**: Browser extension
- **Lighthouse**: Accessibility audit
- **WAVE**: Web accessibility evaluator
- **VoiceOver/TalkBack**: Screen reader testing

---

## Security Testing (Manual)

### Current Security Posture

⚠️ **Demo Mode** — No real security implemented yet

### Manual Security Checks

#### Input Validation
- [ ] Forms validate user input
- [ ] No XSS via input fields
- [ ] Special characters handled
- [ ] SQL injection not possible (no backend yet)

#### Authentication
- [ ] Login form present
- [ ] Password field masked
- [ ] No credentials in URL
- [ ] Session management working (demo)

#### Data Exposure
- [ ] No sensitive data in console
- [ ] No API keys in frontend code
- [ ] No credentials in localStorage
- [ ] Error messages don't leak info

### Planned Security Testing (Milestone 2+)

- OWASP Top 10 testing
- Penetration testing
- Dependency vulnerability scanning
- Security header verification
- Authentication bypass testing
- Authorization testing
- Session management testing

---

## Regression Testing

### After Code Changes

When making changes, verify:

1. **Existing features still work**
   - All navigation paths
   - Cart functionality
   - Checkout flow
   - Order management

2. **No new errors introduced**
   - Run `npm run typecheck`
   - Check browser console
   - Test all affected pages

3. **Performance not degraded**
   - Page load time
   - Bundle size
   - Animation smoothness

---

## Bug Reporting

### Bug Report Template

```markdown
**Description**: Brief description of the bug

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Screen size: 1920x1080

**Screenshots**: If applicable

**Console Errors**: If any
```

### Where to Report

- **GitHub Issues**: For bugs and feature requests
- **Internal**: During development phase

---

## Automated Testing (Planned)

### Unit Tests (Jest/Vitest)

```typescript
// Example: Cart calculation test
describe('Cart Total Calculation', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { menuItem: { price: 100 }, quantity: 2 },
      { menuItem: { price: 200 }, quantity: 1 },
    ];
    const total = calculateSubtotal(items);
    expect(total).toBe(400);
  });
});
```

### Component Tests (React Testing Library)

```typescript
// Example: Restaurant card test
test('displays restaurant name and rating', () => {
  render(<RestaurantCard restaurant={mockRestaurant} />);
  expect(screen.getByText('Lahori Chargha')).toBeInTheDocument();
  expect(screen.getByText('4.7')).toBeInTheDocument();
});
```

### E2E Tests (Playwright)

```typescript
// Example: Order placement test
test('user can place an order', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Browse Restaurants');
  await page.click('.restaurant-card:first-child');
  await page.click('text=Add to Cart');
  await page.click('text=Checkout');
  await page.click('text=Place Order');
  await expect(page.locator('text=Order Confirmed')).toBeVisible();
});
```

---

## Test Results Documentation

### Build Test Results

**Date**: 2024-01-16
**Version**: 0.1.0

```
✅ TypeScript compilation: PASS
✅ Production build: PASS
✅ No errors or warnings
✅ Bundle size: 281KB JS, 37KB CSS
```

### Manual Test Results

**Date**: 2024-01-16
**Browser**: Chrome 120, Firefox 121, Safari 17

```
✅ Navigation: PASS
✅ Restaurant discovery: PASS
✅ Menu browsing: PASS
✅ Cart functionality: PASS
✅ Checkout flow: PASS
✅ Order management: PASS
✅ Authentication (demo): PASS
✅ Profile management: PASS
✅ Localization: PASS
✅ Responsive design: PASS
```

---

## Continuous Integration (Planned)

### GitHub Actions Workflow

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
      - run: npm test  # When tests are added
```

---

## Related Documentation

- [Build Status](../BUILD_STATUS.md) — Current implementation status
- [Local Setup](local-setup.md) — Development environment
- [Troubleshooting](../guides/troubleshooting-guide.md) — Common issues

---

**Testing is critical for quality. Test thoroughly before committing!** ✅
