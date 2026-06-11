import type {
  Order,
  OrderStatus,
  CreateOrderRequest,
  ListOrderParams,
  UpdateShippingRequest,
  PageResult,
} from '../types';
import {
  mockCreateOrder,
  mockGetMyOrders,
  mockGetOrderById,
  mockGetAllOrders,
  mockUpdateOrderStatus,
  mockUpdateShipping,
} from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const orderService = {
  async create(data: CreateOrderRequest): Promise<Order> {
    if (isMock()) {
      return mockCreateOrder(data);
    }
    return request.post('/orders', data) as Promise<Order>;
  },

  async getMyOrders(params: ListOrderParams): Promise<PageResult<Order>> {
    if (isMock()) {
      return mockGetMyOrders(params);
    }
    return request.get('/orders/mine', { params }) as Promise<PageResult<Order>>;
  },

  async getById(id: number): Promise<Order> {
    if (isMock()) {
      return mockGetOrderById(id);
    }
    return request.get(`/orders/${id}`) as Promise<Order>;
  },

  async getAllOrders(params: ListOrderParams): Promise<PageResult<Order>> {
    if (isMock()) {
      return mockGetAllOrders(params);
    }
    return request.get('/orders', { params }) as Promise<PageResult<Order>>;
  },

  async updateStatus(id: number, status: OrderStatus): Promise<void> {
    if (isMock()) {
      return mockUpdateOrderStatus(id, status);
    }
    return request.patch(`/orders/${id}/status`, { status }) as Promise<void>;
  },

  async updateShipping(data: UpdateShippingRequest): Promise<Order> {
    if (isMock()) {
      return mockUpdateShipping(data);
    }
    return request.patch(`/orders/${data.id}/shipping`, data) as Promise<Order>;
  },
};
