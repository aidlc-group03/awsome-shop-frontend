// User related types
export type UserRole = 'employee' | 'admin';

export interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  role: UserRole;
  avatarUrl: string | null;
  status: number;
  empNo: string | null;
  department: string | null;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  displayName: string;
  email?: string;
  role: UserRole;
  empNo?: string;
  department?: string;
}

export interface ListUserParams {
  page: number;
  size: number;
  keyword?: string;
}

// Product related types
export interface Product {
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

export interface CreateProductRequest {
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

export interface UpdateProductRequest extends CreateProductRequest {
  id: number;
}

export interface ListProductParams {
  page: number;
  size: number;
  name?: string;
  category?: string;
  status?: number;
}

export interface Category {
  id: number;
  name: string;
  iconUrl: string | null;
  sortOrder: number;
  status: number;
}

export interface CreateCategoryRequest {
  name: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  iconUrl?: string;
  sortOrder?: number;
}

// Order related types
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export type OrderTimelineKey =
  | 'submitted'
  | 'confirmed'
  | 'pending_ship'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export interface OrderTimelineEvent {
  key: OrderTimelineKey;
  occurredAt: string;
  description?: string;
}

export interface Order {
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
  // Optional enriched fields for admin detail view
  productSku?: string | null;
  productCategory?: string | null;
  productSpec?: string | null;
  productImageColor?: string | null; // tailwind-like hex for icon background
  shippingPoints?: number; // freight points (usually 0)
  expressCompany?: string | null;
  trackingNumber?: string | null;
  shippingNote?: string | null;
  orderSource?: string | null;
  orderNote?: string | null;
  statusHistory?: OrderTimelineEvent[];
}

export interface CreateOrderRequest {
  productId: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
}

export interface ListOrderParams {
  page: number;
  size: number;
  status?: string;
  keyword?: string;
  days?: number; // optional date range filter (last N days)
}

export interface UpdateOrderStatusRequest {
  id: number;
  status: OrderStatus;
}

export interface UpdateShippingRequest {
  id: number;
  status: OrderStatus; // 'shipping' | 'completed'
  expressCompany?: string;
  trackingNumber?: string;
  shippingNote?: string;
}

// Points related types
export type TransactionType = 'earn' | 'spend' | 'refund' | 'admin_add' | 'admin_deduct';

export interface PointsBalance {
  userId: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface PointsTransaction {
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

export interface PointsAccount {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  empNo: string | null;
  department: string | null;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  redeemCount: number;
}

export interface GrantPointsRequest {
  userId: number;
  points: number;
  description: string;
  reason?: string;
}

export interface DeductPointsRequest {
  userId: number;
  points: number;
  description: string;
  reason?: string;
}

export interface ListTransactionParams {
  page: number;
  size: number;
  type?: string;
}

export interface ListAccountsParams {
  page: number;
  size: number;
  keyword?: string;
}

// Generic types
export interface PageResult<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
