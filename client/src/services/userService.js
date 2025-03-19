import api from './api';

/**
 * Fetch all users
 * @returns {Promise<Array>} List of all users
 */
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch a user by their ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (id) => {
  try {
    if (!id) throw new Error('User ID is required');
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data including name, mobile, email, address
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update an existing user
 * @param {string} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (id, userData) => {
  try {
    if (!id) throw new Error('User ID is required');
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} id - User ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteUser = async (id) => {
  try {
    if (!id) throw new Error('User ID is required');
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

/**
 * Get user dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Search users with filters
 * @param {Object} filters - Search filters (name, mobile, dateFrom, dateTo)
 * @returns {Promise<Array>} Filtered users list
 */
export const searchUsers = async (filters) => {
  try {
    let queryString = '';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.mobile) params.append('mobile', filters.mobile);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      queryString = params.toString();
    }
    
    const url = queryString ? `/users/search?${queryString}` : '/users';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  searchUsers
};