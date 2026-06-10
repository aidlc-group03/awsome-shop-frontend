import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // Unwrap ApiResult<T>: return data on success
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 0 || res.code === 200) {
        return res.data;
      }
      // Business error: throw with message from ApiResult
      const error = new Error(res.message || 'Request failed');
      (error as Error & { code: number }).code = res.code;
      return Promise.reject(error);
    }
    // Non-ApiResult responses (e.g. direct data)
    return res;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default request;
