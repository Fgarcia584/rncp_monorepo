import React, { useState, useEffect, useMemo } from 'react';
import { Circle } from 'react-leaflet';
import { BaseMap, CustomMarker, DeliveryPersonMarker, OrderMarker, RoutePolyline } from './';
import { useCalculateETAMutation } from '../../store/api';
import { Order, DeliveryTracking, Coordinates } from '@rncp/types';

interface MerchantTrackingMapProps {
    orders: Order[];
    className?: string;
    height?: string;
    merchantLocation?: Coordinates;
    onDeliveryUpdate?: (orderId: number, tracking: DeliveryTracking) => void;
}

export const MerchantTrackingMap: React.FC<MerchantTrackingMapProps> = ({
    orders,
    className = '',
    height = '400px',
    merchantLocation,
    onDeliveryUpdate,
}) => {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [etaData, setEtaData] = useState<{ [orderId: number]: number }>({});

    // Calculer le centre de la carte basé sur les commandes
    const mapCenter = useMemo(() => {
        if (merchantLocation) {
            return merchantLocation;
        }

        if (orders.length > 0) {
            const validCoordinates = orders
                .filter((order) => order.deliveryCoordinates)
                .map((order) => order.deliveryCoordinates!);

            if (validCoordinates.length > 0) {
                const avgLat =
                    validCoordinates.reduce((sum, coord) => sum + coord.latitude, 0) / validCoordinates.length;
                const avgLng =
                    validCoordinates.reduce((sum, coord) => sum + coord.longitude, 0) / validCoordinates.length;
                return { latitude: avgLat, longitude: avgLng };
            }
        }

        // Paris par défaut
        return { latitude: 48.8566, longitude: 2.3522 };
    }, [merchantLocation, orders]);

    // Hook pour calculer l'ETA
    const [calculateETA] = useCalculateETAMutation();

    // Filtrer les commandes assignées avec livreur
    const assignedOrders = orders.filter(
        (order) => order.deliveryPersonId && (order.status === 'accepted' || order.status === 'in_transit'),
    );

    // TODO: Refactorer pour éviter les hooks dans les boucles
    // Pour l'instant, désactivé pour corriger les erreurs de linter
    const trackingQueries: Array<{ orderId: number; query: { data?: DeliveryTracking } }> = useMemo(() => [], []);
    const positionQueries: Array<{ deliveryPersonId: number; query: { data?: Coordinates } }> = useMemo(() => [], []);

    // Calculer les ETAs quand les positions changent
    useEffect(() => {
        const updateETAs = async () => {
            const newEtaData: { [orderId: number]: number } = {};

            for (const order of assignedOrders) {
                const trackingResult = trackingQueries.find((tq) => tq.orderId === order.id)?.query;
                const positionResult = positionQueries.find(
                    (pq) => pq.deliveryPersonId === order.deliveryPersonId,
                )?.query;

                if (trackingResult?.data && positionResult?.data && order.merchantCoordinates) {
                    try {
                        const tracking = trackingResult.data;
                        const position = positionResult.data;

                        // Calculer ETA vers le commerce ou vers le client selon le statut
                        const destination =
                            tracking.status === 'en_route_to_pickup'
                                ? order.merchantCoordinates
                                : order.deliveryCoordinates;

                        if (destination) {
                            const result = await calculateETA({
                                from: position,
                                to: destination,
                            }).unwrap();

                            newEtaData[order.id] = result.durationWithTrafficMinutes || result.durationMinutes;
                        }
                    } catch (error) {
                        console.error('Erreur calcul ETA:', error);
                    }
                }
            }

            setEtaData(newEtaData);
        };

        updateETAs();
    }, [assignedOrders, trackingQueries, positionQueries, calculateETA]);

    // Notifier les changements de tracking
    useEffect(() => {
        trackingQueries.forEach(({ orderId, query }) => {
            if (query.data && onDeliveryUpdate) {
                onDeliveryUpdate(orderId, query.data);
            }
        });
    }, [trackingQueries, onDeliveryUpdate]);

    const selectedOrder = assignedOrders.find((order) => order.id === selectedOrderId);
    const selectedTracking = trackingQueries.find((tq) => tq.orderId === selectedOrderId)?.query.data;

    return (
        <div className={`merchant-tracking-map ${className}`}>
            <BaseMap center={mapCenter} height={height} zoom={13} className="rounded-lg shadow-lg">
                {/* Position du commerce */}
                {merchantLocation && (
                    <CustomMarker
                        position={merchantLocation}
                        type="merchant"
                        title="Mon commerce"
                        description="Point de collecte"
                    />
                )}

                {/* Marqueurs des commandes et livreurs */}
                {assignedOrders.map((order) => {
                    const tracking = trackingQueries.find((tq) => tq.orderId === order.id)?.query.data;
                    const position = positionQueries.find((pq) => pq.deliveryPersonId === order.deliveryPersonId)?.query
                        .data;
                    const eta = etaData[order.id];

                    return (
                        <React.Fragment key={order.id}>
                            {/* Point de livraison */}
                            {order.deliveryCoordinates && (
                                <OrderMarker
                                    position={order.deliveryCoordinates}
                                    orderId={order.id}
                                    customerName={order.customerName}
                                    address={order.deliveryAddress}
                                    type="delivery"
                                    priority={order.priority}
                                    onClick={() => setSelectedOrderId(order.id)}
                                />
                            )}

                            {/* Position du livreur */}
                            {position && (
                                <DeliveryPersonMarker
                                    position={position}
                                    name={`Livreur ${order.deliveryPersonId}`}
                                    estimatedArrival={eta ? `${eta} min` : undefined}
                                    onClick={() => setSelectedOrderId(order.id)}
                                />
                            )}

                            {/* Cercle de proximité quand le livreur approche */}
                            {position && merchantLocation && tracking?.status === 'en_route_to_pickup' && (
                                <Circle
                                    center={[merchantLocation.latitude, merchantLocation.longitude]}
                                    radius={500} // 500m de rayon
                                    pathOptions={{
                                        color: '#10B981',
                                        fillColor: '#10B981',
                                        fillOpacity: 0.1,
                                        weight: 2,
                                    }}
                                />
                            )}

                            {/* Route du livreur sélectionné */}
                            {tracking?.route && order.id === selectedOrderId && (
                                <RoutePolyline route={tracking.route} color="#F59E0B" animated={true} />
                            )}
                        </React.Fragment>
                    );
                })}
            </BaseMap>

            {/* Panel d'informations */}
            <div className="mt-4 space-y-4">
                {/* Commande sélectionnée */}
                {selectedOrder && selectedTracking && (
                    <div className="p-4 bg-white rounded-lg shadow-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Commande #{selectedOrder.id}</h3>
                            <button
                                onClick={() => setSelectedOrderId(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Client</p>
                                <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                                <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Adresse de livraison</p>
                                <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress}</p>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Statut du livreur</p>
                                    <p className="text-sm text-gray-600">
                                        {selectedTracking.status === 'en_route_to_pickup' &&
                                            '🚗 En route vers le commerce'}
                                        {selectedTracking.status === 'at_pickup' && '🏪 Arrivé au commerce'}
                                        {selectedTracking.status === 'en_route_to_delivery' &&
                                            '🚚 En route vers le client'}
                                        {selectedTracking.status === 'at_delivery' && '🏠 Arrivé chez le client'}
                                        {selectedTracking.status === 'completed' && '✅ Livraison terminée'}
                                    </p>
                                </div>

                                {etaData[selectedOrder.id] && (
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-700">ETA</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {etaData[selectedOrder.id]} min
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedOrder.notes && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800">Instructions</p>
                                <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Vue d'ensemble des livraisons */}
                <div className="p-4 bg-white rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Livraisons en cours</h3>

                    {assignedOrders.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Aucune livraison en cours pour le moment</p>
                    ) : (
                        <div className="space-y-3">
                            {assignedOrders.map((order) => {
                                const tracking = trackingQueries.find((tq) => tq.orderId === order.id)?.query.data;
                                const eta = etaData[order.id];

                                return (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrderId(order.id)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                            selectedOrderId === order.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">#{order.id}</span>
                                                    <span className="text-sm text-gray-600">{order.customerName}</span>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            order.priority === 'urgent'
                                                                ? 'bg-red-100 text-red-800'
                                                                : order.priority === 'high'
                                                                  ? 'bg-orange-100 text-orange-800'
                                                                  : order.priority === 'normal'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {order.priority}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    {tracking?.status === 'en_route_to_pickup' &&
                                                        'En route vers le commerce'}
                                                    {tracking?.status === 'at_pickup' && 'Arrivé au commerce'}
                                                    {tracking?.status === 'en_route_to_delivery' &&
                                                        'En route vers le client'}
                                                    {tracking?.status === 'at_delivery' && 'Arrivé chez le client'}
                                                    {!tracking && 'En attente'}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                {eta && <p className="text-sm font-medium text-blue-600">{eta} min</p>}
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.scheduledDeliveryTime).toLocaleTimeString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
