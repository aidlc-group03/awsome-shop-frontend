import type {
  UserInfo,
  LoginResponse,
  CreateUserRequest,
  ListUserParams,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductParams,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Order,
  OrderStatus,
  CreateOrderRequest,
  ListOrderParams,
  PointsBalance,
  PointsTransaction,
  PointsAccount,
  GrantPointsRequest,
  DeductPointsRequest,
  ListTransactionParams,
  ListAccountsParams,
  PageResult,
} from '../types';
import {
  mockUsers,
  mockProducts,
  mockCategories,
  mockOrders,
  mockPointsTransactions,
  mockPointsAccounts,
} from './data';

// In-memory data stores (mutable copies)
let users = [...mockUsers];
let products = [...mockProducts];
let categories = [...mockCategories];
let orders = [...mockOrders];
let pointsTransactions = [...mockPointsTransactions];
let pointsAccounts = [...mockPointsAccounts];

// Current logged-in user ID (set after login)
let currentUserId: number | null = null;

// Helper: random delay between 300-600ms
function mockDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * 300) + 300;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: paginate an array
function paginate<T>(list: T[], page: number, size: number): PageResult<T> {
  const total = list.length;
  const pages = Math.ceil(total / size) || 1;
  const start = (page - 1) * size;
  const records = list.slice(start, start + size);
  return { records, current: page, size, total, pages };
}

// Helper: generate next ID for a list
function nextId<T extends { id: number }>(list: T[]): number {
  return list.length > 0 ? Math.max(...list.map((item) => item.id)) + 1 : 1;
}

// ============ Auth Service ============

export async function mockLogin(username: string, password: string): Promise<LoginResponse> {
  await mockDelay();
  const user = users.find((u) => u.username === username);
  if (!user || password.length < 3) {
    throw new Error('用户名或密码错误');
  }
  currentUserId = user.id;
  return {
    token: `mock-token-${user.id}-${Date.now()}`,
    user,
  };
}

// ============ User Service ============

export async function mockGetProfile(): Promise<UserInfo> {
  await mockDelay();
  const user = users.find((u) => u.id === currentUserId);
  if (!user) {
    throw new Error('用户未登录');
  }
  return user;
}

export async function mockCreateUser(data: CreateUserRequest): Promise<UserInfo> {
  await mockDelay();
  const newUser: UserInfo = {
    id: nextId(users),
    username: data.username,
    displayName: data.displayName,
    email: data.email || null,
    role: data.role,
    avatarUrl: null,
    status: 1,
    createdAt: new Date().toISOString(),
  };
  users = [...users, newUser];
  return newUser;
}

export async function mockGetUserList(params: ListUserParams): Promise<PageResult<UserInfo>> {
  await mockDelay();
  let filtered = [...users];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(kw) ||
        u.displayName.toLowerCase().includes(kw),
    );
  }
  return paginate(filtered, params.page, params.size);
}

// ============ Product Service ============

export async function mockGetProductList(params: ListProductParams): Promise<PageResult<Product>> {
  await mockDelay();
  let filtered = [...products];
  if (params.name) {
    const kw = params.name.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(kw));
  }
  if (params.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }
  return paginate(filtered, params.page, params.size);
}

export async function mockGetProductById(id: number): Promise<Product> {
  await mockDelay();
  const product = products.find((p) => p.id === id);
  if (!product) {
    throw new Error('商品不存在');
  }
  return product;
}

export async function mockCreateProduct(data: CreateProductRequest): Promise<Product> {
  await mockDelay();
  const now = new Date().toISOString();
  const newProduct: Product = {
    id: nextId(products),
    name: data.name,
    sku: data.sku,
    category: data.category,
    brand: data.brand || null,
    pointsPrice: data.pointsPrice,
    marketPrice: data.marketPrice || null,
    stock: data.stock,
    soldCount: 0,
    status: data.status,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    subtitle: data.subtitle || null,
    deliveryMethod: data.deliveryMethod || null,
    serviceGuarantee: data.serviceGuarantee || null,
    promotion: data.promotion || null,
    colors: data.colors || null,
    specs: data.specs || null,
    createdAt: now,
    updatedAt: now,
  };
  products = [...products, newProduct];
  return newProduct;
}

export async function mockUpdateProduct(data: UpdateProductRequest): Promise<Product> {
  await mockDelay();
  const index = products.findIndex((p) => p.id === data.id);
  if (index === -1) {
    throw new Error('商品不存在');
  }
  const updated: Product = {
    ...products[index],
    name: data.name,
    sku: data.sku,
    category: data.category,
    brand: data.brand || null,
    pointsPrice: data.pointsPrice,
    marketPrice: data.marketPrice || null,
    stock: data.stock,
    status: data.status,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    subtitle: data.subtitle || null,
    deliveryMethod: data.deliveryMethod || null,
    serviceGuarantee: data.serviceGuarantee || null,
    promotion: data.promotion || null,
    colors: data.colors || null,
    specs: data.specs || null,
    updatedAt: new Date().toISOString(),
  };
  products = products.map((p) => (p.id === data.id ? updated : p));
  return updated;
}

