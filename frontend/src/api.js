import axios from 'axios';

const api = axios.create({
  baseURL: 'https://codechat-lcl0.onrender.com/api',
});

export default api;