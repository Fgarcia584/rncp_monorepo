import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Coordinates } from '../../types';

interface MapControllerProps {
    center?: Coordinates;
    zoom?: number;
    onMapReady?: (map: L.Map) => void;
}

export const MapController: React.FC<MapControllerProps> = ({ center, zoom, onMapReady }) => {
    const map = useMap();

    useEffect(() => {
        if (onMapReady) {
            onMapReady(map);
        }
    }, [map, onMapReady]);

    useEffect(() => {
        console.log('🎮 MapController - Center changed:', center);
        if (center && map) {
            const { latitude, longitude } = center;
            console.log('📍 MapController - Validating coordinates:', { latitude, longitude });
            if (
                typeof latitude === 'number' &&
                typeof longitude === 'number' &&
                !isNaN(latitude) &&
                !isNaN(longitude) &&
                Math.abs(latitude) <= 90 &&
                Math.abs(longitude) <= 180
            ) {
                console.log('✅ MapController - Coordinates valid, setting view...');
                map.setView([latitude, longitude], zoom || map.getZoom());
                console.log('🎯 MapController - Map view set to:', [latitude, longitude]);
            } else {
                console.warn('⚠️ MapController - Invalid coordinates:', { latitude, longitude });
            }
        } else {
            console.log('⚠️ MapController - Missing center or map:', { hasCenter: !!center, hasMap: !!map });
        }
    }, [center, zoom, map]);

    return null;
};
