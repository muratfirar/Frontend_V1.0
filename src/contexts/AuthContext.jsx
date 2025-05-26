// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getToken as getLocalToken, getMe as fetchMe, logout as authServiceLogout, login as authServiceLogin, register as authServiceRegister } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const validateUser = useCallback(async () => {
        setIsLoading(true); // Yükleme başlangıcı
        const token = getLocalToken();
        if (token) {
            try {
                const user = await fetchMe();
                if (user) {
                    setCurrentUser(user);
                } else {
                    authServiceLogout();
                    setCurrentUser(null);
                }
            } catch (error) {
                authServiceLogout();
                setCurrentUser(null);
            }
        }
        setIsLoading(false); // Yükleme bitişi
    }, []);

    useEffect(() => {
        validateUser();
    }, [validateUser]);

    const login = useCallback(async (username, password) => {
        await authServiceLogin(username, password);
        await validateUser(); // Giriş sonrası kullanıcıyı doğrula ve state'i güncelle
    }, [validateUser]);

    const logout = useCallback(() => {
        authServiceLogout();
        setCurrentUser(null);
        // Yönlendirme App.js veya PrivateRoute içinde ele alınacak
    }, []);

    const register = useCallback(async (username, password) => {
        return await authServiceRegister(username, password);
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, register, isLoading, validateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);