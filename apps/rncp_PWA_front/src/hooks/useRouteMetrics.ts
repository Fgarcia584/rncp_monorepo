import React from 'react';
import { GoogleRoute } from '../types';

// Hook personnalisé pour calculer des métriques de route
export const useRouteMetrics = (route: GoogleRoute) => {
    return React.useMemo(() => {
        if (!route.legs || route.legs.length === 0) {
            return {
                totalDistance: 0,
                totalDuration: 0,
                totalDistanceText: '0 km',
                totalDurationText: '0 min',
            };
        }

        const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
        const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);

        const formatDistance = (meters: number) => {
            if (meters < 1000) return `${meters} m`;
            return `${(meters / 1000).toFixed(1)} km`;
        };

        const formatDuration = (seconds: number) => {
            const minutes = Math.round(seconds / 60);
            if (minutes < 60) return `${minutes} min`;
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}min`;
        };

        return {
            totalDistance,
            totalDuration,
            totalDistanceText: formatDistance(totalDistance),
            totalDurationText: formatDuration(totalDuration),
        };
    }, [route]);
};
