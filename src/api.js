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

// Project submission (existing)
export const submitProject = (projectData) => {
  return api.post('/projects/submit', projectData);
};

// Get public projects (existing)
export const getPublicProjects = () => {
  return api.get('/projects/public');
};

// Get specific public project (existing)
export const getPublicProject = (id) => {
  return api.get(`/projects/public/${id}`);
};

// New: Get launched project for configuration
export const getLaunchedProject = (namespace, moduleName) => {
  return api.get(`/projects/launched/${namespace}/${moduleName}`);
};

// New: Configure sales details for launched project
export const configureSalesDetails = (projectId, salesData) => {
  return api.patch(`/projects/${projectId}/configure-sales`, salesData);
};

// New: Check if project needs configuration
export const checkProjectStatus = async (namespace, moduleName) => {
  try {
    const response = await api.get(`/projects/launched/${namespace}/${moduleName}`);
    return {
      needsConfiguration: true,
      project: response.data.data.project
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        needsConfiguration: false,
        project: null
      };
    }
    throw error;
  }
};

export const checkProjectByContract = (namespace, moduleName) => {
  return api.get(`/projects/check-by-contract/${namespace}/${moduleName}`);
};

export const markProjectAsDeployed = (namespace, moduleName) => {
  return api.patch(`/projects/deployed/${namespace}/${moduleName}`);
};

export default api;