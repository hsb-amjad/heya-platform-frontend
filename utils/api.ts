import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials: {
    email_or_mobile: string;
    password: string;
    user_type: string;
  }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signupStep1: async (data: {
    full_name: string;
    date_of_birth?: string;
    email: string;
    password: string;
    mobile_number?: string;
  }) => {
    const response = await api.post('/auth/signup/step1', data);
    return response.data;
  },

  signupStep2: async (data: {
    about_me?: string;
    profile_picture?: string;
    ideal_job_industry?: string;
    ideal_job_title?: string;
    experience_level?: string;
    contract_type?: string;
    skills?: string[];
    interview_availability?: any;
  }) => {
    const response = await api.put('/auth/signup/step2', data);
    return response.data;
  },

  signupStep3: async (data: {
    portfolio_link?: string;
  }) => {
    const response = await api.put('/auth/signup/step3', data);
    return response.data;
  },

  signupStep4: async (data: {
    network_contacts?: Array<{
      full_name: string;
      email: string;
      position: string;
    }>;
  }) => {
    const response = await api.put('/auth/signup/step4', data);
    return response.data;
  },

  signupStep5: async (data: {
    cv_file?: string;
  }) => {
    const response = await api.put('/auth/signup/step5', data);
    return response.data;
  },

  signupStep6: async (data: {
    ai_assessment_enabled?: boolean;
    openai_enabled?: boolean;
    ai_assistant_enabled?: boolean;
  }) => {
    const response = await api.put('/auth/signup/step6', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getTalentProfile: async () => {
    const response = await api.get('/auth/profile/talent');
    return response.data;
  },
};

// Token management
export const tokenManager = {
  setToken: (token: string) => {
    Cookies.set('access_token', token, { expires: 1 }); // 1 day
  },

  getToken: () => {
    return Cookies.get('access_token');
  },

  removeToken: () => {
    Cookies.remove('access_token');
  },

  isAuthenticated: () => {
    return !!Cookies.get('access_token');
  },
};

export default api;
