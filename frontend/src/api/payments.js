import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/payments';

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