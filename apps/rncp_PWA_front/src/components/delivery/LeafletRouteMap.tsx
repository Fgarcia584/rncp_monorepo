import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { OrderResponse, Position } from '../../types';
import { extractRouteCoordinates, extractWaypoints } from '../../utils/polylineUtils';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { CachedTileLayer } from '../map/CachedTileLayer';

// Import des CSS Leaflet (nécessaire)
// import 'leaflet/dist/leaflet.css';

interface LeafletRouteMapProps {
    orders: OrderResponse[];
    currentPosition: Position;
    startingAddress?: string;
    onRouteCalculated?: (route: google.maps.DirectionsResult) => void;
    className?: string;
    height?: string;
}

// Composant pour centrer la carte sans changer le zoom
const CenterMapOnly: React.FC<{ 
    preferredCenter?: LatLngExpression;
    shouldCenter: boolean;
}> = ({ preferredCenter, shouldCenter }) => {
    const map = useMap();
    const [hasCenteredOnce, setHasCenteredOnce] = useState(false);
    
    useEffect(() => {
        // Centrer uniquement au montage initial, sans toucher au zoom
        if (shouldCenter && !hasCenteredOnce && preferredCenter) {
            const currentZoom = map.getZoom();
            map.setView(preferredCenter, currentZoom); // Garder le zoom actuel
            setHasCenteredOnce(true);
            console.log('🎯 Carte centrée sans changer le zoom:', currentZoom);
        }
    }, [preferredCenter, shouldCenter, hasCenteredOnce, map]);
    
    return null;
};

// Icônes personnalisées pour les marqueurs
const createCustomIcon = (color: string, text: string) => {
    const svgString = `
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 40 16 40S32 24.837 32 16C32 7.163 24.837 0 16 0Z" fill="${color}"/>
            <circle cx="16" cy="16" r="10" fill="white"/>
            <text x="16" y="20" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="${color}">${text}</text>
        </svg>
    `;
    
    return new Icon({
        iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
    });
};

const startIcon = createCustomIcon('#10B981', 'S');
const deliveryIcon = (index: number) => createCustomIcon('#3B82F6', (index + 1).toString());

