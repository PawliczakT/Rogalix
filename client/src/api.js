// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://rogalix-961dd681f166.herokuapp.com/api'
        : 'http://localhost:5000/api'
});

console.log('API baseURL:', api.defaults.baseURL); // debugging

// Dodaj interceptor dla wszystkich requestów
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');

        if (token) {
            console.log('Adding token to request:', config.url); // debugging
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.log('No token found for request:', config.url); // debugging
        }

        // Log the final headers
        console.log('Request headers:', config.headers);

        return config;
    },
    error => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Dodaj interceptor dla odpowiedzi
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            console.log('Unauthorized response - clearing token'); // debugging
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
