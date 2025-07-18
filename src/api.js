import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_API;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export const submitProject = (projectData) => {
  return api.post('/projects/submit', projectData);
};

export const getPublicProjects = () => {
  return api.get('/projects/public');
};

export const getPublicProject = (id) => {
  return api.get(`/projects/public/${id}`);
};

// Add any additional API calls here

export default api;