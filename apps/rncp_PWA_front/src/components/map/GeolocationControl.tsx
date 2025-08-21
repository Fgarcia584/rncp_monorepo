import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    timeout = 5000,
    maximumAge = 60000,
    className = '',
}) => {
    const [isTracking, setIsTracking] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Ref pour savoir si le composant est monté
    const isMountedRef = useRef(true);

    // Refs stables pour les callbacks
    const onLocationUpdateRef = useRef(onLocationUpdate);
    const onLocationErrorRef = useRef(onLocationError);

    // Mettre à jour les refs quand les props changent
    useEffect(() => {
        onLocationUpdateRef.current = onLocationUpdate;
        onLocationErrorRef.current = onLocationError;
    }, [onLocationUpdate, onLocationError]);

    // Mettre à jour isMountedRef lors du montage/démontage
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const geolocationOptions: PositionOptions = React.useMemo(
        () => ({
            enableHighAccuracy,
            timeout,
            maximumAge,
        }),
        [enableHighAccuracy, timeout, maximumAge],
    );

    const handleSuccess = useCallback((position: GeolocationPosition) => {
        try {
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

            // Notifier le parent qui se chargera du recentrage
            console.log('📡 Notifying parent with position:', positionData);
            if (onLocationUpdateRef.current) {
                onLocationUpdateRef.current(positionData);
                console.log('✅ Parent notified successfully');
            } else {
                console.warn('⚠️ No onLocationUpdate callback provided');
            }
        } catch (error) {
            console.error('Error in handleSuccess:', error);
            setError('Erreur lors du traitement de la position');
        }
    }, []);

    const handleError = useCallback((error: GeolocationPositionError) => {
        try {
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

            if (onLocationErrorRef.current) {
                onLocationErrorRef.current(error);
            }
        } catch (err) {
            console.error('Error in handleError:', err);
        }
    }, []);

    const startTracking = useCallback(() => {
        if (!isMountedRef.current) return;

        try {
            if (!navigator || !navigator.geolocation || typeof navigator.geolocation.watchPosition !== 'function') {
                if (isMountedRef.current) {
                    setError('Géolocalisation non supportée par ce navigateur');
                }
                return;
            }

            setIsTracking(true);
            setError(null);

            const id = navigator.geolocation.watchPosition(handleSuccess, handleError, geolocationOptions);
            setWatchId(id);
        } catch (error) {
            console.error('Error starting geolocation tracking:', error);
            if (isMountedRef.current) {
                setError('Erreur lors du démarrage du suivi géographique');
                setIsTracking(false);
            }
        }
    }, [geolocationOptions, handleSuccess, handleError]);

    const stopTracking = useCallback(() => {
        try {
            if (
                watchId !== null &&
                navigator &&
                navigator.geolocation &&
                typeof navigator.geolocation.clearWatch === 'function'
            ) {
                navigator.geolocation.clearWatch(watchId);
            }
            if (isMountedRef.current) {
                setWatchId(null);
                setIsTracking(false);
            }
        } catch (error) {
            console.error('Error stopping geolocation tracking:', error);
            if (isMountedRef.current) {
                setIsTracking(false);
            }
        }
    }, [watchId]);

    const getCurrentPosition = useCallback(async () => {
        console.log('📍 GeolocationControl - getCurrentPosition called');

        try {
            if (
                !navigator ||
                !navigator.geolocation ||
                typeof navigator.geolocation.getCurrentPosition !== 'function'
            ) {
                console.error('❌ Geolocation not supported');
                setError('Géolocalisation non supportée par ce navigateur');
                return;
            }

            // Vérifier les permissions de géolocalisation
            if (navigator.permissions) {
                try {
                    const permission = await navigator.permissions.query({ name: 'geolocation' });
                    console.log('🔐 Geolocation permission status:', permission.state);

                    if (permission.state === 'denied') {
                        console.error('❌ Geolocation permission denied');
                        setError(
                            "Géolocalisation refusée. Veuillez autoriser l'accès à votre position dans les paramètres du navigateur.",
                        );
                        return;
                    }
                } catch (permError) {
                    console.warn('⚠️ Could not check geolocation permissions:', permError);
                }
            }

            console.log('🔄 Requesting current position...');
            setError(null);
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
        } catch (error) {
            console.error('❌ Error accessing geolocation:', error);
            setError("Erreur lors de l'accès à la géolocalisation");
        }
    }, [handleSuccess, handleError, geolocationOptions]);

    // Effet pour l'auto-démarrage
    useEffect(() => {
        if (autoStart) {
            startTracking();
        }
    }, [autoStart, startTracking]);

    // Effet pour le cleanup au démontage uniquement
    useEffect(() => {
        return () => {
            if (
                watchId !== null &&
                navigator &&
                navigator.geolocation &&
                typeof navigator.geolocation.clearWatch === 'function'
            ) {
                try {
                    navigator.geolocation.clearWatch(watchId);
                } catch (error) {
                    console.error('Error during cleanup:', error);
                }
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

                    <button
                        onClick={() => {
                            console.log('🧪 Test Paris button clicked');
                            if (onLocationUpdateRef.current) {
                                console.log('🗼 Setting position to Paris for testing...');
                                onLocationUpdateRef.current({
                                    latitude: 48.8566,
                                    longitude: 2.3522,
                                    accuracy: 10,
                                    timestamp: Date.now(),
                                });
                            }
                        }}
                        className="px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        title="Test de recentrage sur Paris"
                    >
                        🗼 Test
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

                {error && (
                    <div className="text-xs text-red-600 p-2 bg-red-50 rounded border border-red-200">
                        <div className="font-medium">⚠️ Erreur de géolocalisation</div>
                        <div className="mt-1">{error}</div>
                        {error.includes('refusée') && (
                            <div className="mt-2 text-xs text-gray-600">
                                💡 Pour autoriser : Cliquez sur l&apos;icône 🔒 dans la barre d&apos;adresse et
                                autorisez la géolocalisation
                            </div>
                        )}
                    </div>
                )}

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
