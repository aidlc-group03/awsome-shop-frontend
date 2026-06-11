import type { LoginResponse } from '../types';
import { mockLogin } from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    if (isMock()) {
      return mockLogin(username, password);
    }
    return request.post('/auth/login', { username, password }) as Promise<LoginResponse>;
  },
};
