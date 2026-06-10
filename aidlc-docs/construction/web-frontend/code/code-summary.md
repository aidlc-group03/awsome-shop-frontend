# Code Summary - AWSome Shop Frontend

This document summarizes all generated and modified files for the AWSome Shop employee points redemption system frontend.

---

## File Inventory by Layer

### Types Layer

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/types/index.ts` | Domain entity type definitions (User, Product, Category, Order, PointsRecord, PaginatedResponse, etc.) | All US-E, US-A, US-S |

### Mock Layer

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/mock/data.ts` | Static mock data for products, categories, users, orders, points records | All stories (dev/test mode) |
| `src/mock/index.ts` | Mock service initialization, conditional loading based on VITE_USE_MOCK | US-S01 |

### Service Layer

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/services/request.ts` | Axios instance with interceptors (auth token injection, error handling) | US-S01, US-S02 |
| `src/services/authService.ts` | Login, logout, token refresh API calls | US-E01, US-A01 |
| `src/services/productService.ts` | Product CRUD, listing, search, category filter | US-E02, US-E03, US-A02, US-A03, US-A04 |
| `src/services/categoryService.ts` | Category CRUD, listing | US-A05, US-A06, US-A07 |
| `src/services/orderService.ts` | Order creation, listing, status management | US-E05, US-E06, US-E07, US-A08, US-A09, US-A10 |
| `src/services/pointsService.ts` | Points balance query, history, admin allocation/deduction | US-E08, US-E09, US-A11, US-A12, US-A13 |
| `src/services/userService.ts` | User listing, management (admin) | US-A14 |

### State Management

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/store/useAuthStore.ts` | Authentication state (user info, login/logout, role, persist to localStorage) - refactored for full auth flow | US-E01, US-A01, US-S02 |
| `src/store/useAppStore.ts` | Application state (dark mode, language preference, persist) | US-S03 |

### Common Components

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/components/ProductCard.tsx` | Product display card with image, name, points, stock status | US-E02, US-E03 |
| `src/components/StatusChip.tsx` | Colored status badge for orders and products | US-E06, US-A08 |
| `src/components/ConfirmDialog.tsx` | Reusable confirmation modal dialog | US-E05, US-A09, US-A10 |
| `src/components/LoadingState.tsx` | Loading spinner/skeleton placeholder | All pages |
| `src/components/EmptyState.tsx` | Empty data state illustration with message | US-E06, US-E09 |
| `src/components/PageHeader.tsx` | Page title with optional breadcrumb and action buttons | All pages |
| `src/components/AvatarMenu.tsx` | User avatar dropdown (language/theme switch, logout) | US-S03, US-E01 |
| `src/components/Layout/index.tsx` | Layout barrel export | - |
| `src/components/Layout/AdminLayout.tsx` | Admin layout with sidebar navigation | US-A01 |
| `src/components/Layout/EmployeeLayout.tsx` | Employee layout with top navigation | US-E01 |
| `src/components/Layout/AppHeader.tsx` | Shared app header component | US-E01, US-A01 |
| `src/components/Layout/Sidebar.tsx` | Admin sidebar navigation menu | US-A01 |

### Employee Pages

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/pages/Login/index.tsx` | Login page (refactored with full auth integration) | US-E01, US-A01 |
| `src/pages/ShopHome/index.tsx` | Shop home page (refactored with product listing, search, category filter) | US-E02, US-E03, US-E04 |
| `src/pages/ProductDetail/index.tsx` | Product detail page with redemption action | US-E04, US-E05 |
| `src/pages/Redemption/index.tsx` | Points redemption confirmation page | US-E05 |
| `src/pages/RedemptionSuccess/index.tsx` | Redemption success result page | US-E05 |
| `src/pages/Orders/index.tsx` | Order/redemption history list | US-E06, US-E07 |
| `src/pages/OrderDetail/index.tsx` | Order detail page with status timeline | US-E07 |
| `src/pages/PointsCenter/index.tsx` | Points balance and transaction history | US-E08, US-E09, US-E10, US-E11 |

### Admin Pages

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/pages/Dashboard/index.tsx` | Admin dashboard (refactored with statistics overview) | US-A01 |
| `src/pages/admin/ProductManage/index.tsx` | Product CRUD management table | US-A02, US-A03, US-A04 |
| `src/pages/admin/CategoryManage/index.tsx` | Category CRUD management | US-A05, US-A06, US-A07 |
| `src/pages/admin/OrderManage/index.tsx` | Order management with status operations | US-A08, US-A09, US-A10 |
| `src/pages/admin/PointsManage/index.tsx` | Points allocation and deduction management | US-A11, US-A12, US-A13 |
| `src/pages/admin/UserManage/index.tsx` | User account management | US-A14 |

### Router

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/router/index.tsx` | Route definitions with lazy loading and role-based access (updated) | US-S02 |
| `src/router/AuthGuard.tsx` | Route guard component for authentication and role check | US-S02 |

### Internationalization (i18n)

| File | Purpose | Related Stories |
|------|---------|----------------|
| `src/i18n/index.ts` | i18next configuration (language detection, fallback) | US-S03 |
| `src/i18n/locales/zh.json` | Chinese translations (expanded with all page keys) | US-S03 |
| `src/i18n/locales/en.json` | English translations (expanded with all page keys) | US-S03 |

### Infrastructure

