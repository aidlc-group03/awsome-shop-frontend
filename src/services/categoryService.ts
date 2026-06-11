import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types';
import {
  mockGetPublicCategoryList,
  mockGetCategoryList,
  mockCreateCategory,
  mockUpdateCategory,
  mockUpdateCategoryStatus,
  mockDeleteCategory,
} from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const categoryService = {
  async getPublicList(): Promise<Category[]> {
    if (isMock()) {
      return mockGetPublicCategoryList();
    }
    return request.get('/categories/public') as Promise<Category[]>;
  },

  async getList(): Promise<Category[]> {
    if (isMock()) {
      return mockGetCategoryList();
    }
    return request.get('/categories') as Promise<Category[]>;
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    if (isMock()) {
      return mockCreateCategory(data);
    }
    return request.post('/categories', data) as Promise<Category>;
  },

  async update(data: UpdateCategoryRequest): Promise<Category> {
    if (isMock()) {
      return mockUpdateCategory(data);
    }
    return request.put(`/categories/${data.id}`, data) as Promise<Category>;
  },

  async updateStatus(id: number, status: number): Promise<Category> {
    if (isMock()) {
      return mockUpdateCategoryStatus(id, status);
    }
    return request.patch(`/categories/${id}/status`, { status }) as Promise<Category>;
  },

  async delete(id: number): Promise<void> {
    if (isMock()) {
      return mockDeleteCategory(id);
    }
    return request.delete(`/categories/${id}`) as Promise<void>;
  },
};
