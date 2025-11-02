import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role_name;

        if (!allowedRoles.includes(userRole)) {
            if (userRole === 'Student') return <Navigate to="/student-dashboard" replace />;
            if (userRole === 'Teacher') return <Navigate to="/teacher-dashboard" replace />;
            if (userRole === 'Administrator') return <Navigate to="/admin-dashboard" replace />;
            if (userRole === 'Company') return <Navigate to="/company-dashboard" replace />;
            return <Navigate to="/" replace />;
        }
        if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.clear();
            return <Navigate to="/" replace />;
        }
        return <Outlet />;

    } catch (err) {
        localStorage.clear();
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;