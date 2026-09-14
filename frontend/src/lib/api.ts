import axios from 'axios';
import { toast } from '@/hooks/use-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Clear token and redirect to login if not already there
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        } else {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Wrong username or password",
          });
        }
      } else if (status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to perform this action.",
        });
      } else {
        // Other errors
        let message = data?.message || data?.error || "Something went wrong";
        
        // Handle Spring Boot validation errors map
        if (data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
          const errorValues = Object.values(data.errors)
            .filter(val => typeof val === 'string');
          if (errorValues.length > 0) {
             message = errorValues.join(', ');
          }
        } else if (typeof data === 'string') {
          message = data;
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the server.",
      });
    }

    return Promise.reject(error);
  }
);
