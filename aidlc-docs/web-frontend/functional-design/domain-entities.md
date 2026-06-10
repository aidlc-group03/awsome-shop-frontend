# Web Frontend — 数据模型与类型定义

## TypeScript 类型定义

### 用户相关

```typescript
type UserRole = 'employee' | 'admin';

interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  role: UserRole;
  avatarUrl: string | null;
  status: number;
  createdAt: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: UserInfo;
}

interface CreateUserRequest {
  username: string;
  password: string;
  displayName: string;
  email?: string;
  role: UserRole;
}

interface ListUserParams {
  page: number;
  size: number;
  keyword?: string;
}
```

### 商品相关

```typescript
interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string | null;
  pointsPrice: number;
  marketPrice: number | null;
  stock: number;
  soldCount: number;
  status: number; // 0=下架, 1=上架
  description: string | null;
  imageUrl: string | null;
  subtitle: string | null;
  deliveryMethod: string | null;
  serviceGuarantee: string | null;
  promotion: string | null;
  colors: string | null; // 逗号分隔
  specs: Array<{ key: string; value: string }> | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateProductRequest {
  name: string;
  sku: string;
  category: string;
  brand?: string;
  pointsPrice: number;
  marketPrice?: number;
  stock: number;
  status: number;
  description?: string;
  imageUrl?: string;
  subtitle?: string;
  deliveryMethod?: string;
  serviceGuarantee?: string;
  promotion?: string;
  colors?: string;
  specs?: Array<{ key: string; value: string }>;
}

interface UpdateProductRequest extends CreateProductRequest {
  id: number;
}

interface ListProductParams {
  page: number;
  size: number;
  name?: string;
  category?: string;
}

interface Category {
  id: number;
  name: string;
  iconUrl: string | null;
  sortOrder: number;
  status: number;
}

interface CreateCategoryRequest {
  name: string;
  iconUrl?: string;
  sortOrder?: number;
}

interface UpdateCategoryRequest {
  id: number;
  name: string;
  iconUrl?: string;
  sortOrder?: number;
}
```

### 订单相关

```typescript
type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

interface Order {
  id: number;
  orderNo: string;
  userId: number;
  productId: number;
  productName: string;
  pointsAmount: number;
  quantity: number;
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrderRequest {
  productId: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
}

interface ListOrderParams {
  page: number;
  size: number;
  status?: string;
  keyword?: string;
}

interface UpdateOrderStatusRequest {
  id: number;
  status: OrderStatus;
}
```

### 积分相关

```typescript
type TransactionType = 'earn' | 'spend' | 'refund' | 'admin_add' | 'admin_deduct';

interface PointsBalance {
  userId: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface PointsTransaction {
  id: number;
  userId: number;
  type: TransactionType;
  points: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

interface PointsAccount {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface GrantPointsRequest {
  userId: number;
  points: number;
  description: string;
}

interface DeductPointsRequest {
  userId: number;
  points: number;
  description: string;
}

interface ListTransactionParams {
  page: number;
  size: number;
  type?: string;
}

interface ListAccountsParams {
  page: number;
  size: number;
  keyword?: string;
}
```

### 通用类型

```typescript
interface PageResult<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
```

---

## 页面新增文件清单

### 员工端新增页面
| 文件路径 | 用途 |
|---------|------|
| `src/pages/ProductDetail/index.tsx` | 商品详情页 |
| `src/pages/Redemption/index.tsx` | 兑换确认页 |
| `src/pages/RedemptionSuccess/index.tsx` | 兑换成功页 |
| `src/pages/Orders/index.tsx` | 兑换记录列表 |
| `src/pages/OrderDetail/index.tsx` | 订单详情 |
| `src/pages/PointsCenter/index.tsx` | 积分中心 |

### 管理端新增页面
| 文件路径 | 用途 |
|---------|------|
| `src/pages/admin/ProductManage/index.tsx` | 商品管理 |
| `src/pages/admin/CategoryManage/index.tsx` | 分类管理 |
| `src/pages/admin/OrderManage/index.tsx` | 订单管理 |
| `src/pages/admin/PointsManage/index.tsx` | 积分管理 |
| `src/pages/admin/UserManage/index.tsx` | 用户管理 |

### API Service 新增
| 文件路径 | 用途 |
|---------|------|
| `src/services/authService.ts` | 认证API |
| `src/services/productService.ts` | 商品API |
| `src/services/categoryService.ts` | 分类API |
| `src/services/orderService.ts` | 订单API |
| `src/services/pointsService.ts` | 积分API |
| `src/services/userService.ts` | 用户API |

### 通用组件新增
| 文件路径 | 用途 |
|---------|------|
| `src/components/ProductCard.tsx` | 商品卡片 |
| `src/components/StatusChip.tsx` | 状态标签 |
| `src/components/ConfirmDialog.tsx` | 确认对话框 |
| `src/components/LoadingState.tsx` | 加载状态 |
| `src/components/EmptyState.tsx` | 空状态 |
| `src/components/PageHeader.tsx` | 页面标题 |

### 类型定义
| 文件路径 | 用途 |
|---------|------|
| `src/types/index.ts` | 所有 TypeScript 类型定义 |
