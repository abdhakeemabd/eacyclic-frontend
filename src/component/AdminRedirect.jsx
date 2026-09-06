import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

function AdminRedirect() {
  const { isAuthenticated, loading } = useAdmin();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If authenticated, go to dashboard, otherwise go to login
  return isAuthenticated ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

export default AdminRedirect;
