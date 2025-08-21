import React, { useState, useEffect } from 'react';
import { Position } from '@rncp/types';

// Hook personnalisé pour la géolocalisation
export const useGeolocation = (options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    autoStart?: boolean;
}) => {
    const [position, setPosition] = useState<Position | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [watching, setWatching] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);

    const geolocationOptions: PositionOptions = React.useMemo(
        () => ({
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 10000,
            maximumAge: options?.maximumAge ?? 300000,
        }),
        [options?.enableHighAccuracy, options?.timeout, options?.maximumAge],
    );

    const getCurrentPosition = React.useCallback(() => {
        try {
            if (
                !navigator ||
                !navigator.geolocation ||
                typeof navigator.geolocation.getCurrentPosition !== 'function'
            ) {
                const error = 'Géolocalisation non supportée';
                setError(error);
                return Promise.reject(new Error(error));
            }

            setLoading(true);
            setError(null);

            return new Promise<Position>((resolve, reject) => {
                try {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const position: Position = {
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude,
                                accuracy: pos.coords.accuracy,
                                altitude: pos.coords.altitude || undefined,
                                altitudeAccuracy: pos.coords.altitudeAccuracy || undefined,
                                heading: pos.coords.heading || undefined,
                                speed: pos.coords.speed || undefined,
                                timestamp: pos.timestamp,
                            };

                            setPosition(position);
                            setLoading(false);
                            resolve(position);
                        },
                        (err) => {
                            setError(err.message);
                            setLoading(false);
                            reject(err);
                        },
                        geolocationOptions,
                    );
                } catch (innerError) {
                    console.error('Error in getCurrentPosition call:', innerError);
                    const errorMessage = "Erreur lors de l'accès à la géolocalisation";
                    setError(errorMessage);
                    setLoading(false);
                    reject(new Error(errorMessage));
                }
            });
        } catch (error) {
            console.error('Error in getCurrentPosition:', error);
            const errorMessage = "Erreur lors de l'initialisation de la géolocalisation";
            setError(errorMessage);
            setLoading(false);
            return Promise.reject(new Error(errorMessage));
        }
    }, [geolocationOptions]);

    const startWatching = React.useCallback(() => {
        try {
            if (!navigator || !navigator.geolocation || typeof navigator.geolocation.watchPosition !== 'function') {
                setError('Géolocalisation non supportée');
                return;
            }

            if (watching) return;

            setWatching(true);
            setError(null);

            const id = navigator.geolocation.watchPosition(
                (pos) => {
                    const position: Position = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        altitude: pos.coords.altitude || undefined,
                        altitudeAccuracy: pos.coords.altitudeAccuracy || undefined,
                        heading: pos.coords.heading || undefined,
                        speed: pos.coords.speed || undefined,
                        timestamp: pos.timestamp,
                    };

                    setPosition(position);
                },
                (err) => {
                    setError(err.message);
                    setWatching(false);
                },
                geolocationOptions,
            );

            setWatchId(id);
        } catch (error) {
            console.error('Error starting geolocation watching:', error);
            setError('Erreur lors du démarrage du suivi géographique');
            setWatching(false);
        }
    }, [watching, geolocationOptions]);

    const stopWatching = React.useCallback(() => {
        try {
            if (
                watchId !== null &&
                navigator &&
                navigator.geolocation &&
                typeof navigator.geolocation.clearWatch === 'function'
            ) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
            }
            setWatching(false);
        } catch (error) {
            console.error('Error stopping geolocation watching:', error);
            setWatching(false);
        }
    }, [watchId]);

    useEffect(() => {
        if (options?.autoStart) {
            startWatching();
        }

        return () => {
            try {
                if (
                    watchId !== null &&
                    navigator &&
                    navigator.geolocation &&
                    typeof navigator.geolocation.clearWatch === 'function'
                ) {
                    navigator.geolocation.clearWatch(watchId);
                }
            } catch (error) {
                console.error('Error cleaning up geolocation on unmount:', error);
            }
        };
    }, [options?.autoStart, startWatching, watchId]);

    return {
        position,
        error,
        loading,
        watching,
        getCurrentPosition,
        startWatching,
        stopWatching,
    };
};
