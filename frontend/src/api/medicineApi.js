// -----------------------------------------------------------------------------
// Module Imports
// Import configured Axios client instance
// -----------------------------------------------------------------------------
import axiosClient from './axiosClient';

// -----------------------------------------------------------------------------
// API Service: medicineApi
// Exposes typed communication methods for users, diagnoses, and medications
// -----------------------------------------------------------------------------
export const medicineApi = {
  // ---------------------------------------------------------------------------
  // Method: wakeServer
  // Checks server status and wakes serverless backend if cold-booting
  // ---------------------------------------------------------------------------
  wakeServer: async () => {
    const response = await axiosClient.get('/health');
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // Method: loginUser
  // Onboards or authenticates patient by phone number with profile attributes
  // ---------------------------------------------------------------------------
  loginUser: async ({ phone_number, name, age, gender }) => {
    const payload = {
      phone_number: phone_number.trim(),
      name: name ? name.trim() : undefined,
      age: age ? Number(age) : undefined,
      gender: gender ? gender.trim() : undefined,
    };
    const response = await axiosClient.post('/auth/login', payload);
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // Method: fetchTodayMedicines
  // Retrieves disease-grouped active medicines and today's intake checkbox state
  // ---------------------------------------------------------------------------
  fetchTodayMedicines: async (userId = null, targetDate = null) => {
    const params = {};
    if (userId) params.user_id = userId;
    if (targetDate) params.target_date = targetDate;
    const response = await axiosClient.get('/medicines/today', { params });
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // Method: addMedicine
  // Registers a new medication, auto-linking or creating condition diagnosis
  // ---------------------------------------------------------------------------
  addMedicine: async (userId, { medicine_name, scheduled_time, condition_name, diagnosis_id }) => {
    const payload = {
      medicine_name: medicine_name.trim(),
      scheduled_time: scheduled_time.trim(),
      condition_name: condition_name ? condition_name.trim() : undefined,
      diagnosis_id: diagnosis_id ? Number(diagnosis_id) : undefined,
    };
    const params = userId ? { user_id: userId } : {};
    const response = await axiosClient.post('/medicines', payload, { params });
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // Method: toggleMedicine
  // Flips the taken/untaken checkbox state for a medicine on a specified day
  // ---------------------------------------------------------------------------
  toggleMedicine: async (userId, medicineId, logDate = null, isTaken = null) => {
    const payload = {};
    if (logDate) payload.log_date = logDate;
    if (isTaken !== null && isTaken !== undefined) payload.is_taken = isTaken;
    const params = userId ? { user_id: userId } : {};
    const response = await axiosClient.post(`/medicines/${medicineId}/toggle`, payload, { params });
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // Method: deleteMedicine
  // Removes a medication and its historical intake logs
  // ---------------------------------------------------------------------------
  deleteMedicine: async (userId, medicineId) => {
    const params = userId ? { user_id: userId } : {};
    const response = await axiosClient.delete(`/medicines/${medicineId}`, { params });
    return response.data;
  },

  // ---------------------------------------------------------------------------
  // Method: fetchDiagnoses
  // Lists all condition diagnoses created for the user
  // ---------------------------------------------------------------------------
  fetchDiagnoses: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const response = await axiosClient.get('/medicines/diagnoses', { params });
    return response.data;
  },
};

export default medicineApi;
