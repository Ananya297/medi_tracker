// -----------------------------------------------------------------------------
// Module Imports
// Import axios for HTTP requests
// -----------------------------------------------------------------------------
import axios from 'axios';

// -----------------------------------------------------------------------------
// Configuration: Base API URL
// Defaults to local FastAPI backend on port 8000, or override via VITE_API_URL
// -----------------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// -----------------------------------------------------------------------------
// Axios Client Instance
// Configured with timeout and JSON headers
// -----------------------------------------------------------------------------
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------------------------------------
// Request Interceptor: Attach Active User ID
// Reads active user from localStorage and attaches X-User-Id and query parameter
// -----------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem('medtracker_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.id) {
        config.headers['X-User-Id'] = user.id.toString();
        // Also supply query param for fallback
        config.params = {
          ...config.params,
          user_id: user.id,
        };
      }
    }
  } catch (err) {
    console.error('Error reading medtracker_user from localStorage', err);
  }
  return config;
});

// -----------------------------------------------------------------------------
// API Service Methods
// Encapsulates all backend REST endpoints for the frontend
// -----------------------------------------------------------------------------
export const medApi = {
  // Check backend service health
  checkHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Authenticate / Register user by phone number
  login: async (phone_number, name = '', age = 30, gender = 'Other') => {
    const res = await api.post('/auth/login', {
      phone_number,
      name: name || undefined,
      age: age ? Number(age) : undefined,
      gender: gender || undefined,
    });
    return res.data;
  },

  // Get current user profile
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Fetch today's disease-grouped medicine schedule
  getTodaySchedule: async (dateStr = null) => {
    const params = dateStr ? { target_date: dateStr } : {};
    const res = await api.get('/medicines/today', { params });
    return res.data;
  },

  // Toggle dosage checkbox state (take / untake)
  toggleIntake: async (medicineId, logDate = null, isTaken = null) => {
    const payload = {};
    if (logDate) payload.log_date = logDate;
    if (isTaken !== null) payload.is_taken = isTaken;
    const res = await api.post(`/medicines/${medicineId}/toggle`, payload);
    return res.data;
  },

  // Add new medication
  addMedicine: async ({ medicine_name, scheduled_time, condition_name, diagnosis_id }) => {
    const payload = {
      medicine_name,
      scheduled_time,
      condition_name: condition_name || undefined,
      diagnosis_id: diagnosis_id || undefined,
    };
    const res = await api.post('/medicines', payload);
    return res.data;
  },

  // Delete medication
  deleteMedicine: async (medicineId) => {
    const res = await api.delete(`/medicines/${medicineId}`);
    return res.data;
  },

  // List existing conditions / diagnoses for the user
  getDiagnoses: async () => {
    const res = await api.get('/medicines/diagnoses');
    return res.data;
  },
};
