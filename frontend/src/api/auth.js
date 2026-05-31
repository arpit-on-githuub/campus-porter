import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth';

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${BASE_URL}/register`, {
    name,
    email,
    password
  });
  return response.data;
};

export const verifyOTP = async (userId, otp) => {
  const response = await axios.post(`${BASE_URL}/verify-otp`, {
    userId,
    otp
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/login`, {
    email,
    password
  });
  return response.data;
};