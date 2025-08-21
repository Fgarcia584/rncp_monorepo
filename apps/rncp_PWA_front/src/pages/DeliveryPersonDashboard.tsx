import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useGetAvailableOrdersQuery, useAcceptOrderMutation, useGetOrdersQuery } from '../store/api/orderApi';
import { DeliveryPersonMap } from '../components/map';
import { MapErrorBoundary } from '../components/map/MapErrorBoundary';
import { OrderStatus, OrderPriority, Coordinates, OrderResponse } from '@rncp/types';
import { useAuth } from '../hooks/useAuth';
import { StartDeliveryRoundModal } from '../components/delivery/StartDeliveryRoundModal';
import { LeafletRouteMap } from '../components/delivery/LeafletRouteMap';
import { DeliveryStepsList } from '../components/delivery/DeliveryStepsList';
import { useGeolocation } from '../hooks/useGeolocation';

export function DeliveryPersonDashboard() {
    const [showAvailableOrders, setShowAvailableOrders] = useState(false);
    const [showMapView, setShowMapView] = useState(false);
    const [showDeliveryRoundModal, setShowDeliveryRoundModal] = useState(false);
    const [activeDeliveryRound, setActiveDeliveryRound] = useState<{
        orders: OrderResponse[];
        optimizedOrder: number[];
        currentStep: number;
        startingAddress?: string;
    } | null>(null);

    // Récupérer les informations d'authentification
    const { user } = useAuth();
    const { position: currentPosition, getCurrentPosition, error: geoError } = useGeolocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
        autoStart: true
    });

    // ID du livreur depuis l'état d'authentification
    const deliveryPersonId = user?.id || 1;
    
    // Démarrer automatiquement la géolocalisation au montage du composant
    useEffect(() => {
        console.log('🌍 DeliveryPersonDashboard monté - Demande d\'autorisation géolocalisation');
        console.log('📍 Position actuelle:', currentPosition);
        console.log('❌ Erreur géolocalisation:', geoError);
        
        if (!currentPosition && !geoError) {
            console.log('🔍 Demande explicite de géolocalisation...');
            getCurrentPosition()
                .then((position) => {
                    console.log('✅ Position obtenue:', position);
                    console.log('📍 Coordonnées:', {
                        latitude: position.latitude,
                        longitude: position.longitude,
                        accuracy: position.accuracy
                    });
                })
                .catch((error) => {
                    console.error('❌ Erreur obtention position:', error);
                    console.log('🔧 Vérification des permissions navigateur...');
                    navigator.permissions.query({ name: 'geolocation' })
                        .then((result) => {
                            console.log('🔐 Statut permission géolocalisation:', result.state);
                        })
                        .catch((permError) => {
                            console.warn('⚠️ Impossible de vérifier les permissions:', permError);
                        });
                });
        }
    }, [currentPosition, geoError, getCurrentPosition]);
    const {
        data: availableOrdersData,
        isLoading,
        error,
        refetch,
    } = useGetAvailableOrdersQuery({ limit: 10 }, { skip: !showAvailableOrders });
    const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();

    // Get all orders for this delivery person
    const { data: allOrdersData, isLoading: isLoadingOrders } = useGetOrdersQuery({
        limit: 100,
    });

    // Separate orders by status
    const { assignedOrders, completedOrders, deliveryStats } = useMemo(() => {
        const allOrders = allOrdersData?.orders || [];

        // Filter assigned orders (accepted, in_transit)
        const assigned = allOrders.filter((order) => order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.IN_TRANSIT);

        // Filter completed orders
        const completed = allOrders.filter((order) => order.status === OrderStatus.DELIVERED);

        // Calculate today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter today's orders
        const todayOrders = allOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });

        const todayCompleted = todayOrders.filter((order) => order.status === OrderStatus.DELIVERED);

        return {
            assignedOrders: assigned,
            completedOrders: completed.slice(0, 10), // Show last 10 completed
            deliveryStats: {
                todayDeliveries: todayOrders.length,
                completedDeliveries: todayCompleted.length,
                pendingDeliveries: assigned.length,
                totalDistance: 85.5, // TODO: Calculate from actual data when available
            },
        };
    }, [allOrdersData]);

    const handleAcceptOrder = async (orderId: number) => {
        try {
            const result = await acceptOrder(orderId).unwrap();
            console.log('✅ Order accepted successfully:', result);
            // Only refetch on success - RTK Query invalidation will handle cache updates
        } catch (error) {
            console.error('❌ Error accepting order:', {
                orderId,
                error,
            });

            // Don't refetch on error to keep orders visible
            // The order will remain in the list for retry
        }
    };

    // Gestion du démarrage de tournée
    const handleStartDeliveryRound = async (orders: OrderResponse[], startingAddress?: string) => {
        try {
            console.log('🚀 Démarrage de la tournée avec', orders.length, 'commandes');
            if (startingAddress) {
                console.log('📍 Point de départ:', startingAddress);
            }
            
            setActiveDeliveryRound({
                orders,
                optimizedOrder: [], // Sera mis à jour par Google Maps
                currentStep: 0,
                startingAddress,
            });
            
            setShowDeliveryRoundModal(false);
            setShowMapView(true); // Afficher la vue carte automatiquement
            
            console.log('✅ Tournée démarrée avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du démarrage de la tournée:', error);
        }
    };

    // Gestion de la route calculée
    const handleRouteCalculated = (route: google.maps.DirectionsResult) => {
        if (activeDeliveryRound) {
            const optimizedOrder = route.routes[0].waypoint_order || [];
            setActiveDeliveryRound({
                ...activeDeliveryRound,
                optimizedOrder,
            });
            console.log('🗺️ Route calculée, ordre optimisé:', optimizedOrder);
        }
    };

    // Gestion de la complétion d'une étape
    const handleStepComplete = async (orderId: number) => {
        try {
            // TODO: Appeler l'API pour marquer la commande comme livrée
            console.log('✅ Marquage de la commande comme livrée:', orderId);
            
            if (activeDeliveryRound) {
                setActiveDeliveryRound({
                    ...activeDeliveryRound,
                    currentStep: activeDeliveryRound.currentStep + 1,
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors de la complétion de l\'étape:', error);
        }
    };

    // Gestion du passage d'une étape
    const handleStepSkip = async (orderId: number, reason: string) => {
        try {
            // TODO: Appeler l'API pour marquer la commande comme annulée/reportée
            console.log('⏭️ Passage de la commande:', orderId, 'Raison:', reason);
            
            if (activeDeliveryRound) {
                setActiveDeliveryRound({
                    ...activeDeliveryRound,
                    currentStep: activeDeliveryRound.currentStep + 1,
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors du passage de l\'étape:', error);
        }
    };

    // Position par défaut si la géolocalisation n'est pas disponible
    const defaultPosition: Coordinates = {
        latitude: 48.8566,
        longitude: 2.3522,
    };

    return (
        <>
            <DashboardLayout title="Espace Livreur" description="Gestion de vos livraisons et tournées">
            <div className="space-y-6">
                {/* Delivery Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">Livraisons du Jour</div>
                                <div className="text-2xl font-bold text-gray-900">{deliveryStats.todayDeliveries}</div>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 7c0-1.1-.9-2-2-2h-3V3c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v2H5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1s1-.45 1-1V8h2v11c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8h2v1c0 .55.45 1 1 1s1-.45 1-1V7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">Terminées</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {deliveryStats.completedDeliveries}
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">En Attente</div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {deliveryStats.pendingDeliveries}
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">Distance (km)</div>
                                <div className="text-2xl font-bold text-gray-900">{deliveryStats.totalDistance}</div>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setShowAvailableOrders(true)}
                        className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Voir Commandes Disponibles
                    </button>

                    <button 
                        onClick={() => setShowDeliveryRoundModal(true)}
                        disabled={assignedOrders.length === 0}
                        className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        Commencer la Tournée ({assignedOrders.length})
                    </button>

                    <button
                        onClick={() => {
                            console.log('🗺️ Toggling map view from', showMapView, 'to', !showMapView);
                            console.log('📊 Current assigned orders:', assignedOrders.length);
                            console.log('👤 Delivery person ID:', deliveryPersonId);
                            setShowMapView(!showMapView);
                        }}
                        className={`flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                            showMapView
                                ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        {showMapView ? '📋 Vue Liste' : '🗺️ Carte Interactive'}
                    </button>

                    <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z" />
                        </svg>
                        Signaler un Problème
                    </button>
                </div>

                {/* Vue Carte Interactive - Masquée quand une tournée est active */}
                {showMapView && !activeDeliveryRound && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">🗺️ Carte Interactive</h3>
                            <div className="text-sm text-gray-500">
                                {assignedOrders.length} commande{assignedOrders.length !== 1 ? 's' : ''} assignée
                                {assignedOrders.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        <MapErrorBoundary>
                            <DeliveryPersonMap
                                deliveryPersonId={deliveryPersonId}
                                assignedOrders={assignedOrders}
                                height="600px"
                                className="w-full"
                                onStatusUpdate={(orderId, status) => {
                                    console.log(`Statut mis à jour pour la commande ${orderId}:`, status);
                                    // TODO: Synchroniser avec l'API pour mettre à jour le statut de la commande
                                }}
                            />
                        </MapErrorBoundary>
                    </div>
                )}

                {/* Vue Liste (par défaut) */}
                {!showMapView && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Assigned Deliveries */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Livraisons Assignées</h3>
                            </div>

                            <div className="p-6">
                                {isLoadingOrders ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="loading-spinner mx-auto mb-2"></div>
                                        Chargement des livraisons...
                                    </div>
                                ) : assignedOrders.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Aucune livraison assignée pour le moment
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assignedOrders.map((order) => {
                                            const formatPriority = (priority: string) => {
                                                switch (priority) {
                                                    case 'urgent':
                                                        return 'Urgente';
                                                    case 'high':
                                                        return 'Haute';
                                                    case 'normal':
                                                        return 'Normale';
                                                    case 'low':
                                                        return 'Basse';
                                                    default:
                                                        return priority;
                                                }
                                            };

                                            const formatStatus = (status: string) => {
                                                switch (status) {
                                                    case 'accepted':
                                                        return 'Acceptée';
                                                    case 'in_transit':
                                                        return 'En cours';
                                                    case 'delivered':
                                                        return 'Terminée';
                                                    default:
                                                        return status;
                                                }
                                            };

                                            const formatDateTime = (dateTime: string | Date) => {
                                                return new Date(dateTime).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                });
                                            };

                                            return (
                                                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            CMD-{order.id}
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    order.priority === OrderPriority.URGENT
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : order.priority === OrderPriority.HIGH
                                                                          ? 'bg-orange-100 text-orange-800'
                                                                          : order.priority === OrderPriority.NORMAL
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-green-100 text-green-800'
                                                                }`}
                                                            >
                                                                {formatPriority(order.priority)}
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    order.status === OrderStatus.IN_TRANSIT
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                            >
                                                                {formatStatus(order.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {order.customerName}
                                                    </div>
                                                    {order.customerPhone && (
                                                        <div className="text-sm text-gray-500 mb-2">
                                                            {order.customerPhone}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-500 mb-3">
                                                        {order.deliveryAddress}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-gray-500">
                                                            Livraison: {formatDateTime(order.scheduledDeliveryTime)}
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            {order.customerPhone && (
                                                                <a
                                                                    href={`tel:${order.customerPhone}`}
                                                                    className="text-blue-600 hover:text-blue-900 text-sm"
                                                                >
                                                                    Appeler
                                                                </a>
                                                            )}
                                                            <a
                                                                href={`https://maps.google.com/maps?q=${encodeURIComponent(order.deliveryAddress)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-green-600 hover:text-green-900 text-sm"
                                                            >
                                                                Naviguer
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {order.notes && (
                                                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                                            <strong>Notes:</strong> {order.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Completed Deliveries */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Livraisons Terminées</h3>
                            </div>

                            <div className="p-6">
                                {isLoadingOrders ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="loading-spinner mx-auto mb-2"></div>
                                        Chargement des livraisons terminées...
                                    </div>
                                ) : completedOrders.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Aucune livraison terminée pour le moment
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {completedOrders.map((order) => {
                                            const formatDateTime = (dateTime: string | Date) => {
                                                return new Date(dateTime).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                });
                                            };

                                            return (
                                                <div
                                                    key={order.id}
                                                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            CMD-{order.id}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {order.customerName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.deliveryAddress}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Terminé le {formatDateTime(order.updatedAt)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        {/* TODO: Add rating system when available */}
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg
                                                                key={i}
                                                                className="w-4 h-4 text-yellow-400"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Available Orders Modal */}
            {showAvailableOrders && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-500 bg-opacity-75"
                        onClick={() => setShowAvailableOrders(false)}
                    />
                    <div
                        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Commandes Disponibles</h3>
                                <button
                                    onClick={() => setShowAvailableOrders(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="loading-spinner mx-auto mb-2"></div>
                                        Chargement des commandes disponibles...
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8 text-red-500">
                                        Erreur lors du chargement des commandes
                                        <button
                                            onClick={() => refetch()}
                                            className="block mx-auto mt-2 text-blue-600 hover:text-blue-800"
                                        >
                                            Réessayer
                                        </button>
                                    </div>
                                ) : !availableOrdersData?.orders?.length ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Aucune commande disponible pour le moment
                                    </div>
                                ) : (
                                    availableOrdersData.orders.map((order) => {
                                        const formatPriority = (priority: string) => {
                                            switch (priority) {
                                                case 'urgent':
                                                    return 'Urgente';
                                                case 'high':
                                                    return 'Haute';
                                                case 'normal':
                                                    return 'Normale';
                                                case 'low':
                                                    return 'Basse';
                                                default:
                                                    return priority;
                                            }
                                        };

                                        const formatDateTime = (dateTime: string | Date) => {
                                            return new Date(dateTime).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            });
                                        };

                                        return (
                                            <div
                                                key={order.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            CMD-{order.id}
                                                        </div>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                order.priority === 'urgent'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : order.priority === 'high'
                                                                      ? 'bg-orange-100 text-orange-800'
                                                                      : order.priority === 'normal'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {formatPriority(order.priority)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Livraison: {formatDateTime(order.scheduledDeliveryTime)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 mb-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-700">Client</div>
                                                        <div className="text-sm text-gray-600">
                                                            {order.customerName}
                                                        </div>
                                                        {order.customerPhone && (
                                                            <div className="text-sm text-gray-500">
                                                                {order.customerPhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="text-sm font-medium text-gray-700">
                                                        Adresse de livraison
                                                    </div>
                                                    <div className="text-sm text-gray-600">{order.deliveryAddress}</div>
                                                </div>

                                                {order.notes && (
                                                    <div className="mb-3">
                                                        <div className="text-sm font-medium text-gray-700">Notes</div>
                                                        <div className="text-sm text-gray-600">{order.notes}</div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-500">
                                                        {order.estimatedDeliveryDuration
                                                            ? `Durée estimée: ${order.estimatedDeliveryDuration} min`
                                                            : 'Durée non estimée'}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAcceptOrder(order.id)}
                                                            disabled={isAccepting}
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 mr-1"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                            </svg>
                                                            {isAccepting ? 'Acceptation...' : 'Accepter'}
                                                        </button>
                                                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                                            <svg
                                                                className="w-4 h-4 mr-1"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                            </svg>
                                                            Localiser
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                onClick={() => setShowAvailableOrders(false)}
                                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de démarrage de tournée */}
            <StartDeliveryRoundModal
                isOpen={showDeliveryRoundModal}
                onClose={() => setShowDeliveryRoundModal(false)}
                orders={assignedOrders}
                onStartDelivery={handleStartDeliveryRound}
            />

        </DashboardLayout>

        {/* Vue Tournée Active avec Route Optimisée - OVERLAY PLEIN ÉCRAN */}
        {activeDeliveryRound && (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
                {/* En-tête de la tournée active */}
                <div className="bg-green-600 text-white p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">🚚 Tournée en cours</h2>
                                <p className="text-sm text-green-100">
                                    {activeDeliveryRound.orders.length} livraisons • Étape {activeDeliveryRound.currentStep + 1} sur {activeDeliveryRound.orders.length}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setActiveDeliveryRound(null)}
                                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded hover:bg-opacity-30"
                            >
                                🏁 Terminer la tournée
                            </button>
                            <button
                                onClick={() => setActiveDeliveryRound(null)}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth={2} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenu principal de la tournée */}
                <div className="flex flex-col lg:flex-row flex-1 min-h-0">
                    {/* Carte avec trajet optimisé */}
                    <div className="flex-1 min-w-0 overflow-hidden h-1/2 lg:h-full">
                        <LeafletRouteMap
                            orders={activeDeliveryRound.orders}
                            currentPosition={currentPosition || defaultPosition}
                            startingAddress={activeDeliveryRound.startingAddress}
                            onRouteCalculated={handleRouteCalculated}
                            height="100%"
                            className="h-full rounded-none border-0"
                        />
                    </div>

                    {/* Panel de navigation */}
                    <div className="h-1/2 lg:h-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white overflow-y-auto">
                        <DeliveryStepsList
                            orders={activeDeliveryRound.orders}
                            optimizedOrder={activeDeliveryRound.optimizedOrder}
                            currentStep={activeDeliveryRound.currentStep}
                            onStepComplete={handleStepComplete}
                            onStepSkip={handleStepSkip}
                        />
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
