import type {
  PointsRule,
  PointsRuleStats,
  CreatePointsRuleRequest,
  UpdatePointsRuleRequest,
  ListPointsRuleParams,
  PageResult,
} from '../types';
import {
  mockGetPointsRules,
  mockGetPointsRuleStats,
  mockCreatePointsRule,
  mockUpdatePointsRule,
  mockTogglePointsRule,
} from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const pointsRuleService = {
  async getRules(params: ListPointsRuleParams): Promise<PageResult<PointsRule>> {
    if (isMock()) {
      return mockGetPointsRules(params);
    }
    return request.get('/admin/points/rules', { params }) as Promise<PageResult<PointsRule>>;
  },

  async getStats(): Promise<PointsRuleStats> {
    if (isMock()) {
      return mockGetPointsRuleStats();
    }
    return request.get('/admin/points/rules/stats') as Promise<PointsRuleStats>;
  },

  async create(data: CreatePointsRuleRequest): Promise<PointsRule> {
    if (isMock()) {
      return mockCreatePointsRule(data);
    }
    return request.post('/admin/points/rules', data) as Promise<PointsRule>;
  },

  async update(data: UpdatePointsRuleRequest): Promise<PointsRule> {
    if (isMock()) {
      return mockUpdatePointsRule(data);
    }
    return request.put(`/admin/points/rules/${data.id}`, data) as Promise<PointsRule>;
  },

  async toggle(id: number, enabled: boolean): Promise<PointsRule> {
    if (isMock()) {
      return mockTogglePointsRule(id, enabled);
    }
    return request.patch(`/admin/points/rules/${id}/status`, { enabled }) as Promise<PointsRule>;
  },
};
