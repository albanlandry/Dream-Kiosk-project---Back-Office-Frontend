import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Loading state management
let loadingCount = 0;
let loadingCallbacks: Set<(loading: boolean) => void> = new Set();

export function setLoadingCallback(callback: (loading: boolean) => void) {
  loadingCallbacks.add(callback);
  return () => {
    loadingCallbacks.delete(callback);
  };
}

function setLoading(loading: boolean) {
  if (loading) {
    loadingCount++;
  } else {
    loadingCount = Math.max(0, loadingCount - 1);
  }
  const isLoading = loadingCount > 0;
  loadingCallbacks.forEach((callback) => callback(isLoading));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token and show loading
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('auth-token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Show loading for all mutating operations (POST, PUT, DELETE, PATCH)
    // and for GET requests that might take time (uploads, bulk operations)
    const method = config.method?.toLowerCase();
    const shouldShowLoading = 
      method === 'post' || 
      method === 'put' || 
      method === 'patch' || 
      method === 'delete' ||
      (method === 'get' && config.url && (config.url.includes('/upload') || config.url.includes('/bulk')));
    
    if (shouldShowLoading) {
      setLoading(true);
    }
    
    return config;
  },
  (error) => {
    setLoading(false);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and hide loading
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Hide loading on successful response
    const config = response.config;
    const method = config.method?.toLowerCase();
    const shouldShowLoading = 
      method === 'post' || 
      method === 'put' || 
      method === 'patch' || 
      method === 'delete' ||
      (method === 'get' && config.url && (config.url.includes('/upload') || config.url.includes('/bulk')));
    
    if (shouldShowLoading) {
      setLoading(false);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Hide loading on error
    setLoading(false);
    
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      // But skip redirect if we're already on the login page to avoid infinite loops
      if (typeof window !== 'undefined') {
        const isLoginPage = window.location.pathname === '/login';
        Cookies.remove('auth-token');
        if (!isLoginPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

