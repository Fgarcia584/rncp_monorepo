import { DashboardLayout } from '../components/layouts/DashboardLayout';

export function DeliveryPersonDashboard() {
    // Mock data for demonstration
    const deliveryStats = {
        todayDeliveries: 12,
        completedDeliveries: 8,
        pendingDeliveries: 4,
        totalDistance: 85.5,
    };

    const assignedDeliveries = [
        {
            id: 'LIV-001',
            address: '15 Rue de la Paix, Paris',
            customer: 'Marie Dubois',
            status: 'En cours',
            priority: 'Haute',
            estimatedTime: '15 min',
        },
        {
            id: 'LIV-002',
            address: '42 Avenue des Champs, Paris',
            customer: 'Jean Martin',
            status: 'Planifiée',
            priority: 'Normale',
            estimatedTime: '30 min',
        },
        {
            id: 'LIV-003',
            address: '8 Boulevard Saint-Germain, Paris',
            customer: 'Claire Rousseau',
            status: 'Planifiée',
            priority: 'Basse',
            estimatedTime: '45 min',
        },
    ];

    const completedDeliveries = [
        { id: 'LIV-004', customer: 'Pierre Durand', completedAt: '14:30', rating: 5 },
        { id: 'LIV-005', customer: 'Sophie Moreau', completedAt: '13:45', rating: 4 },
        { id: 'LIV-006', customer: 'Lucas Bernard', completedAt: '12:15', rating: 5 },
    ];

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div className="space-y-4">
                                {assignedDeliveries.map((delivery) => (
                                    <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-sm font-medium text-gray-900">{delivery.id}</div>
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        delivery.priority === 'Haute'
                                                            ? 'bg-red-100 text-red-800'
                                                            : delivery.priority === 'Normale'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-green-100 text-green-800'
                                                    }`}
                                                >
                                                    {delivery.priority}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        delivery.status === 'En cours'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {delivery.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">{delivery.customer}</div>
                                        <div className="text-sm text-gray-500 mb-3">{delivery.address}</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-500">ETA: {delivery.estimatedTime}</div>
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900 text-sm">
                                                    Appeler
                                                </button>
                                                <button className="text-green-600 hover:text-green-900 text-sm">
                                                    Naviguer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Completed Deliveries */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Livraisons Terminées</h3>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {completedDeliveries.map((delivery) => (
                                    <div
                                        key={delivery.id}
                                        className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">{delivery.id}</div>
                                            <div className="text-sm text-gray-600">{delivery.customer}</div>
                                            <div className="text-sm text-gray-500">
                                                Terminé à {delivery.completedAt}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {[...Array(delivery.rating)].map((_, i) => (
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
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
