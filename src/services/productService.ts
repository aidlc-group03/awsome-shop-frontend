import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductParams,
  PageResult,
} from '../types';
import {
  mockGetProductList,
  mockGetProductById,
  mockCreateProduct,
  mockUpdateProduct,
  mockDeleteProduct,
  mockUpdateProductStatus,
  mockBatchUpdateProductStatus,
} from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const productService = {
  async getList(params: ListProductParams): Promise<PageResult<Product>> {
    if (isMock()) {
      return mockGetProductList(params);
    }
    return request.get('/products', { params }) as Promise<PageResult<Product>>;
  },

  async getById(id: number): Promise<Product> {
    if (isMock()) {
      return mockGetProductById(id);
    }
    return request.get(`/products/${id}`) as Promise<Product>;
  },

  async create(data: CreateProductRequest): Promise<Product> {
    if (isMock()) {
      return mockCreateProduct(data);
    }
    return request.post('/products', data) as Promise<Product>;
  },

  async update(data: UpdateProductRequest): Promise<Product> {
    if (isMock()) {
      return mockUpdateProduct(data);
    }
    return request.put(`/products/${data.id}`, data) as Promise<Product>;
  },

  async delete(id: number): Promise<void> {
    if (isMock()) {
      return mockDeleteProduct(id);
    }
    return request.delete(`/products/${id}`) as Promise<void>;
  },

  async updateStatus(id: number, status: number): Promise<void> {
    if (isMock()) {
      return mockUpdateProductStatus(id, status);
    }
    return request.patch(`/products/${id}/status`, { status }) as Promise<void>;
  },

  async batchUpdateStatus(ids: number[], status: number): Promise<void> {
    if (isMock()) {
      return mockBatchUpdateProductStatus(ids, status);
    }
    return request.patch('/products/batch-status', { ids, status }) as Promise<void>;
  },
};
