# KhaanaDa — Troubleshooting Guide

**Version**: 0.1.0
**Last Updated**: 2024-01-16

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| App won't start | `rm -rf node_modules && npm install` |
| Blank page | Check browser console for errors |
| Build fails | Run `npm run typecheck` to find errors |
| Styles not working | Restart dev server |
| Cart not working | Refresh page (demo mode limitation) |
| Language not switching | Click globe icon again |
| Images not loading | Check internet connection |

---

## Installation Issues

### Problem: `npm install` fails

**Symptoms**:
- Error messages during installation
- Packages not installing
- `node_modules` not created

**Likely Causes**:
1. Node.js version too old
2. Network connectivity issues
3. Corrupted package-lock.json
4. Permission issues

**Steps to Diagnose**:
```bash
# Check Node.js version
node --version  # Should be v18.x or higher

# Check npm version
npm --version   # Should be v9.x or higher

# Check network
ping registry.npmjs.org
```

**Resolution**:

1. **Update Node.js**:
   ```bash
   # Download latest LTS from https://nodejs.org/
   # Or use nvm (Node Version Manager)
   nvm install 18
   nvm use 18
   ```

2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

3. **Delete and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Use different registry** (if network issues):
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

5. **Fix permissions** (Linux/Mac):
   ```bash
   sudo chown -R $USER .
   npm install
   ```

**Escalation**: If issue persists, check npm error logs in `~/.npm/_logs/`

---

### Problem: Dependencies installed but app won't start

**Symptoms**:
- `npm install` succeeds
- `npm run dev` fails
- Error about missing modules

**Likely Causes**:
1. Incomplete installation
2. Corrupted node_modules
3. Version mismatch

**Steps to Diagnose**:
```bash
# Check if node_modules exists
ls node_modules

# Verify key packages
ls node_modules/react
ls node_modules/vite
```

**Resolution**:
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm run typecheck
```

---

## Development Server Issues

### Problem: Port already in use

**Symptoms**:
```
Error: Port 5173 is already in use
```

**Likely Causes**:
1. Another instance of dev server running
2. Another application using port 5173

**Steps to Diagnose**:
```bash
# Check what's using the port (Linux/Mac)
lsof -i :5173

# Windows
netstat -ano | findstr :5173
```

**Resolution**:

1. **Kill the process**:
   ```bash
   # Linux/Mac
   lsof -ti:5173 | xargs kill -9
   
   # Windows
   taskkill /PID <PID> /F
   ```

2. **Use different port**:
   ```bash
   npm run dev -- --port 3000
   ```

---

### Problem: Hot reload not working

**Symptoms**:
- Code changes don't reflect in browser
- Need manual refresh

**Likely Causes**:
1. Vite HMR not configured
2. File not saved
3. Browser cache

**Steps to Diagnose**:
1. Check terminal for HMR messages
2. Verify file is saved (Ctrl+S)
3. Check browser console for errors

**Resolution**:

1. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache**:
   - Chrome: DevTools → Network → Disable cache
   - Or hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

3. **Check Vite config**:
   - Verify `vite.config.js` exists
   - Ensure React plugin is configured

---

## Build Issues

### Problem: TypeScript compilation errors

**Symptoms**:
```
npm run typecheck
Error TS2304: Cannot find name 'X'
Error TS2307: Cannot find module 'Y'
```

**Likely Causes**:
1. Missing imports
2. Type definition errors
3. Incorrect file paths
4. Missing type declarations

**Steps to Diagnose**:
```bash
# Run type check
npm run typecheck

# Read error messages carefully
# Note file name and line number
```

**Resolution**:

1. **Check imports**:
   ```typescript
   // Ensure all imports are correct
   import { User } from './types';  // Not './Types'
   ```

2. **Verify file paths**:
   - Check case sensitivity (Linux is case-sensitive)
   - Verify file exists at specified path

3. **Add missing types**:
   ```typescript
   // If using external library without types
   npm install --save-dev @types/library-name
   ```

4. **Fix type errors**:
   - Read error message carefully
   - Check interface definitions in `src/types/`
   - Ensure props match component expectations

---

### Problem: Build succeeds but output is broken

**Symptoms**:
- `npm run build` succeeds
- `dist/` files generated
- App doesn't work when opened

**Likely Causes**:
1. Opening HTML file directly (not via server)
2. Missing assets
3. Incorrect base path

**Steps to Diagnose**:
```bash
# Check dist directory
ls dist/

# Should see:
# - index.html
# - assets/
```

**Resolution**:

1. **Use preview server**:
   ```bash
   npm run preview
   ```
   Then open `http://localhost:4173`

2. **Don't open HTML directly**:
   - ❌ `file:///path/to/dist/index.html`
   - ✅ `http://localhost:4173`

3. **Check base path** (if deploying to subdirectory):
   ```javascript
   // vite.config.js
   export default {
     base: '/subdirectory/'
   }
   ```

---

## Runtime Issues

### Problem: Blank page / Nothing displays

**Symptoms**:
- Page loads but shows nothing
- White screen
- No content visible

