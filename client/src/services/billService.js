// client/src/services/billService.js

import api from "./api";

export const getBills = async () => {
  try {
    const response = await api.get("/bills");
    return response.data;
  } catch (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
};

export const getBillsByUserId = async (userId) => {
  try {
    if (!userId) throw new Error("User ID is required");
    const response = await api.get(`/bills/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bills for user ${userId}:`, error);
    throw error;
  }
};

export const getBillById = async (id) => {
  try {
    // Skip the API call if id is 'new' or not provided
    if (!id || id === "new") {
      throw new Error("Bill ID is required");
    }

    const response = await api.get(`/bills/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bill ${id}:`, error);
    throw error;
  }
};

export const createBill = async (billData) => {
  try {
    // Validate required fields
    if (!billData.userId) {
      throw new Error("User ID is required");
    }

    const response = await api.post("/bills", billData);
    return response.data;
  } catch (error) {
    console.error("Error in createBill service:", error);
    throw error;
  }
};

export const updateBill = async (id, billData) => {
  try {
    // Check if we have a valid ID
    if (!id || id === "new") {
      throw new Error("Valid bill ID is required for updates");
    }

    const response = await api.put(`/bills/${id}`, billData);
    return response.data;
  } catch (error) {
    console.error("Error in updateBill service:", error);
    throw error;
  }
};

export const recordPayment = async (id, amount) => {
  try {
    if (!id) throw new Error("Bill ID is required");
    const response = await api.put(`/bills/${id}/pay`, { amount });
    return response.data;
  } catch (error) {
    console.error(`Error recording payment for bill ${id}:`, error);
    throw error;
  }
};

export const getChartData = async () => {
  try {
    const response = await api.get("/bills/chart-data");
    return response.data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    throw error;
  }
};
