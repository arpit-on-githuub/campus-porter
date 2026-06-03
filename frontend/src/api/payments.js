import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/payments`;

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const createOrder = async (requestId) => {
  const response = await axios.post(
    `${BASE_URL}/create-order`,
    { requestId },
    getConfig()
  );
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axios.post(
    `${BASE_URL}/verify`,
    paymentData,
    getConfig()
  );
  return response.data;
};