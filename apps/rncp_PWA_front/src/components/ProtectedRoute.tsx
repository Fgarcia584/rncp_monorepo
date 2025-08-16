import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center space-x-3">
                    <div className="loading-spinner"></div>
                    <span className="text-lg text-gray-600">Chargement...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
                        <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
                    </div>
                </div>
            )
        );
    }

    return <>{children}</>;
};