export async function mockDeleteProduct(id: number): Promise<void> {
  await mockDelay();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('商品不存在');
  }
  products = products.filter((p) => p.id !== id);
}

export async function mockUpdateProductStatus(id: number, status: number): Promise<void> {
  await mockDelay();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('商品不存在');
  }
  products = products.map((p) =>
    p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
  );
}

export async function mockBatchUpdateProductStatus(ids: number[], status: number): Promise<void> {
  await mockDelay();
  products = products.map((p) =>
    ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p,
  );
}

// ============ Category Service ============

export async function mockGetPublicCategoryList(): Promise<Category[]> {
  await mockDelay();
  return categories.filter((c) => c.status === 1).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function mockGetCategoryList(): Promise<Category[]> {
  await mockDelay();
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function mockCreateCategory(data: CreateCategoryRequest): Promise<Category> {
  await mockDelay();
  const newCategory: Category = {
    id: nextId(categories),
    name: data.name,
    iconUrl: data.iconUrl || null,
    sortOrder: data.sortOrder ?? categories.length + 1,
    status: 1,
  };
  categories = [...categories, newCategory];
  return newCategory;
}

export async function mockUpdateCategory(data: UpdateCategoryRequest): Promise<Category> {
  await mockDelay();
  const index = categories.findIndex((c) => c.id === data.id);
  if (index === -1) {
    throw new Error('分类不存在');
  }
  const updated: Category = {
    ...categories[index],
    name: data.name,
    iconUrl: data.iconUrl ?? categories[index].iconUrl,
    sortOrder: data.sortOrder ?? categories[index].sortOrder,
  };
  categories = categories.map((c) => (c.id === data.id ? updated : c));
  return updated;
}

export async function mockDeleteCategory(id: number): Promise<void> {
  await mockDelay();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('分类不存在');
  }
  categories = categories.filter((c) => c.id !== id);
}

// ============ Order Service ============

export async function mockCreateOrder(data: CreateOrderRequest): Promise<Order> {
  await mockDelay();
  const product = products.find((p) => p.id === data.productId);
  if (!product) {
    throw new Error('商品不存在');
  }
  if (product.stock <= 0) {
    throw new Error('库存不足');
  }
  const userId = currentUserId ?? 2;

  // Find user's points account
  const account = pointsAccounts.find((a) => a.userId === userId);
  if (!account || account.balance < product.pointsPrice) {
    throw new Error('积分不足');
  }

  const now = new Date().toISOString();
  const newOrder: Order = {
    id: nextId(orders),
    orderNo: `ORD${Date.now()}`,
    userId,
    productId: product.id,
    productName: product.name,
    pointsAmount: product.pointsPrice,
    quantity: 1,
    status: 'pending',
    recipientName: data.recipientName,
    recipientPhone: data.recipientPhone,
    recipientAddress: data.recipientAddress,
    createdAt: now,
    updatedAt: now,
  };
  orders = [...orders, newOrder];

  // Deduct stock
  products = products.map((p) =>
    p.id === product.id
      ? { ...p, stock: p.stock - 1, soldCount: p.soldCount + 1, updatedAt: now }
      : p,
  );

  // Deduct points
  pointsAccounts = pointsAccounts.map((a) =>
    a.userId === userId
      ? { ...a, balance: a.balance - product.pointsPrice, totalSpent: a.totalSpent + product.pointsPrice }
      : a,
  );

  // Add transaction
  const balanceAfter = (account.balance - product.pointsPrice);
  const txn: PointsTransaction = {
    id: nextId(pointsTransactions),
    userId,
    type: 'spend',
    points: -product.pointsPrice,
    balanceAfter,
    referenceType: 'order',
    referenceId: newOrder.orderNo,
    description: `兑换 ${product.name}`,
    createdAt: now,
  };
  pointsTransactions = [...pointsTransactions, txn];

  return newOrder;
}

export async function mockGetMyOrders(params: ListOrderParams): Promise<PageResult<Order>> {
  await mockDelay();
  const userId = currentUserId ?? 2;
  let filtered = orders.filter((o) => o.userId === userId);
  if (params.status) {
    filtered = filtered.filter((o) => o.status === params.status);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(kw) ||
        o.productName.toLowerCase().includes(kw),
    );
  }
  // Sort by createdAt descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return paginate(filtered, params.page, params.size);
}

