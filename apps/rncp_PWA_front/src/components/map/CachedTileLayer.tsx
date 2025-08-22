import React, { useEffect } from 'react';
import { TileLayer } from 'react-leaflet';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { mapCache } from '../../utils/offlineMapCache';

interface CachedTileLayerProps {
    url: string;
    attribution: string;
    preloadOnMount?: boolean;
    preloadCenter?: [number, number];
    preloadZoom?: number;
}

export const CachedTileLayer: React.FC<CachedTileLayerProps> = ({
    url,
    attribution,
    preloadOnMount = false,
    preloadCenter,
    preloadZoom = 12,
}) => {
    const { isOnline } = useOnlineStatus();

    useEffect(() => {
        if (!isOnline) {
            console.log('📱 Mode hors ligne détecté - Utilisation du cache de tiles');
            return;
        }

        // Pré-charger les tiles si demandé
        if (preloadOnMount && preloadCenter) {
            const [lat, lng] = preloadCenter;
            mapCache.preloadArea(lat, lng, preloadZoom, 2);
        }
    }, [isOnline, preloadOnMount, preloadCenter, preloadZoom]);

    // En mode hors ligne, on utilise toujours l'URL standard
    // Le cache sera géré via les hooks du navigateur et le service worker
    return (
        <TileLayer
            url={url}
            attribution={attribution}
            opacity={isOnline ? 1 : 0.7} // Réduire l'opacité en mode hors ligne
            className={isOnline ? '' : 'offline-tiles'}
        />
    );
};