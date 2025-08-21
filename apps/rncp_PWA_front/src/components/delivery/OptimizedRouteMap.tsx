import React, { useEffect, useState, useRef, useCallback } from 'react';
import { OrderResponse, Coordinates } from '@rncp/types';

interface OptimizedRouteMapProps {
    orders: OrderResponse[];
    currentPosition: Coordinates;
    startingAddress?: string;
    onRouteCalculated?: (route: google.maps.DirectionsResult) => void;
    className?: string;
    height?: string;
}

export const OptimizedRouteMap: React.FC<OptimizedRouteMapProps> = ({
    orders,
    currentPosition,
    startingAddress,
    onRouteCalculated,
    className = '',
    height = '600px',
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    
    // Refs pour stabiliser les valeurs et éviter les re-créations de useCallback
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


    const calculateOptimizedRoute = useCallback(() => {
        // Utiliser les refs pour éviter les re-créations
        const currentOrders = ordersRef.current;
        const currentStartingAddress = startingAddressRef.current;
        const currentPos = currentPositionRef.current;
        const callback = onRouteCalculatedRef.current;
        
        if (!directionsServiceRef.current || currentOrders.length === 0) return;
        
        // 🛑 CONTRÔLE DE PAUSE - Économiser les crédits Google Cloud
        if (isCalculationPaused) {
            console.log('⏸️ Calcul en pause - Arrêt pour économiser les crédits');
            return;
        }

        console.log('🚀 Lancement du calcul d\'itinéraire...', {
            timestamp: new Date().toISOString(),
            ordersCount: currentOrders.length,
            hasStartingAddress: !!currentStartingAddress,
            hasGeolocation: !!(currentPos?.latitude && currentPos?.longitude)
        });
        setIsLoading(true);
        setError('');

        const processRoute = (startPosition: google.maps.LatLng | google.maps.LatLngLiteral | string) => {
            // Préparer les waypoints (destinations intermédiaires)
            const waypoints = currentOrders.map(order => ({
                location: order.deliveryAddress,
                stopover: true,
            }));

            // Configuration de la requête de direction avec optimisation
            const request: google.maps.DirectionsRequest = {
                origin: startPosition,
                destination: startPosition, // Retour au point de départ
                waypoints: waypoints,
                optimizeWaypoints: true, // ✨ Optimisation automatique par Google
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false,
            };

            directionsServiceRef.current!.route(request, (result, status) => {
                setIsLoading(false);

                if (status === google.maps.DirectionsStatus.OK && result) {
                    console.log('🎯 Route optimisée calculée:', result);
                    
                    // Afficher la route sur la carte
                    directionsRendererRef.current?.setDirections(result);

                    // Extraire les informations de la route
                    const route = result.routes[0];
                    
                    const routeInfo = {
                        distance: route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0) / 1000 + ' km',
                        duration: route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0) / 60 + ' min',
                        optimizedOrder: result.routes[0].waypoint_order || [],
                    };

                    setRouteInfo(routeInfo);

                    // Callback avec le résultat
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

    }, [isCalculationPaused]); // ✅ SEULE dépendance : isCalculationPaused



    useEffect(() => {
        const initializeMap = async () => {
            if (!mapRef.current) return;

            try {
                // Attendre que Google Maps soit chargé
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

                // Déterminer le centre de la carte
                let mapCenter;
                if (currentPosition?.latitude && currentPosition?.longitude &&
                    !isNaN(currentPosition.latitude) && !isNaN(currentPosition.longitude)) {
                    mapCenter = { lat: currentPosition.latitude, lng: currentPosition.longitude };
                } else {
                    // Position par défaut (centre de Paris si pas de géolocalisation)
                    mapCenter = { lat: 48.8566, lng: 2.3522 };
                    console.warn('⚠️ Pas de géolocalisation, centrage sur Paris');
                }

                // Initialiser la carte
                const map = new google.maps.Map(mapRef.current, {
                    center: mapCenter,
                    zoom: 12,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                });

                mapInstanceRef.current = map;
                directionsServiceRef.current = new google.maps.DirectionsService();
                directionsRendererRef.current = new google.maps.DirectionsRenderer({
                    draggable: false,
                    panel: null,
                    suppressMarkers: false,
                    markerOptions: {
                        icon: {
                            url: 'data:image/svg+xml;base64=' + btoa(`
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                                    <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" fill="none"/>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(32, 32),
                            anchor: new google.maps.Point(16, 16),
                        }
                    }
                });

                directionsRendererRef.current.setMap(map);

                setIsLoading(false);

            } catch (err) {
                console.error('Erreur lors de l\'initialisation de la carte:', err);
                setError('Impossible de charger la carte');
                setIsLoading(false);
            }
        };

        initializeMap();

        return () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
            }
        };
    }, []);

    // État pour tracker si on a déjà calculé pour ces orders
    const [lastCalculatedOrdersHash, setLastCalculatedOrdersHash] = useState<string>('');
    
    // Créer un hash unique pour identifier les changements d'orders
    const getOrdersHash = useCallback((ordersList: typeof orders) => {
        return ordersList.map(o => o.id).join('-');
    }, []);
    
    // Effet séparé pour calculer la route une fois que la carte est initialisée
    useEffect(() => {
        const currentHash = getOrdersHash(orders);
        
        // Ne recalculer que si les orders ont vraiment changé (nouvelle liste d'IDs)
        if (!isLoading && 
            !isCalculationPaused && 
            directionsServiceRef.current && 
            orders.length > 0 &&
            currentHash !== lastCalculatedOrdersHash) {
            
            console.log('📦 Changement détecté dans les orders, recalcul nécessaire');
            setLastCalculatedOrdersHash(currentHash);
            
            const timeoutId = setTimeout(() => {
                calculateOptimizedRoute();
            }, 500); // Délai augmenté pour éviter les appels multiples

            return () => clearTimeout(timeoutId);
        }
    }, [orders, isLoading, isCalculationPaused, calculateOptimizedRoute, getOrdersHash, lastCalculatedOrdersHash]);


    const handleRecalculateRoute = () => {
        calculateOptimizedRoute();
    };

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
            {/* En-tête de contrôle des calculs - Toujours visible */}
            <div className="px-6 py-2 bg-yellow-50 border-b border-yellow-200">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-yellow-800">
                        <span className="font-medium">🎛️ Contrôles de calcul</span>
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
                                if (directionsRendererRef.current && mapInstanceRef.current) {
                                    // Méthode propre pour nettoyer les directions
                                    directionsRendererRef.current.setMap(null);
                                    directionsRendererRef.current.setMap(mapInstanceRef.current);
                                }
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
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm">
                                <span className="text-green-700 font-medium">Distance: </span>
                                <span className="font-semibold">{routeInfo.distance}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-green-700 font-medium">Durée: </span>
                                <span className="font-semibold">{routeInfo.duration}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-green-700 font-medium">Livraisons: </span>
                                <span className="font-semibold">{orders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Carte */}
            <div className="relative" style={{ height }}>
                <div 
                    ref={mapRef} 
                    style={{ height: "100%", width: "100%" }}
                    className="w-full h-full"
                />
                
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