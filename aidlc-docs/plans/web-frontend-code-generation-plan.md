# Unit 6: Web Frontend — 代码生成计划

> **本计划是 Unit 6 代码生成阶段的唯一事实来源 (Single Source of Truth)。**
> 所有代码生成严格按照本计划的步骤顺序执行，完成一步勾选一步。

## 单元上下文

| 属性 | 内容 |
|------|------|
| **单元** | Unit 6: Web Frontend |
| **模块路径** | `awsome-shop-frontend/` (Workspace 根目录下，**绝不**写入 aidlc-docs/) |
| **类型** | Brownfield — 在现有 React 19 + MUI 6 + Zustand + react-router 7 项目上扩展 |
| **技术栈** | React 19.2 / TypeScript 5.9 / Vite 7 / MUI 6.5 / Zustand 5 / axios 1.13 / react-i18next |
| **依赖** | 所有后端服务 (通过 Gateway `/api`)；**后端 API 尚未完成 → 本阶段全部接口走 Mock placeholder**，接口契约来自 functional-design 与 api-documentation.md |
| **代码仓库** | **`awsome-shop-frontend/`** (Workspace 根目录下的独立 git repo，含自己的 `.git/`)；应用代码与 Dockerfile 等配置写入此 repo，文档汇总写入 `aidlc-docs/construction/web-frontend/code/` |
| **设计稿** | `awsome-shop-plan/doc/awsome-shop.pen` (通过 Pencil MCP 读取 Web 1440px 帧) |
| **组件参考** | **MUI MCP** — 生成/改造前端组件时查询 MUI 6 官方组件 API、props、最佳实践与示例 |
| **实现流程** | 遵循 **`ui-implement` skill**：每页 = Pencil MCP 读设计帧 → MUI MCP 核对组件 → 生成代码 → 构建验证 (Android 单元复用同一 skill) |
| **对应故事** | US-E01~E11, US-A01~A14, US-S01~S03 |

## 设计稿映射 (Pencil 帧 → 页面)

### 员工端
| Pencil 帧 ID | 帧名称 | 目标页面 |
|------|------|------|
| nQE8Y | Employee - Login | (改造) `pages/Login` |
| Cvjn9 | Employee - Shop Home | (改造) `pages/ShopHome` |
| 5qCkf | Employee - Product Detail | `pages/ProductDetail` |
| kcjDe / uH44z | Confirm Redemption / Delivery Info | `pages/Redemption` |
| ybxLH | Employee - Redemption Success | `pages/RedemptionSuccess` |
| tMaKZ | Employee - Redemption History | `pages/Orders` |
| cTU3z | Employee - Order Detail | `pages/OrderDetail` |
| RGVse | Employee - Points Center | `pages/PointsCenter` |

### 管理端
| Pencil 帧 ID | 帧名称 | 目标页面 |
|------|------|------|
| ajCip | Admin - Dashboard | (改造) `pages/Dashboard` |
| U51NS / zSrrT / IufKW | Product Mgmt / Detail / Edit + Dialogs (PYriX, YGk1Y, HLAYB) | `pages/admin/ProductManage` |
| ssGFT | Category Management + Dialogs (Y88Em, dpKnR, pZWYC) | `pages/admin/CategoryManage` |
| 0rJm4 / 8SEyA | Exchange Records / Detail + Dialog (Sv8aV) | `pages/admin/OrderManage` |
| Nripi / WPsuY | Points Mgmt / User Points History + Dialog (IWsvA) | `pages/admin/PointsManage` |
| 370RH | Admin - User Management | `pages/admin/UserManage` |

> 注：设计稿中 `Admin - Points Rule Management`(Nripi) 为积分规则界面；功能设计 (BR-F7) 定义的是用户积分发放/扣除管理。以功能设计为准，PointsManage 实现「用户积分账户列表 + 发放/扣除」，参考 `Dialog - 调整用户积分`(IWsvA)。

---

# PART 1: 规划 (本文档)

## Step 1: 分析单元上下文 ✅
- [x] 阅读功能设计制品 (domain-entities / business-logic-model / business-rules)
- [x] 阅读现有前端代码结构 (App, router, request, stores, theme, i18n, 现有页面)
- [x] 阅读 Pencil 设计稿顶层帧结构，建立帧→页面映射
- [x] 确认 API 契约 (api-documentation.md + functional-design service 层定义)