// Icône pour la position GPS en temps réel
const createGPSIcon = () => {
    const svgString = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="#10B981" stroke="#059669" stroke-width="2"/>
            <circle cx="10" cy="10" r="4" fill="#FFFFFF"/>
            <circle cx="10" cy="10" r="2" fill="#10B981"/>
        </svg>
    `;
    
    return new Icon({
        iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
    });
};

const gpsIcon = createGPSIcon();

export const LeafletRouteMap: React.FC<LeafletRouteMapProps> = ({
    orders,
    currentPosition,
    startingAddress,
    onRouteCalculated,
    className = '',
    height = '600px',
}) => {
    // Hook de mode hors ligne
    const offlineMode = useOfflineMode(orders);
    // Refs pour stabiliser les valeurs et éviter les re-créations
    const currentPositionRef = useRef(currentPosition);
    const startingAddressRef = useRef(startingAddress);
    const ordersRef = useRef(orders);
    const onRouteCalculatedRef = useRef(onRouteCalculated);
    
    // Mettre à jour les refs quand les props changent
    useEffect(() => {
        currentPositionRef.current = currentPosition;
    }, [currentPosition]);
    
    useEffect(() => {
        startingAddressRef.current = startingAddress;
    }, [startingAddress]);
    
    useEffect(() => {
        ordersRef.current = orders;
    }, [orders]);
    
    useEffect(() => {
        onRouteCalculatedRef.current = onRouteCalculated;
    }, [onRouteCalculated]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isCalculationPaused, setIsCalculationPaused] = useState(false);
    const [routeInfo, setRouteInfo] = useState<{
        distance: string;
        duration: string;
        optimizedOrder: number[];
    } | null>(null);
    
    // État de la carte
    const [routeCoordinates, setRouteCoordinates] = useState<LatLngExpression[]>([]);
    const [waypoints, setWaypoints] = useState<{
        lat: number;
        lng: number;
        address: string;
        optimizedIndex: number;
    }[]>([]);
    const [shouldCenterMap, setShouldCenterMap] = useState(true);
    const [hasAutoCalculated, setHasAutoCalculated] = useState(false);
    
    // Services Google Maps (pour les calculs uniquement)
    const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    
    // État pour stocker les coordonnées de l'adresse de départ géocodée
    const [startingAddressCoordinates, setStartingAddressCoordinates] = useState<{lat: number, lng: number} | null>(null);
    
    // Fonction pour géocoder une adresse en coordonnées
    const geocodeAddress = useCallback(async (address: string): Promise<{lat: number, lng: number} | null> => {
        if (!geocoderRef.current || !address?.trim()) {
            return null;
        }
        
        return new Promise((resolve) => {
            geocoderRef.current!.geocode({ address }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                    const location = results[0].geometry.location;
                    const coords = { lat: location.lat(), lng: location.lng() };
                    console.log('📍 Adresse géocodée:', address, '→', coords);
                    resolve(coords);
                } else {
                    console.warn('⚠️ Impossible de géocoder l\'adresse:', address, status);
                    resolve(null);
                }
            });
        });
    }, []);
    
    const calculateOptimizedRoute = useCallback(() => {
        const currentOrders = ordersRef.current;
        const currentStartingAddress = startingAddressRef.current;
        const currentPos = currentPositionRef.current;
        const callback = onRouteCalculatedRef.current;
        
        // Vérifier si on peut calculer des routes (en ligne)
        if (!offlineMode.capabilities.canCalculateRoutes) {
            console.log('📱 Mode hors ligne - Utilisation des routes approximatives');
            const offlineRoute = offlineMode.generateOfflineRoute();
            
            if (offlineRoute) {
                setRouteCoordinates(offlineRoute.coordinates);
                setWaypoints(offlineRoute.waypoints.map(wp => ({
                    ...wp,
                    optimizedIndex: wp.orderIndex
                })));
                // Ne pas changer le zoom en mode offline
                setRouteInfo({
                    distance: offlineRoute.approximateDistance,
                    duration: offlineRoute.estimatedDuration,
                    optimizedOrder: offlineRoute.waypoints.map((_, index) => index),
                });
                setIsLoading(false);
                setError('');
            } else {
                setError('Mode GPS - Position en cours de localisation...');
            }
            return;
        }
        
        if (!directionsServiceRef.current || currentOrders.length === 0) return;
        
        if (isCalculationPaused) {
            console.log('⏸️ Calcul en pause - Arrêt pour économiser les crédits');
            return;
        }

        console.log('🚀 Lancement du calcul d\'itinéraire...', {
            timestamp: new Date().toISOString(),
            ordersCount: currentOrders.length,
            hasStartingAddress: !!currentStartingAddress,
            hasGeolocation: !!(currentPos?.latitude && currentPos?.longitude),
            orders: currentOrders.map(order => ({
                id: order.id,
                deliveryAddress: order.deliveryAddress,
                customerName: order.customerName
            }))
        });
        setIsLoading(true);
        setError('');

        const processRoute = (startPosition: google.maps.LatLng | google.maps.LatLngLiteral | string) => {
            const deliveryAddresses = currentOrders.map(order => order.deliveryAddress);
            
            // Créer un itinéraire linéaire : départ → livraisons → dernière livraison
            const waypoints = deliveryAddresses.slice(0, -1).map(address => ({
                location: address,
                stopover: true,
            }));
            
            // La destination est la dernière livraison (pas de retour au départ)
            const destination = deliveryAddresses.length > 0 
                ? deliveryAddresses[deliveryAddresses.length - 1]
                : startPosition;

            console.log('🗺️ Configuration itinéraire linéaire:', {
                origin: startPosition,
                destination,
                waypointsCount: waypoints.length,
                totalDeliveries: deliveryAddresses.length
            });

            const request: google.maps.DirectionsRequest = {
                origin: startPosition,
                destination: destination,
                waypoints: waypoints,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false,
            };

            directionsServiceRef.current!.route(request, (result, status) => {
                setIsLoading(false);

                if (status === google.maps.DirectionsStatus.OK && result) {
                    console.log('🎯 Route optimisée calculée:', result);
                    
                    // Extraire les coordonnées pour Leaflet
                    const coordinates = extractRouteCoordinates(result);
                    const waypointsData = extractWaypoints(result);
                    
                    console.log('📍 Waypoints extraits:', waypointsData);
                    console.log('🗺️ Coordonnées de route extraites:', coordinates.length, 'points');
                    
                    setRouteCoordinates(coordinates);
                    setWaypoints(waypointsData);
                    // Ne pas changer le zoom quand le trajet s'affiche
                    
                    const route = result.routes[0];
                    const routeInfo = {
                        distance: (route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0) / 1000).toFixed(1) + ' km',
                        duration: Math.round(route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0) / 60) + ' min',
                        optimizedOrder: result.routes[0].waypoint_order || [],
                    };

                    setRouteInfo(routeInfo);
                    
                    // Mettre en cache les données pour usage hors ligne
                    offlineMode.cacheRouteData({
                        routeCoordinates: coordinates,
                        waypoints: waypointsData,
                        routeInfo,
                    });

                    if (callback) {
                        callback(result);
                    }

                    console.log('📊 Informations de route:', routeInfo);
                    console.log('🔄 Ordre optimisé:', result.routes[0].waypoint_order);

                } else {
                    console.error('Erreur lors du calcul de la route:', status);
                    setError(`Impossible de calculer la route: ${status}`);
                }
            });
        };

        // Priorité 1: Adresse de départ fournie
        if (currentStartingAddress && currentStartingAddress.trim()) {
            console.log('📍 Utilisation de l\'adresse de départ fournie:', currentStartingAddress);
            processRoute(currentStartingAddress);
            return;
        }

        // Priorité 2: Géolocalisation
        if (currentPos?.latitude && currentPos?.longitude &&
            !isNaN(currentPos.latitude) && !isNaN(currentPos.longitude)) {
            console.log('📍 Utilisation de la géolocalisation');
            const startPosition = { lat: currentPos.latitude, lng: currentPos.longitude };
            processRoute(startPosition);
            return;
        }

        // Priorité 3: Position par défaut (centre de Paris)
        console.warn('⚠️ Pas d\'adresse de départ ni de géolocalisation, utilisation du centre de Paris');
        const defaultPosition = { lat: 48.8566, lng: 2.3522 };
        processRoute(defaultPosition);

    }, [isCalculationPaused, offlineMode]);

    // Initialisation des services Google Maps
    useEffect(() => {
        const initializeGoogleServices = async () => {
            try {
                if (!window.google) {
                    const script = document.createElement('script');
                    const apiKey = (import.meta as unknown as { env: { VITE_GOOGLE_MAPS_API_KEY: string } }).env.VITE_GOOGLE_MAPS_API_KEY;
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
                    script.async = true;
                    document.head.appendChild(script);
                    
                    await new Promise((resolve) => {
                        script.onload = resolve;
                    });
                }

                directionsServiceRef.current = new google.maps.DirectionsService();
                geocoderRef.current = new google.maps.Geocoder();
                setIsLoading(false);

            } catch (err) {
                console.error('Erreur lors de l\'initialisation des services Google:', err);
                setError('Impossible de charger les services de calcul d\'itinéraire');
                setIsLoading(false);
            }
        };

        initializeGoogleServices();
    }, []);

    // État pour tracker si on a déjà calculé pour ces orders
    const [lastCalculatedOrdersHash, setLastCalculatedOrdersHash] = useState<string>('');
    
    const getOrdersHash = useCallback((ordersList: typeof orders) => {
        return ordersList.map(o => o.id).join('-');
    }, []);
    
    // Auto-calcul au premier chargement séparé des changements d'orders
    useEffect(() => {
        if (!hasAutoCalculated && !isLoading && directionsServiceRef.current) {
            console.log('🚀 Premier chargement - Auto-calcul programmé dans 2 secondes');
            console.log('📊 État:', { 
                hasAutoCalculated, 
                isLoading, 
                ordersLength: orders.length,
                hasDirectionsService: !!directionsServiceRef.current
            });
            
            const timeoutId = setTimeout(() => {
                setHasAutoCalculated(true);
                if (orders.length > 0) {
                    const currentHash = getOrdersHash(orders);
                    setLastCalculatedOrdersHash(currentHash);
                    console.log('🎯 Lancement du calcul automatique avec', orders.length, 'commandes');
                    calculateOptimizedRoute();
                } else {
                    console.log('📍 Pas de commandes - Attente de données');
                }
            }, 2000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [hasAutoCalculated, isLoading, orders, calculateOptimizedRoute, getOrdersHash]);
    
    // Recalcul quand les orders changent (après le premier calcul)
    useEffect(() => {
        if (hasAutoCalculated && !isLoading && !isCalculationPaused && directionsServiceRef.current && orders.length > 0) {
            const currentHash = getOrdersHash(orders);
            
            if (currentHash !== lastCalculatedOrdersHash) {
                console.log('📦 Changement détecté dans les orders, recalcul nécessaire');
                setLastCalculatedOrdersHash(currentHash);
                
                const timeoutId = setTimeout(() => {
                    calculateOptimizedRoute();
                }, 500);
                
                return () => clearTimeout(timeoutId);
            }
        }
    }, [orders, hasAutoCalculated, isLoading, isCalculationPaused, calculateOptimizedRoute, getOrdersHash, lastCalculatedOrdersHash]);

    // Géocoder l'adresse de départ quand elle change
    useEffect(() => {
        const geocodeStartingAddress = async () => {
            if (startingAddress?.trim() && geocoderRef.current) {
                const coords = await geocodeAddress(startingAddress);
                setStartingAddressCoordinates(coords);
            } else {
                setStartingAddressCoordinates(null);
            }
        };

        geocodeStartingAddress();
    }, [startingAddress, geocodeAddress]);

    const handleRecalculateRoute = () => {
        calculateOptimizedRoute();
    };

    // Centre par défaut de la carte avec priorité à la géolocalisation GPS
    const defaultCenter: [number, number] = 
        // 1. Priorité : position GPS actuelle si disponible
        (currentPosition?.latitude && currentPosition?.longitude)
            ? [currentPosition.latitude, currentPosition.longitude]
        // 2. Fallback : adresse de départ géocodée
        : startingAddressCoordinates
            ? [startingAddressCoordinates.lat, startingAddressCoordinates.lng]  
        // 3. Dernier recours : Paris
        : [48.8566, 2.3522];

    if (error) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="text-center">
                    <div className="text-red-600 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M9 12a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Erreur de carte</h3>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={handleRecalculateRoute}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
            {/* En-tête de contrôle des calculs */}
            <div className={`px-6 py-2 border-b ${
                offlineMode.isOnline 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-blue-50 border-blue-200'
            }`}>
                <div className="flex items-center justify-between">
                    <div className={`text-sm ${offlineMode.isOnline ? 'text-yellow-800' : 'text-blue-800'}`}>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">
                                {offlineMode.isOnline ? '🎛️ Contrôles de calcul' : '📍 Mode GPS'}
                            </span>
                            {offlineMode.isOnline ? (
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-700">En ligne</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-blue-700">
                                        Hors ligne • GPS actif • Routes approximatives
                                    </span>
                                </div>
                            )}
                            {offlineMode.isRecentlyBack && (
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-xs text-orange-700">Synchronisation...</span>
                                </div>
                            )}
                        </div>
                        {isCalculationPaused && <span className="ml-2 text-red-600 font-semibold">⏸️ EN PAUSE</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isCalculationPaused ? (
                            <button
                                onClick={() => setIsCalculationPaused(true)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                ⏸️ PAUSE CALCULS
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsCalculationPaused(false)}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                ▶️ REPRENDRE
                            </button>
                        )}
                        
                        <button
                            onClick={() => {
                                setIsCalculationPaused(false);
                                handleRecalculateRoute();
                            }}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={isLoading || isCalculationPaused}
                        >
                            {isLoading ? 'Calcul...' : '🔄 Recalculer'}
                        </button>
                        
                        <button
                            onClick={() => {
                                setIsCalculationPaused(true);
                                setRouteInfo(null);
                                setRouteCoordinates([]);
                                setWaypoints([]);
                                setShouldCenterMap(false); // Désactiver le centrage après reset
                                setHasAutoCalculated(false); // Permettre un nouveau auto-calcul
                            }}
                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            🛑 RESET
                        </button>
                    </div>
                </div>
            </div>

            {/* En-tête avec informations de route */}
            {routeInfo && (
                <div className={`px-6 py-4 border-b ${
                    offlineMode.isOnline 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-blue-50 border-blue-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm">
                                <span className={`font-medium ${
                                    offlineMode.isOnline ? 'text-green-700' : 'text-blue-700'
                                }`}>Distance: </span>
                                <span className="font-semibold">{routeInfo.distance}</span>
                            </div>
                            <div className="text-sm">
                                <span className={`font-medium ${
                                    offlineMode.isOnline ? 'text-green-700' : 'text-blue-700'
                                }`}>Durée: </span>
                                <span className="font-semibold">{routeInfo.duration}</span>
                                {!offlineMode.isOnline && (
                                    <span className="text-xs text-blue-600 ml-1">(approx.)</span>
                                )}
                            </div>
                            <div className="text-sm">
                                <span className={`font-medium ${
                                    offlineMode.isOnline ? 'text-green-700' : 'text-blue-700'
                                }`}>Livraisons: </span>
                                <span className="font-semibold">{orders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Carte Leaflet */}
            <div className="relative" style={{ height }}>
                <MapContainer
                    center={defaultCenter}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    className="leaflet-container"
                >
                    <CachedTileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        preloadOnMount={false}
                        preloadCenter={defaultCenter}
                    />
                    
                    {/* Trajet optimisé */}
                    {routeCoordinates.length > 0 && (
                        <>
                            <Polyline
                                positions={routeCoordinates}
                                color={offlineMode.isOnline ? "#3B82F6" : "#60A5FA"}
                                weight={offlineMode.isOnline ? 4 : 3}
                                opacity={offlineMode.isOnline ? 0.8 : 0.6}
                                dashArray={offlineMode.isOnline ? undefined : "10, 10"}
                            />
                            <CenterMapOnly 
                                preferredCenter={defaultCenter}
                                shouldCenter={shouldCenterMap}
                            />
                        </>
                    )}
                    
                    {/* Marqueur GPS en temps réel */}
                    {currentPosition && (
                        <Marker
                            key="gps-position"
                            position={[currentPosition.latitude, currentPosition.longitude]}
                            icon={gpsIcon}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong>📍 Votre position GPS</strong>
                                    <br />
                                    <div className="mt-1 text-xs text-gray-600">
                                        Lat: {currentPosition.latitude.toFixed(6)}
                                        <br />
                                        Lng: {currentPosition.longitude.toFixed(6)}
                                        <br />
                                        {currentPosition.accuracy && (
                                            <>Précision: ±{Math.round(currentPosition.accuracy)}m</>
                                        )}
                                        <br />
                                        <div className="text-xs text-gray-500 mt-1">
                                            Dernière mise à jour: {new Date(currentPosition.timestamp || Date.now()).toLocaleTimeString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    
                    {/* Marqueurs pour les points de livraison */}
                    {waypoints.map((waypoint, index) => (
                        <Marker
                            key={`waypoint-${index}`}
                            position={[waypoint.lat, waypoint.lng]}
                            icon={waypoint.optimizedIndex === -1 ? startIcon : deliveryIcon(waypoint.optimizedIndex)}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong>
                                        {waypoint.optimizedIndex === -1 ? '🏁 Point de départ' : `📦 Livraison ${waypoint.optimizedIndex + 1}`}
                                    </strong>
                                    <br />
                                    {waypoint.address}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Calcul de l&apos;itinéraire optimisé...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};