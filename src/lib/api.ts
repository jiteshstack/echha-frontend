import axios from 'axios';
import { ApiResponse, Persona, User } from '@/types';

// Base URL (Ensure this matches your backend port)
const API_BASE_URL = 'http://localhost:5001/api';
// const API_BASE_URL = '/api/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ CRITICAL FIX: The Interceptor
// This checks for a token before EVERY request and attaches it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- 1. AUTH API ---
export const AuthApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Check both locations (Nested vs Flat)
    const result = response.data.data || response.data;

    if (result && result.token) {
      localStorage.setItem('token', result.token);
    }
    return result; 
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    
    // Check both locations
    const result = response.data.data || response.data;

    if (result && result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.reload(); 
  }
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