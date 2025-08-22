import React from 'react';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface MapErrorBoundaryProps {
    children: React.ReactNode;
}

export const MapErrorBoundary: React.FC<MapErrorBoundaryProps> = ({ children }) => {
    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.group('🗺️ Map Error Boundary - Detailed Log');
                console.error('Map Component Error:', error);
                console.error('Error Info:', errorInfo);

                // Check for specific errors
                if (error.message.includes('leaflet')) {
                    console.warn('⚠️ Leaflet-related error detected');
                }
                if (error.message.includes('geolocation') || error.message.includes('position')) {
                    console.warn('⚠️ Geolocation-related error detected');
                }
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    console.warn('⚠️ Network/API-related error detected');
                }

                console.groupEnd();
            }}
            fallback={
                <div className="map-error-fallback bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center">
                        <svg
                            className="w-12 h-12 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Carte Indisponible</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-md">
                            Une erreur s&apos;est produite lors du chargement de la carte interactive. Vérifiez la
                            console pour plus de détails.
                        </p>
                        <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
                            💡 Vérifiez: permissions géolocalisation, connexion réseau, console développeur
                        </div>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
};
