// database.js - For React Native app
import { Platform } from 'react-native';

// API base URL
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator uses special IP to access host machine
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:3000/api';
  }
  // For physical devices, use your computer's local IP
  // Example: return 'http://192.168.1.100:3000/api';
  return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Test connection
export const testConnection = async () => {
  try {
    const result = await apiCall('/test');
    console.log('Database connected successfully:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Get all routes
export const getAllRoutes = async () => {
  return await apiCall('/routes');
};

// Get routes with statistics
export const getRoutesWithStats = async () => {
  return await apiCall('/routes/stats');
};

// Get trips by route
export const getTripsByRoute = async (routeId) => {
  return await apiCall(`/routes/${routeId}/trips`);
};

// Get stops by location
export const getStopsByLocation = async (lat, lon, radius = 0.01) => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    radius: radius.toString(),
  });
  return await apiCall(`/stops/nearby?${params}`);
};

// Search stops by name
export const searchStops = async (searchTerm) => {
  const params = new URLSearchParams({ q: searchTerm });
  return await apiCall(`/stops/search?${params}`);
};

// Get routes that serve a specific stop (by stop_code)
export const getRoutesByStopCode = async (stopCode) => {
  return await apiCall(`/stops/${stopCode}/routes`);
};

// Get trips by route short name
export const getTripsByRouteShortName = async (routeShortName) => {
  return await apiCall(`/routes/name/${routeShortName}/trips`);
};

export default {
  testConnection,
  getAllRoutes,
  getRoutesWithStats,
  getTripsByRoute,
  getStopsByLocation,
  searchStops,
  getRoutesByStopCode,
  getTripsByRouteShortName,
};