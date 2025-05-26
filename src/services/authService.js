// src/services/authService.js
import apiClient from './apiClient';

export const register = async (username, password) => {
    const response = await apiClient.post('/register', { username, password });
    return response.data;
};

export const login = async (username, password) => {
    const response = await apiClient.post('/login', { username, password });
    if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('accessToken');
};

export const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const getMe = async () => {
    try {
        const token = getToken();
        if (!token) return null;
        const response = await apiClient.get('/me');
        return response.data;
    } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı veya token geçersiz.", error.response?.data || error.message);
        if (error.response && (error.response.status === 401 || error.response.status === 422)) {
            logout(); 
        }
        return null;
    }
};