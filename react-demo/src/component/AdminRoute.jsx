import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress } from '@mui/material';

export const AdminRoute = ({ children }) => {
    const { isAdmin, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/main/dashboard" replace />;
    }

    return children;
};
