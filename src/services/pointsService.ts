import type {
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
  mockGetPointsBalance,
  mockGetTransactions,
  mockGrantPoints,
  mockDeductPoints,
  mockGetPointsAccounts,
} from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const pointsService = {
  async getBalance(): Promise<PointsBalance> {
    if (isMock()) {
      return mockGetPointsBalance();
    }
    return request.get('/points/balance') as Promise<PointsBalance>;
  },

  async getTransactions(params: ListTransactionParams): Promise<PageResult<PointsTransaction>> {
    if (isMock()) {
      return mockGetTransactions(params);
    }
    return request.get('/points/transactions', { params }) as Promise<PageResult<PointsTransaction>>;
  },

  async grant(data: GrantPointsRequest): Promise<void> {
    if (isMock()) {
      return mockGrantPoints(data);
    }
    return request.post('/points/grant', data) as Promise<void>;
  },

  async deduct(data: DeductPointsRequest): Promise<void> {
    if (isMock()) {
      return mockDeductPoints(data);
    }
    return request.post('/points/deduct', data) as Promise<void>;
  },

  async getAccounts(params: ListAccountsParams): Promise<PageResult<PointsAccount>> {
    if (isMock()) {
      return mockGetPointsAccounts(params);
    }
    return request.get('/points/accounts', { params }) as Promise<PageResult<PointsAccount>>;
  },
};
