import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: sends cookies with requests
});

// Store for access token (in memory only)
let accessToken = null;

// Store for token refresh promise (prevents multiple simultaneous refresh calls)
let refreshTokenPromise = null;

export const setAccessToken = token => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
};

// Request interceptor - add access token to requests
apiClient.interceptors.request.use(
  config => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it
        if (!refreshTokenPromise) {
          refreshTokenPromise = apiClient.post('/auth/refresh-token');
        }

        const response = await refreshTokenPromise;
        refreshTokenPromise = null;

        const { accessToken: newAccessToken, user } = response.data;
        setAccessToken(newAccessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshTokenPromise = null;
        clearAccessToken();

        // Redirect to login or trigger logout
        window.dispatchEvent(new CustomEvent('auth:session-expired'));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