| File | Purpose | Related Stories |
|------|---------|----------------|
| `.env` | Environment variables (VITE_USE_MOCK, VITE_API_BASE_URL) | US-S01 |
| `src/vite-env.d.ts` | Vite environment variable type declarations | - |
| `src/theme/index.ts` | MUI theme factory (light/dark mode, design tokens) | US-S03 |

---

## Design-to-Code Mapping

The implementation follows the Pencil wireframes from the functional design phase:

| Pencil Frame | Implemented Page |
|--------------|-----------------|
| Login | `src/pages/Login/index.tsx` |
| Shop Home (Product Grid) | `src/pages/ShopHome/index.tsx` |
| Product Detail | `src/pages/ProductDetail/index.tsx` |
| Redemption Confirm | `src/pages/Redemption/index.tsx` |
| Redemption Success | `src/pages/RedemptionSuccess/index.tsx` |
| Order List | `src/pages/Orders/index.tsx` |
| Order Detail | `src/pages/OrderDetail/index.tsx` |
| Points Center | `src/pages/PointsCenter/index.tsx` |
| Admin Dashboard | `src/pages/Dashboard/index.tsx` |
| Product Management | `src/pages/admin/ProductManage/index.tsx` |
| Category Management | `src/pages/admin/CategoryManage/index.tsx` |
| Order Management | `src/pages/admin/OrderManage/index.tsx` |
| Points Management | `src/pages/admin/PointsManage/index.tsx` |
| User Management | `src/pages/admin/UserManage/index.tsx` |

---

## Mock Data Strategy

The application supports two runtime modes controlled by the `VITE_USE_MOCK` environment variable:

### Mock Mode (VITE_USE_MOCK=true)

- Default mode for development and demo purposes
- All API calls are intercepted and return local mock data from `src/mock/data.ts`
- No backend server required
- Supports full CRUD operations with in-memory state

### Real API Mode (VITE_USE_MOCK=false)

- Production mode connecting to actual backend services
- API base URL configured via `VITE_API_BASE_URL`
- Axios interceptors handle token injection and error responses
- Service layer remains unchanged; only the data source differs

### Switching Between Modes

```bash
# Development with mock data (default)
VITE_USE_MOCK=true npm run dev

# Development with real backend
VITE_USE_MOCK=false VITE_API_BASE_URL=http://localhost:8080 npm run dev

# Production build with real API
VITE_USE_MOCK=false npm run build
```

---

## Story Coverage Matrix

### Employee Stories (US-E01 ~ US-E11)

| Story ID | Description | Implementation Status |
|----------|-------------|----------------------|
| US-E01 | Employee login | Login page, AuthStore, AuthGuard |
| US-E02 | Browse products | ShopHome with product grid |
| US-E03 | Filter by category | ShopHome category filter |
| US-E04 | View product detail | ProductDetail page |
| US-E05 | Redeem product with points | Redemption + RedemptionSuccess |
| US-E06 | View redemption history | Orders page |
| US-E07 | View order detail | OrderDetail page |
| US-E08 | View points balance | PointsCenter page |
| US-E09 | View points history | PointsCenter transaction list |
| US-E10 | Receive points notification | PointsCenter display |
| US-E11 | Search products | ShopHome search functionality |

### Admin Stories (US-A01 ~ US-A14)

| Story ID | Description | Implementation Status |
|----------|-------------|----------------------|
| US-A01 | Admin login | Login page with role routing |
| US-A02 | View product list | ProductManage table |
| US-A03 | Add new product | ProductManage create dialog |
| US-A04 | Edit/delete product | ProductManage edit/delete |
| US-A05 | View categories | CategoryManage table |
| US-A06 | Add category | CategoryManage create dialog |
| US-A07 | Edit/delete category | CategoryManage edit/delete |
| US-A08 | View all orders | OrderManage table |
| US-A09 | Process order | OrderManage status actions |
| US-A10 | Cancel order | OrderManage cancel action |
| US-A11 | View points records | PointsManage table |
| US-A12 | Allocate points | PointsManage allocate dialog |
| US-A13 | Deduct points | PointsManage deduct dialog |
| US-A14 | Manage users | UserManage table |

### System Stories (US-S01 ~ US-S03)

| Story ID | Description | Implementation Status |
|----------|-------------|----------------------|
| US-S01 | Mock/real API switch | VITE_USE_MOCK env, mock service |
| US-S02 | Role-based routing | AuthGuard, router config |
| US-S03 | i18n and theme switching | i18n config, theme factory, AvatarMenu |

---

## Business Rules Compliance (BR-F1 ~ BR-F10)

| Rule ID | Description | Implementation |
|---------|-------------|----------------|
| BR-F1 | Points balance cannot be negative | Redemption page checks balance before submit |
| BR-F2 | Insufficient points prevents redemption | ProductDetail and Redemption disable action when balance < cost |
| BR-F3 | Out-of-stock products cannot be redeemed | ProductCard shows sold-out state, detail page disables redeem button |
| BR-F4 | Order status follows defined workflow | OrderManage enforces valid status transitions |
| BR-F5 | Only admin can manage products | AuthGuard with admin role check on /admin routes |
| BR-F6 | Only admin can allocate/deduct points | PointsManage page behind admin guard |
| BR-F7 | Login required for all operations | AuthGuard redirects to /login if unauthenticated |
| BR-F8 | User preferences persist across sessions | Zustand persist middleware for auth and app stores |
| BR-F9 | Points transactions are immutable records | Points history displayed read-only in PointsCenter |
| BR-F10 | Category deletion blocked if products exist | CategoryManage validates before delete |
