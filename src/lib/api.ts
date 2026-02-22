import axios from 'axios';
import { ApiResponse, Persona, User } from '@/types';

// Base URL (Ensure this matches your backend port)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// --- 1. AUTH API ---
export const AuthApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const result = response.data.data || response.data;

    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    return result;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    const result = response.data.data || response.data;

    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    return result;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    return response.data;
  },
};

// --- 2. DNA API ---
export const DnaApi = {
  generate: async (userId: string, answers: string[]) => {
    // Thanks to the interceptor above, this request now carries the Token!
    const response = await api.post('/dna/generate', { userId, answers });
    return response.data;
  }
};

// --- 3. PERSONA API ---
export const PersonaApi = {
  create: async (data: { 
    prompt: string, 
    userId?: string, 
    imageUrl?: string,
    title?: string,    
    price?: number,    
    currency?: string, 
    domain?: string    
  }) => {
    const response = await api.post<ApiResponse<Persona>>('/persona/create', {
      prompt: data.prompt,
      userId: data.userId || 'guest-user',
      imageUrl: data.imageUrl,
      title: data.title,
      price: data.price,
      currency: data.currency,
      domain: data.domain
    });
    return response.data;
  },

  getStatus: async (id: string) => {
    const response = await api.get<ApiResponse<Persona>>(`/persona/${id}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<ApiResponse<Persona[]>>('/persona');
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<any>>(`/persona/${id}`);
    return response.data;
  }
};

// --- 4. EXTRACT API ---
export const ExtractApi = {
  analyze: async (url: string) => {
    const response = await api.post<ApiResponse<any>>('/extract', { url });
    return response.data;
  }
};

// --- 5. USER API ---
export const UserApi = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    avatar?: string;
    vibeSeed?: string[];
    dnaCard?: object;
    visionBoardUrl?: string;
    dailyOrbit?: string;
    customTheme?: object;
  }) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  updateEmail: async (email: string, password: string) => {
    const response = await api.patch('/users/me/email', { email, password });
    return response.data;
  },

  deleteAccount: async (password: string, confirmation: string) => {
    const response = await api.delete('/users/me', {
      data: { password, confirmation }
    });
    return response.data;
  },

  getPublicProfile: async (username: string) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  followUser: async (username: string) => {
    const response = await api.post(`/users/follow/${username}`);
    return response.data;
  },

  unfollowUser: async (username: string) => {
    const response = await api.delete(`/users/follow/${username}`);
    return response.data;
  },

  checkFollowingStatus: async (username: string) => {
    const response = await api.get(`/users/follow/${username}/status`);
    return response.data;
  },

  getFollowers: async (username: string, page = 1, limit = 20) => {
    const response = await api.get(`/users/${username}/followers`, { params: { page, limit } });
    return response.data;
  },

  getFollowing: async (username: string, page = 1, limit = 20) => {
    const response = await api.get(`/users/${username}/following`, { params: { page, limit } });
    return response.data;
  },

  getProfileStats: async (username: string) => {
    const response = await api.get(`/users/${username}/stats`);
    return response.data;
  },

  getLikedItems: async (page = 1, limit = 20) => {
    const response = await api.get('/users/me/liked', { params: { page, limit } });
    return response.data;
  },

  exportData: async () => {
    const response = await api.get('/users/export/data');
    return response.data;
  },
};

// --- 6. ITEMS API ---
export const ItemsApi = {
  create: async (data: {
    name: string;
    description: string;
    category: 'Tech' | 'Fashion' | 'Space' | 'Objects' | 'Sound' | 'Art';
    priceINR?: number;
    sourceUrl?: string;
    imageUrl?: string;
    visibility?: 'public' | 'private' | 'circle';
  }) => {
    const response = await api.post('/items', data);
    return response.data;
  },

  getAll: async (params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: 'claimed' | 'manifested' | 'available';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/items', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  update: async (id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    priceINR?: number;
    sourceUrl?: string;
    imageUrl?: string;
    visibility?: string;
  }) => {
    const response = await api.patch(`/items/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  claim: async (id: string) => {
    const response = await api.post(`/items/${id}/claim`);
    return response.data;
  },

  manifest: async (id: string, note?: string) => {
    const response = await api.post(`/items/${id}/manifest`, { note });
    return response.data;
  },

  contribute: async (id: string, amount: number) => {
    const response = await api.post(`/items/${id}/contribute`, { amount });
    return response.data;
  },

  react: async (id: string, reactionType: 'like' | 'fire' | 'spark' | 'want') => {
    const response = await api.post(`/items/${id}/react`, { reactionType });
    return response.data;
  },

  addEcho: async (id: string, text: string) => {
    const response = await api.post(`/items/${id}/echo`, { text });
    return response.data;
  },

  deleteEcho: async (itemId: string, echoId: string) => {
    const response = await api.delete(`/items/${itemId}/echo/${echoId}`);
    return response.data;
  },

  getShareableLink: async (id: string) => {
    const response = await api.get(`/items/${id}/share`);
    return response.data;
  },

  batchUpdate: async (itemIds: string[], updates: {
    visibility?: string;
    category?: string;
  }) => {
    const response = await api.patch('/items/batch/update', { itemIds, updates });
    return response.data;
  },

  batchDelete: async (itemIds: string[]) => {
    const response = await api.post('/items/batch/delete', { itemIds });
    return response.data;
  },
};

// --- 7. NOTIFICATIONS API ---
export const NotificationsApi = {
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get('/notifications', { params: { page, limit } });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Push Notifications
  getVapidPublicKey: async () => {
    const response = await api.get('/notifications/vapid-public-key');
    return response.data;
  },

  subscribeToPush: async (subscription: PushSubscriptionJSON) => {
    const response = await api.post('/notifications/subscribe', { subscription });
    return response.data;
  },

  unsubscribeFromPush: async (endpoint: string) => {
    const response = await api.post('/notifications/unsubscribe', { endpoint });
    return response.data;
  },

  unsubscribeAllDevices: async () => {
    const response = await api.delete('/notifications/subscriptions');
    return response.data;
  },

  testPush: async () => {
    const response = await api.post('/notifications/test');
    return response.data;
  },
};

// --- 8. FEED API ---
export const FeedApi = {
  getGlobalFeed: async (page = 1, limit = 20) => {
    const response = await api.get('/feed/global', { params: { page, limit } });
    return response.data;
  },

  getCircleFeed: async (page = 1, limit = 20) => {
    const response = await api.get('/feed/circle', { params: { page, limit } });
    return response.data;
  },

  getTrendingFeed: async (page = 1, limit = 20, timeframe: '24h' | '7d' | '30d' | 'all' = '7d') => {
    const response = await api.get('/feed/trending', { params: { page, limit, timeframe } });
    return response.data;
  },

  getCategoryFeed: async (category: string, page = 1, limit = 20, sortBy: 'recent' | 'popular' = 'recent') => {
    const response = await api.get(`/feed/category/${category}`, { params: { page, limit, sortBy } });
    return response.data;
  },

  getTribeFeed: async (tribe: string, page = 1, limit = 20) => {
    const response = await api.get(`/feed/tribe/${tribe}`, { params: { page, limit } });
    return response.data;
  },

  getForYouFeed: async (page = 1, limit = 20) => {
    const response = await api.get('/feed/foryou', { params: { page, limit } });
    return response.data;
  },

  searchUsers: async (query: string, page = 1, limit = 20) => {
    const response = await api.get('/feed/search/users', { params: { q: query, page, limit } });
    return response.data;
  },

  getSuggestedUsers: async (limit = 10) => {
    const response = await api.get('/feed/suggested-users', { params: { limit } });
    return response.data;
  },
};

// --- 9. AI API ---
export const AiApi = {
  generateDNA: async (answers: string[]) => {
    const response = await api.post('/ai/generate-dna', { answers });
    return response.data;
  },

  analyzeUrl: async (url: string) => {
    const response = await api.post('/ai/analyze-url', { url });
    return response.data;
  },
};

// Export the base api instance for custom requests
export default api;