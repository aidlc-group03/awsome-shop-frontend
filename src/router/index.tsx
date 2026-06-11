import { createBrowserRouter } from 'react-router';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import EmployeeLayout from '../components/Layout/EmployeeLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import ShopHome from '../pages/ShopHome';
import ProductDetail from '../pages/ProductDetail';
import DeliveryInfo from '../pages/DeliveryInfo';
import Redemption from '../pages/Redemption';
import RedemptionSuccess from '../pages/RedemptionSuccess';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import PointsCenter from '../pages/PointsCenter';
import Dashboard from '../pages/Dashboard';
import ProductManage from '../pages/admin/ProductManage';
import AdminProductDetail from '../pages/admin/ProductDetail';
import AdminProductEdit from '../pages/admin/ProductEdit';
import CategoryManage from '../pages/admin/CategoryManage';
import OrderManage from '../pages/admin/OrderManage';
import AdminOrderDetail from '../pages/admin/OrderDetail';
import PointRuleManage from '../pages/admin/PointRuleManage';
import UserManage from '../pages/admin/UserManage';
import UserPointsHistory from '../pages/admin/UserPointsHistory';
import AuthGuard from './AuthGuard';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  // Employee routes
  {
    path: '/',
    element: (
      <AuthGuard requiredRole="employee">
        <EmployeeLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <ShopHome /> },
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'redeem/:id/delivery', element: <DeliveryInfo /> },
      { path: 'redeem/:id', element: <Redemption /> },
      { path: 'redeem/success', element: <RedemptionSuccess /> },
      { path: 'orders', element: <Orders /> },
      { path: 'orders/:id', element: <OrderDetail /> },
      { path: 'points', element: <PointsCenter /> },
    ],
  },
  // Admin routes
  {
    path: '/admin',
    element: (
      <AuthGuard requiredRole="admin">
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <ProductManage /> },
      { path: 'products/:id', element: <AdminProductDetail /> },
      { path: 'products/:id/edit', element: <AdminProductEdit /> },
      { path: 'categories', element: <CategoryManage /> },
      { path: 'orders', element: <OrderManage /> },
      { path: 'orders/:id', element: <AdminOrderDetail /> },
      { path: 'point-rules', element: <PointRuleManage /> },
      { path: 'users', element: <UserManage /> },
      { path: 'users/:id/points', element: <UserPointsHistory /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
