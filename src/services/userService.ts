import type {
  UserInfo,
  CreateUserRequest,
  ListUserParams,
  PageResult,
} from '../types';
import {
  mockGetProfile,
  mockCreateUser,
  mockGetUserList,
} from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const userService = {
  async getProfile(): Promise<UserInfo> {
    if (isMock()) {
      return mockGetProfile();
    }
    return request.get('/users/profile') as Promise<UserInfo>;
  },

  async create(data: CreateUserRequest): Promise<UserInfo> {
    if (isMock()) {
      return mockCreateUser(data);
    }
    return request.post('/users', data) as Promise<UserInfo>;
  },

  async getList(params: ListUserParams): Promise<PageResult<UserInfo>> {
    if (isMock()) {
      return mockGetUserList(params);
    }
    return request.get('/users', { params }) as Promise<PageResult<UserInfo>>;
  },
};
