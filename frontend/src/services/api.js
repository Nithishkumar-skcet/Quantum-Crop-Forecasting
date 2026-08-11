import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT Auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
};

export const cropService = {
  getMetadata: async () => {
    const res = await api.get('/metadata');
    return res.data;
  },
  getDistricts: async () => {
    const res = await api.get('/districts');
    return res.data;
  },
  getCrops: async () => {
    const res = await api.get('/crops');
    return res.data;
  },
  getSeasons: async () => {
    const res = await api.get('/seasons');
    return res.data;
  },
  getEnvironmentData: async (district, year = 2026) => {
    const res = await api.get(`/environment/${district}?year=${year}`);
    return res.data;
  },
  predictYield: async (predictionData) => {
    const res = await api.post('/predictions', predictionData);
    return res.data;
  },
  recommendCrops: async (recommendationData) => {
    const res = await api.post('/recommendations', recommendationData);
    return res.data;
  },
  getModelPerformance: async () => {
    const res = await api.get('/model-performance');
    return res.data;
  },
  getPredictionHistory: async () => {
    const res = await api.get('/predictions/history');
    return res.data;
  },
  getRecommendationHistory: async () => {
    const res = await api.get('/recommendations/history');
    return res.data;
  },
};

export default api;
