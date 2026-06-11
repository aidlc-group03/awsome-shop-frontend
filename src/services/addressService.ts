import type { Address, CreateAddressRequest } from '../types';
import { mockGetAddresses, mockCreateAddress } from '../mock';
import request from './request';

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true';

export const addressService = {
  async getList(): Promise<Address[]> {
    if (isMock()) {
      return mockGetAddresses();
    }
    return request.get('/addresses') as Promise<Address[]>;
  },

  async create(data: CreateAddressRequest): Promise<Address> {
    if (isMock()) {
      return mockCreateAddress(data);
    }
    return request.post('/addresses', data) as Promise<Address>;
  },
};

// Build a single-line address string from an Address record
export function formatAddress(addr: Address): string {
  // Collapse duplicate province/city for municipalities (e.g. 北京市北京市)
  const parts = [addr.province, addr.city, addr.district].filter(Boolean) as string[];
  const region = parts.filter((part, i) => part !== parts[i - 1]).join('');
  return `${region}${addr.detailAddress}`;
}
