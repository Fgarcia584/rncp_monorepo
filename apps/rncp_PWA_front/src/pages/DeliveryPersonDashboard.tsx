import { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useGetAvailableOrdersQuery, useAcceptOrderMutation, useGetOrdersQuery } from '../store/api/orderApi';
import { OrderStatus, OrderPriority } from '@rncp/types';

export function DeliveryPersonDashboard() {
    const [showAvailableOrders, setShowAvailableOrders] = useState(false);
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
        const assigned = allOrders.filter(
            (order) => order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.IN_TRANSIT,
        );

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

    // Mock available orders for pickup
    // const availableOrders = [
    //     {
    //         id: 'CMD-101',
    //         customerName: 'Marie Dupont',
    //         deliveryAddress: '25 Rue de Rivoli, Paris 1er',
    //         scheduledDeliveryTime: '16:30',
    //         priority: 'Haute',
    //         estimatedDuration: '20 min',
    //         merchant: 'Boulangerie du Coin',
    //     },
    //     {
    //         id: 'CMD-102',
    //         customerName: 'Jean Leroy',
    //         deliveryAddress: '8 Avenue Montaigne, Paris 8e',
    //         scheduledDeliveryTime: '17:00',
    //         priority: 'Normale',
    //         estimatedDuration: '25 min',
    //         merchant: 'Pharmacie Central',
    //     },
    //     {
    //         id: 'CMD-103',
    //         customerName: 'Sophie Martin',
    //         deliveryAddress: '15 Boulevard Saint-Michel, Paris 5e',
    //         scheduledDeliveryTime: '17:30',
    //         priority: 'Urgente',
    //         estimatedDuration: '30 min',
    //         merchant: 'Épicerie Bio+',
    //     },
    //     {
    //         id: 'CMD-104',
    //         customerName: 'Paul Durand',
    //         deliveryAddress: '42 Rue de la République, Paris 11e',
    //         scheduledDeliveryTime: '18:00',
    //         priority: 'Basse',
    //         estimatedDuration: '15 min',
    //         merchant: 'Librairie Moderne',
    //     },
    // ];

    const handleAcceptOrder = async (orderId: number) => {
        try {
            await acceptOrder(orderId).unwrap();
            alert(`Commande ${orderId} acceptée !`);
            // Refetch available orders to update the list
            refetch();
        } catch (error) {
            console.error('Error accepting order:', error);
            alert("Erreur lors de l'acceptation de la commande");
        }
    };

    return (
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

                    <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        Commencer la Tournée
                    </button>

                    <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        Voir l&apos;Itinéraire
                    </button>

                    <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z" />
                        </svg>
                        Signaler un Problème
                    </button>
                </div>

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
                                                <div className="text-sm text-gray-600 mb-2">{order.customerName}</div>
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
                                                    <div className="text-sm text-gray-600">{order.customerName}</div>
                                                    <div className="text-sm text-gray-500">{order.deliveryAddress}</div>
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
            </div>

            {/* Available Orders Modal */}
            {showAvailableOrders && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        </DashboardLayout>
    );
}