**Likely Causes**:
1. JavaScript error preventing render
2. Missing root element
3. Import errors

**Steps to Diagnose**:
1. Open browser console (F12)
2. Check for red error messages
3. Look for "Uncaught" errors

**Resolution**:

1. **Check console errors**:
   - Read error message
   - Note file and line number
   - Fix the error

2. **Verify index.html**:
   ```html
   <!-- Must have root div -->
   <div id="root"></div>
   ```

3. **Check main.tsx**:
   ```typescript
   // Must render App component
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <App />
   );
   ```

4. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R
   - Or clear cache completely

---

### Problem: Navigation not working

**Symptoms**:
- Clicking links does nothing
- URL changes but page doesn't update
- 404 errors on valid routes

**Likely Causes**:
1. React Router not configured
2. Missing route definition
3. Browser history issue

**Steps to Diagnose**:
1. Check URL in address bar
2. Check browser console for errors
3. Verify route exists in `App.tsx`

**Resolution**:

1. **Check route definition**:
   ```typescript
   // In App.tsx
   <Route path="/restaurants" element={<RestaurantsPage />} />
   ```

2. **Verify BrowserRouter**:
   ```typescript
   // Must wrap app in BrowserRouter
   <BrowserRouter>
     <App />
   </BrowserRouter>
   ```

3. **Check link component**:
   ```typescript
   // Use Link, not <a>
   import { Link } from 'react-router-dom';
   <Link to="/restaurants">Restaurants</Link>
   ```

---

### Problem: Images not loading

**Symptoms**:
- Broken image icons
- Missing restaurant/food images
- Alt text showing instead of images

**Likely Causes**:
1. No internet connection
2. External image URLs blocked
3. Image service down (Unsplash)
4. Ad blocker blocking images

**Steps to Diagnose**:
1. Check internet connection
2. Open image URL directly in browser
3. Check browser console for errors
4. Disable ad blocker

**Resolution**:

1. **Check internet**:
   - Verify connection is working
   - Try loading other websites

2. **Disable ad blocker**:
   - Temporarily disable ad blocker
   - Add site to whitelist

3. **Check image URLs**:
   ```typescript
   // Images from Unsplash
   // If Unsplash is down, images won't load
   // This is a known limitation of demo mode
   ```

4. **Clear browser cache**:
   - Images may be cached incorrectly
   - Hard refresh: Ctrl+Shift+R

---

## Feature-Specific Issues

### Problem: Cart not updating

**Symptoms**:
- Add items but cart stays empty
- Cart badge doesn't update
- Items disappear

**Likely Causes**:
1. Demo mode limitation (state not persisted)
2. JavaScript error
3. Context not working

**Steps to Diagnose**:
1. Check browser console for errors
2. Verify item is being added
3. Check if page was refreshed

**Resolution**:

1. **Understand demo limitation**:
   - Cart is stored in memory
   - Refreshing page clears cart
   - This is expected behavior in demo mode

2. **Don't refresh page**:
   - Cart persists during session
   - Only clears on refresh or closing browser

3. **Check console**:
   - Look for React errors
   - Verify no JavaScript errors

---

### Problem: Can't place order

**Symptoms**:
- Checkout button doesn't work
- Order not confirming
- Error during checkout

**Likely Causes**:
1. Cart is empty
2. No address selected
3. JavaScript error
4. Demo mode limitation

**Steps to Diagnose**:
1. Verify cart has items
2. Check address is selected
3. Check browser console
4. Verify payment method selected

**Resolution**:

1. **Ensure cart has items**:
   - Add at least one item
   - Check cart badge shows count

2. **Select address**:
   - Choose a delivery address
   - Ensure address is selected (highlighted)

3. **Select payment method**:
   - Choose COD or Online
   - Ensure one is selected

4. **Check console**:
   - Look for errors
   - Fix any JavaScript issues

---

### Problem: Language not switching

**Symptoms**:
- Click language toggle but nothing changes
- Text stays in English
- RTL doesn't apply for Urdu

**Likely Causes**:
1. Context not updating
2. JavaScript error
3. Cache issue

**Steps to Diagnose**:
1. Check browser console
2. Verify toggle is clickable
3. Check if state updates

**Resolution**:

1. **Click toggle again**:
   - Globe icon in header
   - Should switch between EN/UR

2. **Clear cache**:
   - Hard refresh: Ctrl+Shift+R
   - Or clear browser cache

3. **Check console**:
   - Look for errors
   - Fix any JavaScript issues

---

### Problem: Mobile layout broken

**Symptoms**:
- Layout looks wrong on mobile
- Elements overlapping
- Navigation missing

**Likely Causes**:
1. Browser zoom level
2. Not actually mobile viewport
3. CSS not loading

**Steps to Diagnose**:
1. Check browser zoom (should be 100%)
2. Verify mobile viewport
3. Check screen width

**Resolution**:

1. **Reset zoom**:
   - Ctrl+0 (Cmd+0 on Mac)
   - Or browser menu → Zoom → 100%

2. **Use device emulation**:
   - Chrome DevTools → Toggle device toolbar
   - Select mobile device

