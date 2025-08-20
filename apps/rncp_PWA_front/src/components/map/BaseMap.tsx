import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Map as LeafletMap } from 'leaflet';
import { Coordinates } from '@rncp/types';
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore - Vite handles CSS imports at runtime
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet avec Vite
import L from 'leaflet';
// @ts-ignore - Vite handles asset imports at runtime
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore - Vite handles asset imports at runtime
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
/* eslint-enable @typescript-eslint/ban-ts-comment */

// Configuration sécurisée des icônes Leaflet avec gestion d'erreur
try {
    const DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    L.Marker.prototype.options.icon = DefaultIcon;
} catch (error) {
    console.warn('⚠️ Leaflet icon configuration failed:', error);
}

interface BaseMapProps {
    center: Coordinates;
    zoom?: number;
    height?: string;
    width?: string;
    className?: string;
    children?: React.ReactNode;
    onMapReady?: (map: LeafletMap) => void;
    scrollWheelZoom?: boolean;
    zoomControl?: boolean;
    attribution?: boolean;
}

export const BaseMap: React.FC<BaseMapProps> = ({
    center,
    zoom = 13,
    height = '400px',
    width = '100%',
    className = '',
    children,
    onMapReady,
    scrollWheelZoom = true,
    zoomControl = true,
    attribution = true,
}) => {
    const mapRef = useRef<LeafletMap | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Validation des coordonnées
    const validCenter = React.useMemo(() => {
        console.log('📍 BaseMap - Checking center coordinates:', center);

        if (
            !center ||
            typeof center.latitude !== 'number' ||
            typeof center.longitude !== 'number' ||
            isNaN(center.latitude) ||
            isNaN(center.longitude) ||
            Math.abs(center.latitude) > 90 ||
            Math.abs(center.longitude) > 180
        ) {
            console.warn('⚠️ Invalid coordinates provided, using Paris default:', center);
            return { latitude: 48.8566, longitude: 2.3522 }; // Paris par défaut
        }

        return center;
    }, [center]);

    const handleMapLoad = React.useCallback(() => {
        console.log('🗺️ BaseMap - Map loaded successfully');
        setIsMapLoaded(true);
        setMapError(null);

        if (mapRef.current && onMapReady) {
            try {
                onMapReady(mapRef.current);
            } catch (error) {
                console.error('Error in onMapReady callback:', error);
                setMapError("Erreur lors de l'initialisation de la carte");
            }
        }
    }, [onMapReady]);

    // Removed handleMapError as whenCreated is used instead

    if (mapError) {
        return (
            <div className={`map-container map-error ${className}`} style={{ height, width }}>
                <div className="flex items-center justify-center h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center p-4">
                        <svg
                            className="w-8 h-8 text-gray-400 mx-auto mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-sm text-gray-600 mb-2">Carte indisponible</p>
                        <p className="text-xs text-gray-400">{mapError}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`map-container ${className}`} style={{ height, width }}>
            {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-[1000] rounded-lg">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-sm text-gray-600">Chargement de la carte...</p>
                    </div>
                </div>
            )}

            <MapContainer
                center={[validCenter.latitude, validCenter.longitude]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={scrollWheelZoom}
                zoomControl={zoomControl}
                attributionControl={attribution}
                ref={mapRef}
                whenReady={handleMapLoad}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    // TileLayer doesn't support onError prop
                />
                {children}
            </MapContainer>
        </div>
    );
};
