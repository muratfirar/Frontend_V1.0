// src/components/Auth/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        return <div style={{textAlign: 'center', marginTop: '50px'}}>Yetkilendirme kontrol ediliyor...</div>;
    }

    return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;