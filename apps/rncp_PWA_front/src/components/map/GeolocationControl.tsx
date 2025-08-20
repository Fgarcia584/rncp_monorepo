import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Position } from '@rncp/types';

interface GeolocationControlProps {
    onLocationUpdate?: (position: Position) => void;
    onLocationError?: (error: GeolocationPositionError) => void;
    autoStart?: boolean;
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    className?: string;
}

export const GeolocationControl: React.FC<GeolocationControlProps> = ({
    onLocationUpdate,
    onLocationError,
    autoStart = false,
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    className = '',
}) => {
    const map = useMap();
    const [isTracking, setIsTracking] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
    const [error, setError] = useState<string | null>(null);

    const geolocationOptions: PositionOptions = React.useMemo(
        () => ({
            enableHighAccuracy,
            timeout,
            maximumAge,
        }),
        [enableHighAccuracy, timeout, maximumAge],
    );

    const handleSuccess = React.useCallback(
        (position: GeolocationPosition) => {
            const positionData: Position = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude || undefined,
                altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
                heading: position.coords.heading || undefined,
                speed: position.coords.speed || undefined,
                timestamp: position.timestamp,
            };

            setCurrentPosition(positionData);
            setError(null);

            // Centrer la carte sur la nouvelle position
            if (map) {
                map.setView([positionData.latitude, positionData.longitude], map.getZoom());
            }

            // Notifier le parent
            if (onLocationUpdate) {
                onLocationUpdate(positionData);
            }
        },
        [map, onLocationUpdate],
    );

    const handleError = React.useCallback(
        (error: GeolocationPositionError) => {
            let errorMessage = '';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Géolocalisation refusée par l'utilisateur";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Position non disponible';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Timeout de géolocalisation';
                    break;
                default:
                    errorMessage = 'Erreur de géolocalisation inconnue';
                    break;
            }

            setError(errorMessage);
            setIsTracking(false);

            if (onLocationError) {
                onLocationError(error);
            }
        },
        [onLocationError],
    );

    const startTracking = React.useCallback(() => {
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée par ce navigateur');
            return;
        }

        setIsTracking(true);
        setError(null);

        const id = navigator.geolocation.watchPosition(handleSuccess, handleError, geolocationOptions);

        setWatchId(id);
    }, [geolocationOptions, handleSuccess, handleError]);

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
    };

    const getCurrentPosition = () => {
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée par ce navigateur');
            return;
        }

        setError(null);

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
    };

    // Auto-démarrage si demandé
    useEffect(() => {
        if (autoStart) {
            startTracking();
        }

        // Cleanup au démontage
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [autoStart, startTracking, watchId]);

    // Cleanup de watchId
    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    return (
        <div className={`geolocation-control ${className}`}>
            <div className="flex flex-col space-y-2 p-2 bg-white rounded-lg shadow-md">
                <div className="flex space-x-2">
                    <button
                        onClick={getCurrentPosition}
                        className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={isTracking}
                    >
                        📍 Position
                    </button>

                    {!isTracking ? (
                        <button
                            onClick={startTracking}
                            className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            ▶️ Suivre
                        </button>
                    ) : (
                        <button
                            onClick={stopTracking}
                            className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            ⏹️ Stop
                        </button>
                    )}
                </div>

                {isTracking && (
                    <div className="text-xs text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        Géolocalisation active
                    </div>
                )}

                {error && <div className="text-xs text-red-600 p-2 bg-red-50 rounded">⚠️ {error}</div>}

                {currentPosition && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        <div>
                            📍 {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}
                        </div>
                        {currentPosition.accuracy && <div>🎯 Précision: {Math.round(currentPosition.accuracy)}m</div>}
                        {currentPosition.timestamp && (
                            <div>🕒 {new Date(currentPosition.timestamp).toLocaleTimeString()}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
