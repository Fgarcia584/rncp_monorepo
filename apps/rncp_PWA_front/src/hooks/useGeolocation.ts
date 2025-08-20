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
        if (!navigator.geolocation) {
            setError('Géolocalisation non supportée');
            return Promise.reject(new Error('Géolocalisation non supportée'));
        }

        setLoading(true);
        setError(null);

        return new Promise<Position>((resolve, reject) => {
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
        });
    }, [geolocationOptions]);

    const startWatching = React.useCallback(() => {
        if (!navigator.geolocation) {
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
    }, [watching, geolocationOptions]);

    const stopWatching = React.useCallback(() => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setWatching(false);
    }, [watchId]);

    useEffect(() => {
        if (options?.autoStart) {
            startWatching();
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
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