## Step 2: 确定代码位置 ✅
- [x] Workspace 根：`/Users/zhengjl/Developer/git-repo/AIDLC-Beijing-TTT/awsome-shop-project`
- [x] 应用代码：`awsome-shop-frontend/src/**`
- [x] 文档汇总：`aidlc-docs/construction/web-frontend/code/*.md`

---

# PART 2: 生成 (按顺序执行)

## Step 3: 基础层 — 类型定义
- [ ] 创建 `src/types/index.ts`：迁移 domain-entities.md 全部 TypeScript 类型 (User/Product/Category/Order/Points/通用 PageResult, ApiResult)
- 故事: 全部 (类型基础)

## Step 4: 基础层 — 请求封装强化 + Mock 开关
- [ ] 改造 `src/services/request.ts`：泛型返回类型支持 `ApiResult<T>` 解包 (返回 `data`)，统一错误抛出，保留 401 跳转
- [ ] 引入 Mock 开关：通过 `import.meta.env.VITE_USE_MOCK`（默认 `true`，因后端未完成）决定 service 走 Mock 还是真实 HTTP
- 故事: 全部 (基础)

## Step 4b: Mock 数据层 (后端 placeholder)
- [ ] 创建 `src/mock/data.ts`：基于 domain-entities 类型的模拟数据集 (users/products/categories/orders/points transactions/accounts)
- [ ] 创建 `src/mock/index.ts`：`mockDelay()` 辅助 + 各资源的 Mock 实现 (分页/筛选/CRUD 在内存中模拟)，返回结构与真实 API 完全一致 (`PageResult` / 实体)
- [ ] 约定：后端就绪后仅需将 `VITE_USE_MOCK=false` 即切换到真实 API，service 公开签名不变
- 故事: 全部 (临时 placeholder)

## Step 5: API Service 层 (真实 HTTP + Mock 双实现)
> 每个 service 方法：`VITE_USE_MOCK` 为真时调用 `src/mock`，否则调用 `request`。对外签名一致 (见 business-logic-model service 定义)。
- [ ] `src/services/authService.ts` — login
- [ ] `src/services/productService.ts` — getList/getById/create/update/delete/updateStatus/batchUpdateStatus
- [ ] `src/services/categoryService.ts` — getPublicList/getList/create/update/delete
- [ ] `src/services/orderService.ts` — create/getMyOrders/getById/getAllOrders/updateStatus
- [ ] `src/services/pointsService.ts` — getBalance/getTransactions/grant/deduct/getAccounts
- [ ] `src/services/userService.ts` — getProfile/create/getList
- 故事: US-E01~E11, US-A01~A14

## Step 6: 状态管理改造
- [ ] 改造 `src/store/useAuthStore.ts`：移除 Mock，调用 `authService.login()`；Token 存 localStorage('token')；user 通过 persist；UserInfo 扩展 (id/email/avatarUrl/status)
- 故事: US-E01, US-S01 (BR-F1)

## Step 7: 通用组件
> 实现前用 **MUI MCP** 查询对应 MUI 6 组件 API/示例 (Skeleton, Dialog, Chip, Table 等)。
- [ ] `src/components/PageHeader.tsx`
- [ ] `src/components/StatusChip.tsx` (订单/积分交易状态色彩，遵循 BR-F4.2 / BR-F5.2)
- [ ] `src/components/ConfirmDialog.tsx` (BR-F6.2)
- [ ] `src/components/LoadingState.tsx` (Skeleton)
- [ ] `src/components/EmptyState.tsx` (BR-F6.4)
- [ ] `src/components/ProductCard.tsx` (BR-F2.3/2.4，从 ShopHome 抽取)
- 故事: 横切

## Step 8: 员工端页面 (读取对应 Pencil 帧后实现)
> 每页：先 Pencil MCP 读帧还原设计，再用 **MUI MCP** 核对所用 MUI 组件用法。
- [ ] 改造 `pages/Login`：对接 authService (移除 mock 提示)
- [ ] 改造 `pages/ShopHome`：对接 productService + categoryService，使用 ProductCard (帧 Cvjn9)
- [ ] `pages/ProductDetail/index.tsx` (帧 5qCkf)
- [ ] `pages/Redemption/index.tsx` (帧 kcjDe + uH44z，配送表单 + 校验 BR-F3)
- [ ] `pages/RedemptionSuccess/index.tsx` (帧 ybxLH)
- [ ] `pages/Orders/index.tsx` (帧 tMaKZ，状态筛选 BR-F4)
- [ ] `pages/OrderDetail/index.tsx` (帧 cTU3z，状态时间线)
- [ ] `pages/PointsCenter/index.tsx` (帧 RGVse，余额卡 + 交易记录 BR-F5)
- 故事: US-E02~E11

