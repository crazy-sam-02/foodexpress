import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here for global error handling if needed

export default api;