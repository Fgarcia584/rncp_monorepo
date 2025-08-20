import { useState } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { useCreateOrderMutation, useGetOrdersQuery } from '../store/api/orderApi';
import { MerchantTrackingMap } from '../components/map';
import { OrderPriority, Coordinates } from '@rncp/types';

export function MerchantDashboard() {
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [showTrackingMap, setShowTrackingMap] = useState(false);
    const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

    // ID du commerçant (à récupérer de l'état d'authentification)
    const merchantId = 1; // TODO: Récupérer depuis le state auth

    // Position du commerce (à configurer dans les paramètres du commerçant)
    const merchantLocation: Coordinates = {
        latitude: 48.8566,
        longitude: 2.3522,
    }; // TODO: Récupérer depuis les paramètres du commerçant

    // Récupérer les commandes du commerçant
    const { data: ordersData } = useGetOrdersQuery({
        merchantId,
        limit: 100,
    });
    const [orderForm, setOrderForm] = useState({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        scheduledDeliveryTime: '',
        priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
        notes: '',
        estimatedDeliveryDuration: '',
    });

    // Mock data for demonstration
    const businessStats = {
        todayOrders: 24,
        todayRevenue: 1845,
        pendingOrders: 8,
        completedOrders: 16,
    };

    const recentOrders = [
        { id: 'CMD-001', customer: 'Marie Dubois', amount: 125.5, status: 'Préparation', time: '14:30' },
        { id: 'CMD-002', customer: 'Jean Martin', amount: 87.2, status: 'Expédiée', time: '13:45' },
        { id: 'CMD-003', customer: 'Claire Rousseau', amount: 234.8, status: 'En attente', time: '12:15' },
        { id: 'CMD-004', customer: 'Pierre Durand', amount: 156.3, status: 'Livrée', time: '11:30' },
    ];

    const topProducts = [
        { name: 'Produit A', sales: 45, revenue: 675 },
        { name: 'Produit B', sales: 32, revenue: 540 },
        { name: 'Produit C', sales: 28, revenue: 420 },
        { name: 'Produit D', sales: 22, revenue: 330 },
    ];

    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const orderData = {
                customerName: orderForm.customerName,
                customerPhone: orderForm.customerPhone || undefined,
                deliveryAddress: orderForm.deliveryAddress,
                scheduledDeliveryTime: new Date(orderForm.scheduledDeliveryTime),
                priority: orderForm.priority as OrderPriority,
                notes: orderForm.notes || undefined,
                estimatedDeliveryDuration: orderForm.estimatedDeliveryDuration
                    ? parseInt(orderForm.estimatedDeliveryDuration)
                    : undefined,
            };

            await createOrder(orderData).unwrap();

            // Reset form and close modal
            setOrderForm({
                customerName: '',
                customerPhone: '',
                deliveryAddress: '',
                scheduledDeliveryTime: '',
                priority: 'normal',
                notes: '',
                estimatedDeliveryDuration: '',
            });
            setShowOrderForm(false);

            // Show success message
            alert('Commande créée avec succès !');
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Erreur lors de la création de la commande');
        }
    };

    const handleFormChange = (field: string, value: string) => {
        setOrderForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <DashboardLayout title="Espace Commerçant" description="Gestion de votre boutique et de vos ventes">
            <div className="space-y-6">
                {/* Business KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">Commandes Aujourd&apos;hui</div>
                                <div className="text-2xl font-bold text-gray-900">{businessStats.todayOrders}</div>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 4V2c0-.55.45-1 1-1s1 .45 1 1v2h6V2c0-.55.45-1 1-1s1 .45 1 1v2h1c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">Chiffre d&apos;Affaires</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {businessStats.todayRevenue.toFixed(2)}€
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-500">En Attente</div>
                                <div className="text-2xl font-bold text-orange-600">{businessStats.pendingOrders}</div>
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
                                <div className="text-sm font-medium text-gray-500">Terminées</div>
                                <div className="text-2xl font-bold text-gray-900">{businessStats.completedOrders}</div>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setShowOrderForm(true)}
                        className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Nouvelle Livraison
                    </button>

                    <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Nouveau Produit
                    </button>

                    <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        Gérer l&apos;Inventaire
                    </button>

                    <button
                        onClick={() => setShowTrackingMap(!showTrackingMap)}
                        className={`flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                            showTrackingMap
                                ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                                : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        {showTrackingMap ? '📋 Vue Standard' : '🚚 Tracking Livraisons'}
                    </button>
                </div>

                {/* Vue Tracking des Livraisons */}
                {showTrackingMap && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">🚚 Tracking des Livraisons</h3>
                            <div className="text-sm text-gray-500">Suivi temps réel de vos commandes</div>
                        </div>

                        <MerchantTrackingMap
                            orders={ordersData?.orders || []}
                            merchantLocation={merchantLocation}
                            height="500px"
                            className="w-full"
                            onDeliveryUpdate={(orderId, tracking) => {
                                console.log(`Mise à jour livraison ${orderId}:`, tracking);
                                // TODO: Synchroniser avec l'état local ou afficher des notifications
                            }}
                        />
                    </div>
                )}

                {/* Vue Standard (par défaut) */}
                {!showTrackingMap && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Orders */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Commandes Récentes</h3>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                                                    <div className="text-sm text-gray-500">{order.time}</div>
                                                </div>
                                                <div className="text-sm text-gray-600">{order.customer}</div>
                                                <div className="text-sm font-medium text-green-600">
                                                    {order.amount.toFixed(2)}€
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        order.status === 'Livrée'
                                                            ? 'bg-green-100 text-green-800'
                                                            : order.status === 'Expédiée'
                                                              ? 'bg-blue-100 text-blue-800'
                                                              : order.status === 'Préparation'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Produits les Plus Vendus</h3>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {topProducts.map((product, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.sales} ventes</div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{product.revenue}€</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Creation Modal */}
            {showOrderForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        onClick={() => setShowOrderForm(false)}
                    ></div>

                    {/* Modal Content */}
                    <div
                        className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={handleOrderSubmit}>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Nouvelle Commande à Livrer
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nom du client *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={orderForm.customerName}
                                                onChange={(e) => handleFormChange('customerName', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Téléphone du client
                                            </label>
                                            <input
                                                type="tel"
                                                value={orderForm.customerPhone}
                                                onChange={(e) => handleFormChange('customerPhone', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Adresse de livraison *
                                            </label>
                                            <textarea
                                                required
                                                value={orderForm.deliveryAddress}
                                                onChange={(e) => handleFormChange('deliveryAddress', e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Heure de livraison souhaitée *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                required
                                                value={orderForm.scheduledDeliveryTime}
                                                onChange={(e) =>
                                                    handleFormChange('scheduledDeliveryTime', e.target.value)
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Priorité</label>
                                            <select
                                                value={orderForm.priority}
                                                onChange={(e) => handleFormChange('priority', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="low">Basse</option>
                                                <option value="normal">Normale</option>
                                                <option value="high">Haute</option>
                                                <option value="urgent">Urgente</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Durée estimée (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={orderForm.estimatedDeliveryDuration}
                                                onChange={(e) =>
                                                    handleFormChange('estimatedDeliveryDuration', e.target.value)
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Notes (optionnel)
                                            </label>
                                            <textarea
                                                value={orderForm.notes}
                                                onChange={(e) => handleFormChange('notes', e.target.value)}
                                                rows={2}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? 'Création...' : 'Créer la commande'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowOrderForm(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