## Step 9: 管理端页面 (读取对应 Pencil 帧后实现)
> 每页：先 Pencil MCP 读帧还原设计，再用 **MUI MCP** 核对表格/对话框/表单等组件用法。
- [ ] 改造 `pages/Dashboard`：对接汇总数据 (保留现有布局，帧 ajCip)
- [ ] `pages/admin/ProductManage/index.tsx` (帧 U51NS + Dialogs，CRUD/上下架/批量 BR-F6)
- [ ] `pages/admin/CategoryManage/index.tsx` (帧 ssGFT + Dialogs)
- [ ] `pages/admin/OrderManage/index.tsx` (帧 0rJm4 + 8SEyA + 状态流转 BR-F8)
- [ ] `pages/admin/PointsManage/index.tsx` (帧 WPsuY/IWsvA，发放/扣除 BR-F7)
- [ ] `pages/admin/UserManage/index.tsx` (帧 370RH，用户列表 + 创建)
- 故事: US-A01~A14

## Step 10: 路由与布局接线
- [ ] 更新 `src/router/index.tsx`：注册所有员工端 + 管理端新路由 (BR-F1 权限守卫)
- 故事: US-S01 (BR-F1)

## Step 11: 国际化
- [ ] 扩展 `src/i18n/locales/zh.json` 与 `en.json`：新增页面所需全部 i18n key (BR-F9)
- 故事: US-S03

## Step 12: 文档汇总
- [ ] 创建 `aidlc-docs/construction/web-frontend/code/code-summary.md` (生成文件清单、设计映射、故事覆盖、Mock 说明)

## Step 13: Docker 化运行
- [ ] 创建 `awsome-shop-frontend/Dockerfile`：多阶段构建 (node 构建 → nginx 提供静态文件)
- [ ] 创建 `awsome-shop-frontend/nginx.conf`：SPA history fallback (`try_files ... /index.html`)，预留 `/api` 反向代理 (后端就绪后启用)
- [ ] 创建 `awsome-shop-frontend/.dockerignore`
- [ ] 创建 `awsome-shop-frontend/docker-compose.yml`：构建并以 `VITE_USE_MOCK=true` 运行，映射端口 (如 8080:80)
- [ ] 在 `README.md` 追加 Docker 运行说明
- 故事: US-S (基础设施/可运行)

## Step 14: 构建验证
- [ ] 运行 `npm run build` (tsc + vite build) 修复类型/编译错误，确保通过
- [ ] (可选) 验证 `docker build` 成功

---

## 执行约定
- **Brownfield 文件修改规则**：文件已存在则原地修改，绝不创建 `index_new.tsx` 之类副本。
- **设计还原**：每个页面在实现前先用 Pencil MCP 读取对应帧 (batch_get + 必要时 screenshot)，按设计稿的布局/色彩/间距还原，颜色复用 theme 变量。
- **组件参考 (MUI MCP)**：实现通用组件 (Step 7) 与各页面 (Step 8-9) 时，使用 **MUI MCP** 查询 MUI 6.5 官方组件 (DataTable/Table、Dialog、Skeleton、Autocomplete、Snackbar、Stepper/Timeline 等) 的正确 API、props 与用法示例，确保符合 MUI 6 最佳实践，避免使用过时/v5 API。
- **业务规则**：严格遵循 business-rules.md 的 BR-F1~F10。
- **Mock 优先**：后端 API 未完成，本阶段所有数据走 `src/mock` placeholder (`VITE_USE_MOCK=true`)；service 层保留真实 HTTP 实现，后端就绪后翻转开关即可切换，无需改动页面。
- **Docker**：前端通过多阶段 Dockerfile + nginx 运行，默认以 Mock 模式启动。
- **类型安全**：所有 service / 组件 props 使用 `src/types` 定义。
- **进度跟踪**：每完成一步立即勾选 [x]，并在 aidlc-state.md 更新状态。
