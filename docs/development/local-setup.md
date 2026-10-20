# KhaanaDa — Local Development Setup

**Version**: 0.1.0
**Last Updated**: 2024-01-16

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v9.x or higher (included with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

### Recommended
- **VS Code**: Latest version with extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
  - Prettier - Code formatter
- **Browser**: Chrome/Firefox with React Developer Tools

### Verify Installation

```bash
node --version    # Should be v18.x or higher
npm --version     # Should be v9.x or higher
git --version     # Should show git version
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AtifBukhai/FoodApp.git
cd FoodApp
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages defined in `package.json`:
- React 18.2
- React Router DOM 6.8
- Tailwind CSS 4.1
- TypeScript 5.7
- Vite 6.3
- Lucide React (icons)
- Framer Motion (animations)
- And other utilities

### 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

**Expected output**:
```
  VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4. Open in Browser

Navigate to `http://localhost:5173` in your browser.

You should see the KhaanaDa landing page with:
- Hero section with branding
- Featured restaurants
- Category navigation
- Mobile-responsive layout

---

## Available Scripts

### Development

```bash
# Start development server with hot module replacement
npm run dev
```

**Features**:
- Hot Module Replacement (HMR)
- Fast refresh on code changes
- Source maps for debugging
- Error overlay in browser

### Build

```bash
# Type check without emitting files
npm run typecheck

# Build for production
npm run build
```

**Output**:
- `dist/` directory with optimized production files
- Minified JavaScript and CSS
- Optimized images and assets
- Source maps (optional)

### Preview

```bash
# Preview production build locally
npm run preview
```

Runs the production build on `http://localhost:4173`

---

## Project Structure

```
FoodApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # React Context (state management)
│   ├── data/                # Mock data (restaurants, menus)
│   ├── pages/               # Route-level page components
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx              # Root component & routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── docs/                    # Documentation
├── index.html               # HTML template
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.js           # Vite configuration
└── README.md                # Project documentation
```

---

## Development Workflow

### Making Changes

1. **Start the dev server**: `npm run dev`
2. **Make code changes** in your editor
3. **Save files** — Vite automatically reloads the browser
4. **Test changes** in the browser
5. **Check for TypeScript errors**: `npm run typecheck`
6. **Build for production**: `npm run build`

### Adding a New Page

1. Create a new file in `src/pages/`:
   ```typescript
   // src/pages/NewPage.tsx
   export default function NewPage() {
     return <div>New Page Content</div>;
   }
   ```

2. Add route in `src/App.tsx`:
   ```typescript
   import NewPage from './pages/NewPage';
   
   // In Routes component:
   <Route path="/new-page" element={<NewPage />} />
   ```

3. Add navigation link in `src/components/Header.tsx` or `MobileNav.tsx`

### Adding a New Component

1. Create component file in `src/components/`:
   ```typescript
   // src/components/NewComponent.tsx
   interface Props {
     title: string;
   }
   
   export default function NewComponent({ title }: Props) {
     return <h2>{title}</h2>;
   }
   ```

2. Import and use in other components:
   ```typescript
   import NewComponent from './NewComponent';
   
   <NewComponent title="Hello" />
   ```

### Modifying Styles

Styles are managed with Tailwind CSS utility classes:

```typescript
<div className="bg-kh-orange text-white p-4 rounded-xl">
  Content
</div>
```

Custom colors defined in `src/index.css`:
- `bg-kh-orange` — Primary orange (#F97316)
- `bg-kh-green` — Deep green (#166534)
- `bg-kh-cream` — Cream background (#FFF8F0)

---

## Environment Variables

Currently, the application does not require environment variables (demo mode).

When backend integration is added (Milestone 2), you'll need:

```bash
# Create .env file
VITE_API_URL=http://localhost:3000/api
VITE_MAPS_API_KEY=your_maps_api_key
```

**Note**: Never commit `.env` files to version control.

---

## Common Issues

### Port Already in Use

**Problem**: `npm run dev` fails with "Port 5173 already in use"

**Solution**:
```bash
# Kill process on port 5173 (Linux/Mac)
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### TypeScript Errors

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Check for errors
npm run typecheck

# Common fixes:
# 1. Ensure all imports are correct
# 2. Check type definitions in src/types/
# 3. Verify component props match interfaces
```

### Build Fails

**Problem**: `npm run build` fails

**Solution**:
1. Run `npm run typecheck` to identify TypeScript errors
2. Check console for specific error messages
3. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Styles Not Applying

**Problem**: Tailwind classes not working

**Solution**:
1. Ensure Tailwind is configured in `vite.config.js`
2. Check `src/index.css` has `@import "tailwindcss"`
3. Restart dev server: `npm run dev`

### Browser Shows Blank Page

**Problem**: Page loads but nothing displays

**Solution**:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify `src/main.tsx` is correctly rendering `<App />`
4. Check `index.html` has `<div id="root"></div>`

---

## Testing Your Changes

### Manual Testing Checklist

Before committing changes:

- [ ] Page loads without errors
- [ ] Navigation works correctly
- [ ] All interactive elements respond
- [ ] Cart functionality works
- [ ] Forms validate correctly
- [ ] Language switching works (EN/UR)
- [ ] Mobile layout is responsive
- [ ] No console errors
- [ ] TypeScript compilation passes

### Browser Testing

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Device Testing

Test on different screen sizes:
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)

Use browser DevTools device emulation for testing.

---

## Code Style Guidelines

### TypeScript
- Use strict mode (enabled in tsconfig.json)
- Define interfaces for all data structures
- Avoid `any` type — use proper types
- Use type imports: `import type { User } from './types'`

### React
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Avoid inline styles — use Tailwind classes
- Use meaningful component names

### File Organization
- One component per file
- Co-locate related files (component + styles + tests)
- Use index.ts for barrel exports (when needed)
- Keep directory structure flat (avoid deep nesting)

### Naming Conventions
- Components: PascalCase (`RestaurantCard.tsx`)
- Files: PascalCase for components, camelCase for utilities
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

---

## Git Workflow

### Branch Strategy

```bash
# Main branch (production-ready)
main

# Feature branches
feature/add-search-filter
feature/implement-checkout

# Bug fix branches
fix/cart-total-calculation
fix/mobile-navigation
```

### Commit Messages

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```bash
git commit -m "feat: add restaurant search functionality"
git commit -m "fix: correct cart total calculation"
git commit -m "docs: update README with setup instructions"
```

---

## Next Steps

After setting up the development environment:

1. ✅ Verify the application runs locally
2. ✅ Explore all pages and features
3. ✅ Review the codebase structure
4. ✅ Read the [Customer User Guide](../guides/customer-user-guide.md)
5. ✅ Check [Build Status](../BUILD_STATUS.md) for current limitations
6. 🔄 Review [Architecture Overview](../architecture/system-overview.md)
7. 🔄 Plan backend integration (Milestone 2)

---

## Support

If you encounter issues:

1. Check this guide's "Common Issues" section
2. Review [Troubleshooting Guide](../guides/troubleshooting-guide.md)
3. Check [Build Status](../BUILD_STATUS.md) for known issues
4. Open an issue on GitHub

---

**Happy Coding!** 🚀
