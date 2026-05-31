import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/requests';

// Get token from localStorage
const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const getRequests = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`${BASE_URL}?${params}`, getConfig());
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`, getConfig());
  return response.data;
};

export const createRequest = async (data) => {
  const response = await axios.post(BASE_URL, data, getConfig());
  return response.data;
};

export const acceptRequest = async (id) => {
  const response = await axios.patch(`${BASE_URL}/${id}/accept`, {}, getConfig());
  return response.data;
};

export const updateStatus = async (id, status, cancellationReason = null) => {
  const response = await axios.patch(
    `${BASE_URL}/${id}/status`,
    { status, cancellationReason },
    getConfig()
  );
  return response.data;
};

export const rateRequest = async (id, rating) => {
  const response = await axios.post(
    `${BASE_URL}/${id}/rate`,
    { rating },
    getConfig()
  );
  return response.data;
};

export const getMyRequests = async () => {
  const response = await axios.get(`${BASE_URL}/my`, getConfig());
  return response.data;
};

export const getAssignedRequests = async () => {
  const response = await axios.get(`${BASE_URL}/assigned`, getConfig());
  return response.data;
};