3. **Check actual mobile**:
   - Test on real phone
   - Or use browser device mode

---

## Performance Issues

### Problem: App loads slowly

**Symptoms**:
- Page takes long to load
- Laggy interactions
- Slow animations

**Likely Causes**:
1. Slow internet connection
2. Large bundle size
3. Too many images loading
4. Browser performance

**Steps to Diagnose**:
1. Check internet speed
2. Open DevTools → Network tab
3. Check bundle size
4. Monitor CPU usage

**Resolution**:

1. **Check internet**:
   - Test connection speed
   - Try on different network

2. **Clear cache**:
   - Browser may have corrupted cache
   - Hard refresh: Ctrl+Shift+R

3. **Close other tabs**:
   - Free up browser resources
   - Close unnecessary tabs

4. **Update browser**:
   - Use latest browser version
   - Older browsers may be slower

---

### Problem: High memory usage

**Symptoms**:
- Browser uses lots of RAM
- Computer slows down
- Browser crashes

**Likely Causes**:
1. Memory leak in app
2. Too many tabs open
3. Browser issue

**Steps to Diagnose**:
1. Open Task Manager (Shift+Esc in Chrome)
2. Check memory usage
3. Monitor over time

**Resolution**:

1. **Refresh page**:
   - Clears memory
   - Start fresh

2. **Close other tabs**:
   - Free up resources
   - Reduce memory usage

3. **Restart browser**:
   - Close completely
   - Reopen browser

---

## Browser-Specific Issues

### Chrome Issues

**Problem**: Extensions interfering

**Resolution**:
1. Open incognito mode (Ctrl+Shift+N)
2. Disable extensions one by one
3. Check if issue persists

### Firefox Issues

**Problem**: Styles not applying

**Resolution**:
1. Clear cache (Ctrl+Shift+Delete)
2. Check Firefox version
3. Update to latest version

### Safari Issues

**Problem**: Layout differences

**Resolution**:
1. Check Safari version
2. Update to latest version
3. Test in different browser

### Edge Issues

**Problem**: Compatibility issues

**Resolution**:
1. Edge is Chromium-based
2. Should work like Chrome
3. Try Chrome if issues persist

---

## Demo Mode Limitations

### Understanding Demo Mode

The current version is a **development demo** with these limitations:

1. **No Real Authentication**
   - Any credentials work
   - No password validation
   - No email verification

2. **No Data Persistence**
   - Data lost on page refresh
   - No database
   - No backend storage

3. **No Real Orders**
   - Orders are simulated
   - No actual processing
   - No restaurant notification

4. **No Real Payments**
   - COD is simulated
   - Online payment not implemented
   - No money transferred

5. **No Real Delivery**
   - No actual food delivery
   - No rider assignment
   - No real-time tracking

### Expected Behavior

These are **not bugs** but expected demo limitations:

- ✅ Cart clears on refresh
- ✅ Login accepts any credentials
- ✅ Orders don't actually process
- ✅ Data doesn't persist
- ✅ No real notifications

### When Will These Be Fixed?

- **Milestone 2**: Backend API & Database (data persistence)
- **Milestone 3**: Secure Authentication (real login)
- **Milestone 7**: Payment Integration (real payments)

---

## Getting Help

### Before Asking for Help

1. ✅ Read this troubleshooting guide
2. ✅ Check [Build Status](../BUILD_STATUS.md) for known issues
3. ✅ Search existing GitHub issues
4. ✅ Try all suggested solutions

### Providing Information

When asking for help, include:

1. **What you're trying to do**
2. **What happened** (error messages, screenshots)
3. **What you expected**
4. **Steps to reproduce**
5. **Environment**:
   - Browser and version
   - Operating system
   - Node.js version
   - npm version

### Where to Get Help

1. **GitHub Issues**: Report bugs and request features
2. **Documentation**: Check all docs in `docs/` folder
3. **Build Status**: See known issues and limitations

---

## Common Error Messages

### "Cannot find module 'X'"

**Cause**: Missing import or incorrect path

**Fix**: Check import statement and file path

### "Property 'X' does not exist on type 'Y'"

**Cause**: TypeScript type error

**Fix**: Check interface definition in `src/types/`

### "Module not found: Can't resolve 'X'"

**Cause**: Package not installed

**Fix**: Run `npm install` or install specific package

### "Unexpected token"

**Cause**: Syntax error in code

**Fix**: Check code for typos, missing brackets, etc.

### "Port 5173 already in use"

**Cause**: Another process using the port

**Fix**: Kill process or use different port (see above)

---

## Prevention Tips

### Avoid Common Issues

1. **Keep dependencies updated**:
   ```bash
   npm update
   ```

2. **Commit working code**:
   - Test before committing
   - Don't commit broken code

3. **Use version control**:
   - Git for tracking changes
   - Easy to revert if something breaks

4. **Read error messages**:
   - They usually tell you what's wrong
   - Don't ignore them

5. **Test regularly**:
   - Don't wait until end to test
   - Test after each major change

---

**Still having issues?** Check the [Build Status](../BUILD_STATUS.md) or open a GitHub issue.
