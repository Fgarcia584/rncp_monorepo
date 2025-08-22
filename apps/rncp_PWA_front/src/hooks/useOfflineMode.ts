import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useGeolocation } from './useGeolocation';
import { OrderResponse } from '../types';
import { LatLngExpression } from 'leaflet';

interface CachedRouteData {
    routeCoordinates: LatLngExpression[];
    waypoints: {
        lat: number;
        lng: number;
        address: string;
        optimizedIndex: number;
    }[];
    routeInfo: {
        distance: string;
        duration: string;
        optimizedOrder: number[];
    };
    timestamp: number;
}

interface OfflineModeCapabilities {
    canCalculateRoutes: boolean;
    canGeocode: boolean;
    canLoadMapTiles: boolean;
    canUseGPS: boolean;
    canNavigate: boolean;
}

interface OfflineRouteData {
    coordinates: LatLngExpression[];
    waypoints: Array<{
        lat: number;
        lng: number;
        address: string;
        orderIndex: number;
    }>;
    approximateDistance: string;
    estimatedDuration: string;
}

export const useOfflineMode = (orders: OrderResponse[]) => {
    const { isOnline, wasOffline, isRecentlyBack } = useOnlineStatus();
    const { position: currentPosition, error: geoError } = useGeolocation();
    
    // Cache des données de route
    const [cachedRouteData, setCachedRouteData] = useState<CachedRouteData | null>(null);
    const [offlineNotificationShown, setOfflineNotificationShown] = useState(false);

    // Capacités disponibles selon le mode
    const capabilities: OfflineModeCapabilities = useMemo(() => ({
        canCalculateRoutes: isOnline,
        canGeocode: isOnline,
        canLoadMapTiles: isOnline || false, // TODO: Implémenter cache des tiles
        canUseGPS: true, // Toujours disponible
        canNavigate: true, // Apps natives toujours disponibles
    }), [isOnline]);

    // Cache des données quand on est en ligne
    const cacheRouteData = useCallback((routeData: Omit<CachedRouteData, 'timestamp'>) => {
        const cachedData: CachedRouteData = {
            ...routeData,
            timestamp: Date.now(),
        };
        setCachedRouteData(cachedData);
        
        // Sauvegarder en localStorage pour persistance
        try {
            localStorage.setItem('cachedRouteData', JSON.stringify(cachedData));
            console.log('💾 Données de route mises en cache pour usage hors ligne');
        } catch (error) {
            console.warn('⚠️ Impossible de sauvegarder le cache de route:', error);
        }
    }, []);

    // Charger les données du cache au démarrage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('cachedRouteData');
            if (stored) {
                const parsed = JSON.parse(stored) as CachedRouteData;
                // Vérifier que le cache n'est pas trop ancien (24h max)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setCachedRouteData(parsed);
                    console.log('📦 Données de route récupérées du cache');
                }
            }
        } catch (error) {
            console.warn('⚠️ Erreur lors du chargement du cache:', error);
        }
    }, []);

    // Génération de route approximative hors ligne
    const generateOfflineRoute = useCallback((): OfflineRouteData | null => {
        if (!currentPosition || orders.length === 0) {
            console.log('📍 Position GPS ou commandes manquantes pour route hors ligne');
            return null;
        }

        console.log('🗺️ Génération de route approximative hors ligne');

        // Point de départ (position actuelle)
        const startCoords: LatLngExpression = [currentPosition.latitude, currentPosition.longitude];
        
        // Waypoints des livraisons (utiliser les coordonnées cachées si disponibles)
        const waypoints = orders.map((order, index) => {
            // TODO: Dans un vrai système, on aurait géocodé et mis en cache les adresses
            // Pour le moment, on génère des coordonnées approximatives autour de Paris
            const lat = 48.8566 + (Math.random() - 0.5) * 0.1; // ±0.05° autour de Paris
            const lng = 2.3522 + (Math.random() - 0.5) * 0.1;
            
            return {
                lat,
                lng,
                address: order.deliveryAddress,
                orderIndex: index,
            };
        });

        // Créer des lignes droites approximatives entre les points (itinéraire linéaire)
        const coordinates: LatLngExpression[] = [startCoords];
        
        waypoints.forEach(waypoint => {
            coordinates.push([waypoint.lat, waypoint.lng]);
        });
        
        // Pas de retour au point de départ (itinéraire linéaire)

        // Estimation approximative de distance et durée
        const approximateDistanceKm = waypoints.length * 5; // ~5km par livraison
        const approximateDurationMin = waypoints.length * 20; // ~20min par livraison

        return {
            coordinates,
            waypoints,
            approximateDistance: `~${approximateDistanceKm} km`,
            estimatedDuration: `~${approximateDurationMin} min`,
        };
    }, [currentPosition, orders]);

    // Gestion des notifications hors ligne
    useEffect(() => {
        if (!isOnline && !offlineNotificationShown && orders.length > 0) {
            setOfflineNotificationShown(true);
            console.log('📱 Mode hors ligne activé - GPS disponible');
            
            // TODO: Afficher toast notification
            // showToast({
            //     type: 'info',
            //     title: 'Mode GPS activé',
            //     message: 'Géolocalisation disponible. Routes approximatives affichées.',
            //     duration: 5000,
            // });
        }

        if (isOnline && isRecentlyBack && wasOffline) {
            console.log('🌐 Connexion restaurée - Synchronisation...');
            setOfflineNotificationShown(false);
            
            // TODO: Afficher toast de reconnexion
            // showToast({
            //     type: 'success',
            //     title: 'Connexion restaurée',
            //     message: 'Synchronisation des données en cours...',
            //     duration: 3000,
            // });
        }
    }, [isOnline, offlineNotificationShown, orders.length, isRecentlyBack, wasOffline]);

    // Fonction pour ouvrir la navigation native
    const openNativeNavigation = useCallback((address: string, coordinates?: { lat: number; lng: number }) => {
        const encodedAddress = encodeURIComponent(address);
        
        // Utiliser les coordonnées si disponibles, sinon l'adresse
        const destination = coordinates 
            ? `${coordinates.lat},${coordinates.lng}`
            : encodedAddress;

        // URLs pour différentes apps de navigation
        const googleMapsUrl = `https://maps.google.com/maps?q=${destination}`;
        
        // Ouvrir dans Google Maps par défaut
        window.open(googleMapsUrl, '_blank');
        
        console.log('🧭 Navigation native ouverte:', { address, coordinates });
    }, []);

    return {
        // État de connectivité
        isOnline,
        capabilities,
        isRecentlyBack,
        wasOffline,
        
        // Données de route
        cachedRouteData,
        cacheRouteData,
        
        // Mode hors ligne
        generateOfflineRoute,
        currentPosition,
        geoError,
        
        // Utilitaires
        openNativeNavigation,
        
        // État interne
        offlineNotificationShown,
    };
};