export async function mockGetOrderById(id: number): Promise<Order> {
  await mockDelay();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    throw new Error('订单不存在');
  }
  return order;
}

export async function mockGetAllOrders(params: ListOrderParams): Promise<PageResult<Order>> {
  await mockDelay();
  let filtered = [...orders];
  if (params.status) {
    filtered = filtered.filter((o) => o.status === params.status);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(kw) ||
        o.productName.toLowerCase().includes(kw),
    );
  }
  // Sort by createdAt descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return paginate(filtered, params.page, params.size);
}

export async function mockUpdateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  await mockDelay();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    throw new Error('订单不存在');
  }
  orders = orders.map((o) =>
    o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o,
  );

  // If cancelled, refund points
  if (status === 'cancelled') {
    const order = orders.find((o) => o.id === id)!;
    const account = pointsAccounts.find((a) => a.userId === order.userId);
    if (account) {
      const newBalance = account.balance + order.pointsAmount;
      pointsAccounts = pointsAccounts.map((a) =>
        a.userId === order.userId
          ? { ...a, balance: newBalance }
          : a,
      );
      const txn: PointsTransaction = {
        id: nextId(pointsTransactions),
        userId: order.userId,
        type: 'refund',
        points: order.pointsAmount,
        balanceAfter: newBalance,
        referenceType: 'order',
        referenceId: order.orderNo,
        description: '订单取消退还积分',
        createdAt: new Date().toISOString(),
      };
      pointsTransactions = [...pointsTransactions, txn];
    }
  }
}

// ============ Points Service ============

export async function mockGetPointsBalance(): Promise<PointsBalance> {
  await mockDelay();
  const userId = currentUserId ?? 2;
  const account = pointsAccounts.find((a) => a.userId === userId);
  if (!account) {
    return { userId, balance: 0, totalEarned: 0, totalSpent: 0 };
  }
  return {
    userId: account.userId,
    balance: account.balance,
    totalEarned: account.totalEarned,
    totalSpent: account.totalSpent,
  };
}

export async function mockGetTransactions(params: ListTransactionParams): Promise<PageResult<PointsTransaction>> {
  await mockDelay();
  const userId = currentUserId ?? 2;
  let filtered = pointsTransactions.filter((t) => t.userId === userId);
  if (params.type) {
    filtered = filtered.filter((t) => t.type === params.type);
  }
  // Sort by createdAt descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return paginate(filtered, params.page, params.size);
}

export async function mockGrantPoints(data: GrantPointsRequest): Promise<void> {
  await mockDelay();
  const account = pointsAccounts.find((a) => a.userId === data.userId);
  if (!account) {
    throw new Error('用户积分账户不存在');
  }
  const newBalance = account.balance + data.points;
  pointsAccounts = pointsAccounts.map((a) =>
    a.userId === data.userId
      ? { ...a, balance: newBalance, totalEarned: a.totalEarned + data.points }
      : a,
  );
  const txn: PointsTransaction = {
    id: nextId(pointsTransactions),
    userId: data.userId,
    type: 'admin_add',
    points: data.points,
    balanceAfter: newBalance,
    referenceType: 'admin',
    referenceId: null,
    description: data.description,
    createdAt: new Date().toISOString(),
  };
  pointsTransactions = [...pointsTransactions, txn];
}

export async function mockDeductPoints(data: DeductPointsRequest): Promise<void> {
  await mockDelay();
  const account = pointsAccounts.find((a) => a.userId === data.userId);
  if (!account) {
    throw new Error('用户积分账户不存在');
  }
  if (account.balance < data.points) {
    throw new Error('积分余额不足');
  }
  const newBalance = account.balance - data.points;
  pointsAccounts = pointsAccounts.map((a) =>
    a.userId === data.userId
      ? { ...a, balance: newBalance, totalSpent: a.totalSpent + data.points }
      : a,
  );
  const txn: PointsTransaction = {
    id: nextId(pointsTransactions),
    userId: data.userId,
    type: 'admin_deduct',
    points: -data.points,
    balanceAfter: newBalance,
    referenceType: 'admin',
    referenceId: null,
    description: data.description,
    createdAt: new Date().toISOString(),
  };
  pointsTransactions = [...pointsTransactions, txn];
}

export async function mockGetPointsAccounts(params: ListAccountsParams): Promise<PageResult<PointsAccount>> {
  await mockDelay();
  let filtered = [...pointsAccounts];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.username.toLowerCase().includes(kw) ||
        a.displayName.toLowerCase().includes(kw),
    );
  }
  return paginate(filtered, params.page, params.size);
}

// ============ Set current user (called after login) ============

export function mockSetCurrentUser(userId: number): void {
  currentUserId = userId;
}
