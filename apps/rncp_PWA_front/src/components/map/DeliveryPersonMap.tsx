import React, { useState, useEffect, useCallback } from 'react';
import { BaseMap, CustomMarker, OrderMarker, RoutePolyline, GeolocationControl } from './';
import { useGeolocation } from '../../hooks/useGeolocation';
import { OrderListModal } from '../delivery/OrderListModal';
import {
    useCalculateOptimizedDeliveryRouteMutation,
    useStartDeliveryTrackingMutation,
    useUpdateDeliveryPersonPositionMutation,
    useUpdateDeliveryStatusMutation,
    useGetDeliveryPersonTrackingsQuery,
} from '../../store/api';
import { Order, DeliveryStatus, Position, Coordinates, GoogleRoute } from '../../types';
import { MapErrorBoundary } from './MapErrorBoundary';

interface DeliveryPersonMapProps {
    deliveryPersonId: number;
    assignedOrders: Order[];
    className?: string;
    height?: string;
    onRouteCalculated?: (route: GoogleRoute) => void;
    onStatusUpdate?: (orderId: number, status: DeliveryStatus) => void;
    onPositionUpdate?: (position: Position) => void;
}

export const DeliveryPersonMap: React.FC<DeliveryPersonMapProps> = ({
    deliveryPersonId,
    assignedOrders,
    className = '',
    height = '500px',
    onRouteCalculated,
    onStatusUpdate,
    onPositionUpdate,
}) => {
    // Debug logs
    console.group('🗺️ DeliveryPersonMap - Component Mount/Render');
    console.log('Props received:', {
        deliveryPersonId,
        assignedOrdersCount: assignedOrders?.length,
        height,
        className,
    });
    console.groupEnd();
    const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
    const [currentRoute, setCurrentRoute] = useState<GoogleRoute | null>(null);
    const [mapCenter, setMapCenter] = useState<Coordinates>({
        latitude: 48.8566,
        longitude: 2.3522, // Paris par défaut
    });
    const [isOrderListOpen, setIsOrderListOpen] = useState(false);

    // Hooks pour la géolocalisation - autoStart désactivé pour éviter les erreurs de permissions
    const { position, error: geolocationError } = useGeolocation({
        enableHighAccuracy: true,
        autoStart: false, // Désactivé pour éviter les crashes
    });

    console.log('📍 Geolocation status:', {
        hasPosition: !!position,
        error: geolocationError,
        position: position ? `${position.latitude}, ${position.longitude}` : null,
    });

    // Hooks Redux avec logs de debug
    console.log('🔗 Initializing Redux hooks...');
    const [calculateRoute] = useCalculateOptimizedDeliveryRouteMutation();
    const [startTracking] = useStartDeliveryTrackingMutation();
    const [updatePosition] = useUpdateDeliveryPersonPositionMutation();
    const [updateStatus] = useUpdateDeliveryStatusMutation();

    const {
        data: trackingsData,
        error: trackingsError,
        isLoading: trackingsLoading,
    } = useGetDeliveryPersonTrackingsQuery(deliveryPersonId, {
        pollingInterval: 30000, // Poll toutes les 30 secondes
    });

    console.log('📊 Redux state:', {
        trackingsData: trackingsData ? 'loaded' : 'null',
        trackingsError: trackingsError ? 'has error' : 'no error',
        isLoading: trackingsLoading,
    });

    const activeOrder = assignedOrders.find((order) => order.id === activeOrderId);
    const activeTracking = trackingsData?.trackings.find((t: { orderId: number }) => t.orderId === activeOrderId);

    // Mise à jour de la position en temps réel avec gestion d'erreur
    useEffect(() => {
        console.log('📍 Position update effect:', { hasPosition: !!position, deliveryPersonId });

        if (position && deliveryPersonId) {
            try {
                console.log('📡 Updating position via API:', position);
                updatePosition({
                    deliveryPersonId,
                    position,
                });

                if (onPositionUpdate) {
                    onPositionUpdate(position);
                }

                // Centrer la carte sur la position actuelle si coordonnées valides
                if (
                    typeof position.latitude === 'number' &&
                    typeof position.longitude === 'number' &&
                    !isNaN(position.latitude) &&
                    !isNaN(position.longitude)
                ) {
                    console.log('🎯 Updating map center:', position);
                    setMapCenter({
                        latitude: position.latitude,
                        longitude: position.longitude,
                    });
                } else {
                    console.warn('⚠️ Invalid position coordinates:', position);
                }
            } catch (error) {
                console.error('Error updating position:', error);
            }
        }
    }, [position, deliveryPersonId, updatePosition, onPositionUpdate]);

    // Calcul de route automatique quand une commande est sélectionnée
    const handleCalculateRoute = useCallback(
        async (order: Order) => {
            console.log('🛣️ Starting route calculation for order:', order.id);

            if (!position || !order.deliveryCoordinates) {
                console.warn('⚠️ Cannot calculate route: missing position or delivery coordinates', {
                    hasPosition: !!position,
                    hasDeliveryCoords: !!order.deliveryCoordinates,
                });
                return;
            }

            try {
                let pickupLocation = order.merchantCoordinates;

                // Si pas de coordonnées commerçant, utiliser l'adresse de livraison comme approximation
                if (!pickupLocation && order.merchantAddress) {
                    console.log('📍 No merchant coordinates, using delivery location as fallback');
                    // TODO: Géocoder l'adresse commerçant
                    pickupLocation = order.deliveryCoordinates; // Temporaire
                }

                if (!pickupLocation) {
                    console.warn('⚠️ Cannot calculate route: no pickup location available');
                    return;
                }

                console.log('🚀 Calling calculateRoute API...', {
                    deliveryPersonLocation: position,
                    pickupLocation,
                    deliveryLocation: order.deliveryCoordinates,
                });

                const result = await calculateRoute({
                    deliveryPersonLocation: position,
                    pickupLocation,
                    deliveryLocation: order.deliveryCoordinates,
                }).unwrap();

                console.log('✅ Route calculation successful:', result);

                if (result.routes && result.routes.length > 0) {
                    const route = result.routes[0];
                    setCurrentRoute(route);

                    if (onRouteCalculated) {
                        onRouteCalculated(route);
                    }

                    // Démarrer le tracking si pas encore fait
                    console.log('📡 Starting delivery tracking...');
                    await startTracking({
                        orderId: order.id,
                        deliveryPersonId,
                        pickupLocation,
                        deliveryLocation: order.deliveryCoordinates,
                    }).unwrap();

                    console.log('✅ Delivery tracking started successfully');
                } else {
                    console.warn('⚠️ No routes found in API response');
                }
            } catch (error: unknown) {
                console.error('❌ Route calculation failed:', error);
                const apiError = error as { message?: string; status?: number; data?: unknown };
                console.error('Error details:', {
                    message: apiError?.message,
                    status: apiError?.status,
                    data: apiError?.data,
                });

                // Optionnel: Afficher un message d'erreur à l'utilisateur
                // setError('Impossible de calculer la route. Vérifiez votre connexion.');
            }
        },
        [position, calculateRoute, startTracking, deliveryPersonId, onRouteCalculated],
    );

    // Sélection d'une commande
    const handleOrderSelect = (order: Order) => {
        setActiveOrderId(order.id);
        handleCalculateRoute(order);
    };

    // Ouvrir la liste des commandes
    const handleOpenOrderList = () => {
        setIsOrderListOpen(true);
    };

    // Mise à jour du statut de livraison avec gestion d'erreur renforcée
    const handleStatusUpdate = async (status: DeliveryStatus) => {
        if (!activeOrderId) {
            console.warn('⚠️ Cannot update status: no active order');
            return;
        }

        console.log('📦 Updating delivery status:', { orderId: activeOrderId, status });

        try {
            const result = await updateStatus({
                orderId: activeOrderId,
                status: status.toString() as
                    | 'en_route_to_pickup'
                    | 'at_pickup'
                    | 'en_route_to_delivery'
                    | 'at_delivery'
                    | 'completed',
            }).unwrap();

            console.log('✅ Status update successful:', result);

            if (onStatusUpdate) {
                onStatusUpdate(activeOrderId, status);
            }
        } catch (error: unknown) {
            console.error('❌ Status update failed:', error);
            const apiError = error as { message?: string; status?: number; data?: unknown };
            console.error('Error details:', {
                message: apiError?.message,
                status: apiError?.status,
                data: apiError?.data,
                orderId: activeOrderId,
                newStatus: status,
            });

            // Optionnel: Afficher un message d'erreur à l'utilisateur
            // setError('Impossible de mettre à jour le statut. Vérifiez votre connexion.');
        }
    };

    return (
        <div className={`delivery-person-map ${className}`}>
            <BaseMap center={mapCenter} height={height} zoom={14} className="rounded-lg shadow-lg">
                {/* Position actuelle du livreur */}
                {position && (
                    <CustomMarker
                        position={position}
                        type="current-location"
                        title="Ma position"
                        description={`Précision: ${position.accuracy ? Math.round(position.accuracy) : 'N/A'}m`}
                    />
                )}

                {/* Marqueurs des commandes */}
                {assignedOrders.map((order) => {
                    if (!order.deliveryCoordinates) return null;

                    return (
                        <React.Fragment key={order.id}>
                            {/* Point de collecte (commerçant) */}
                            {order.merchantCoordinates && (
                                <OrderMarker
                                    position={order.merchantCoordinates}
                                    orderId={order.id}
                                    customerName={order.customerName}
                                    address={order.merchantAddress}
                                    type="pickup"
                                    priority={order.priority}
                                    onClick={() => handleOrderSelect(order)}
                                />
                            )}

                            {/* Point de livraison */}
                            <OrderMarker
                                position={order.deliveryCoordinates}
                                orderId={order.id}
                                customerName={order.customerName}
                                address={order.deliveryAddress}
                                type="delivery"
                                priority={order.priority}
                                onClick={() => handleOrderSelect(order)}
                            />
                        </React.Fragment>
                    );
                })}

                {/* Route active */}
                {currentRoute && (
                    <RoutePolyline route={currentRoute} color="#3B82F6" animated={true} showDirections={true} />
                )}

                {/* Contrôle de géolocalisation */}
                <div className="absolute top-4 right-4 z-[1000]">
                    <MapErrorBoundary>
                        <GeolocationControl
                            onLocationUpdate={(pos) => {
                                console.log('🗺️ DeliveryPersonMap - Received position update:', pos);
                                try {
                                    console.log('📍 Updating mapCenter state to trigger MapController...');
                                    setMapCenter({
                                        latitude: pos.latitude,
                                        longitude: pos.longitude,
                                    });
                                    console.log(
                                        '✅ Map center state updated - MapController should handle recentering',
                                    );
                                } catch (error) {
                                    console.error('❌ Error updating map center:', error);
                                }
                            }}
                            onLocationError={(error) => {
                                console.error('Geolocation error:', error);
                            }}
                            autoStart={false}
                            className="bg-white/90 backdrop-blur-sm"
                        />
                    </MapErrorBoundary>
                </div>
            </BaseMap>

            {/* Panel de contrôle */}
            {activeOrder && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Commande #{activeOrder.id} - {activeOrder.customerName}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    activeOrder.priority === 'urgent'
                                        ? 'bg-red-100 text-red-800'
                                        : activeOrder.priority === 'high'
                                          ? 'bg-orange-100 text-orange-800'
                                          : activeOrder.priority === 'normal'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {activeOrder.priority}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Adresse de livraison</p>
                            <p className="text-sm text-gray-600">{activeOrder.deliveryAddress}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Heure prévue</p>
                            <p className="text-sm text-gray-600">
                                {new Date(activeOrder.scheduledDeliveryTime).toLocaleString('fr-FR')}
                            </p>
                        </div>
                    </div>

                    {activeOrder.notes && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">Instructions</p>
                            <p className="text-sm text-gray-600">{activeOrder.notes}</p>
                        </div>
                    )}

                    {/* Boutons d'action selon le statut */}
                    <div className="flex flex-wrap gap-2">
                        {(!activeTracking || activeTracking.status === 'en_route_to_pickup') && (
                            <button
                                onClick={() => handleStatusUpdate(DeliveryStatus.AT_PICKUP)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                🏪 Arrivé au commerce
                            </button>
                        )}

                        {activeTracking?.status === 'at_pickup' && (
                            <button
                                onClick={() => handleStatusUpdate(DeliveryStatus.PICKED_UP)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                📦 Colis récupéré
                            </button>
                        )}

                        {activeTracking?.status === 'en_route_to_delivery' && (
                            <button
                                onClick={() => handleStatusUpdate(DeliveryStatus.AT_DELIVERY)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                🏠 Arrivé chez le client
                            </button>
                        )}

                        {activeTracking?.status === 'at_delivery' && (
                            <button
                                onClick={() => handleStatusUpdate(DeliveryStatus.DELIVERED)}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                ✅ Livraison terminée
                            </button>
                        )}

                        {activeOrder.customerPhone && (
                            <a
                                href={`tel:${activeOrder.customerPhone}`}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                📞 Appeler client
                            </a>
                        )}
                    </div>

                    {/* Informations de route */}
                    {currentRoute && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Informations de route</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-700">Distance totale:</span>
                                    <span className="ml-2 font-medium">
                                        {currentRoute.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000} km
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Durée estimée:</span>
                                    <span className="ml-2 font-medium">
                                        {Math.round(
                                            currentRoute.legs.reduce((sum, leg) => sum + leg.duration.value, 0) / 60,
                                        )}{' '}
                                        min
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Bouton pour ouvrir la liste des commandes si aucune n'est active */}
            {!activeOrder && assignedOrders.length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Commandes assignées ({assignedOrders.length})</h3>
                        <button
                            onClick={handleOpenOrderList}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            📋 Voir toutes
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Cliquez sur &ldquo;📋 Voir toutes&rdquo; pour choisir une commande à livrer.
                    </p>
                </div>
            )}

            {/* Modal pour la liste des commandes */}
            <OrderListModal
                isOpen={isOrderListOpen}
                onClose={() => setIsOrderListOpen(false)}
                orders={assignedOrders}
                onOrderSelect={handleOrderSelect}
            />
        </div>
    );
};
