import React, { useState } from 'react';
import { OrderResponse, OrderStatus } from '@rncp/types';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface DeliveryStepsListProps {
    orders: OrderResponse[];
    optimizedOrder?: number[];
    currentStep?: number;
    onStepComplete?: (orderId: number) => void;
    onStepSkip?: (orderId: number, reason: string) => void;
}

export const DeliveryStepsList: React.FC<DeliveryStepsListProps> = ({
    orders,
    optimizedOrder = [],
    currentStep = 0,
    onStepComplete,
    onStepSkip,
}) => {
    const [expandedStep, setExpandedStep] = useState<number | null>(currentStep);
    const [skipReason, setSkipReason] = useState<string>('');
    const [showSkipModal, setShowSkipModal] = useState<number | null>(null);
    const { isOnline } = useOnlineStatus();

    // Réorganiser les commandes selon l'ordre optimisé
    const orderedOrders = optimizedOrder.length > 0 
        ? optimizedOrder.map(index => orders[index]).filter(Boolean)
        : orders;

    const getStepStatus = (index: number, order: OrderResponse) => {
        if (order.status === OrderStatus.DELIVERED) return 'completed';
        if (order.status === OrderStatus.CANCELLED) return 'skipped';
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'pending';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                    </div>
                );
            case 'current':
                return (
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                    </div>
                );
            case 'skipped':
                return (
                    <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{orderedOrders.findIndex(o => o.id === orderedOrders.find((_, i) => i === currentStep)?.id) + 1}</span>
                    </div>
                );
        }
    };

    const handleCompleteStep = (order: OrderResponse) => {
        if (onStepComplete) {
            onStepComplete(order.id);
        }
    };

    const handleSkipStep = (order: OrderResponse) => {
        setShowSkipModal(order.id);
    };

    const confirmSkip = (orderId: number) => {
        if (onStepSkip && skipReason.trim()) {
            onStepSkip(orderId, skipReason);
            setShowSkipModal(null);
            setSkipReason('');
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openNativeNavigation = (address: string) => {
        const encodedAddress = encodeURIComponent(address);
        const googleMapsUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
        window.open(googleMapsUrl, '_blank');
    };

    const callCustomer = (phone: string) => {
        window.open(`tel:${phone}`, '_self');
    };

    if (orderedOrders.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>Aucune livraison prévue</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                    📋 Étapes de livraison ({orderedOrders.length})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    {isOnline 
                        ? `Ordre optimisé par Google Maps • Étape ${currentStep + 1} sur ${orderedOrders.length}`
                        : `Mode GPS • Étape ${currentStep + 1} sur ${orderedOrders.length} • Navigation native disponible`
                    }
                </p>
            </div>

            <div className="divide-y divide-gray-200">
                {orderedOrders.map((order, index) => {
                    const status = getStepStatus(index, order);
                    const isExpanded = expandedStep === index;
                    const isCurrent = status === 'current';

                    return (
                        <div key={order.id} className={`p-4 ${isCurrent ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start space-x-4">
                                {/* Icône de statut */}
                                <div className="flex-shrink-0 mt-1">
                                    {getStatusIcon(status)}
                                </div>

                                {/* Contenu de l'étape */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-medium ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                                                Étape {index + 1} • {order.customerName}
                                            </h4>
                                            <p className="text-sm text-gray-600 truncate">
                                                {order.deliveryAddress}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    🕒 {order.scheduledDeliveryTime ? formatTime(order.scheduledDeliveryTime.toString()) : 'Non défini'}
                                                </span>
                                                {order.priority === 'urgent' && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        🔥 Urgent
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setExpandedStep(isExpanded ? null : index)}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <svg
                                                    className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M7 10l5 5 5-5z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Détails étendus */}
                                    {isExpanded && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            {order.notes && (
                                                <div className="mb-3">
                                                    <span className="text-xs font-medium text-gray-700">Notes:</span>
                                                    <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                                                </div>
                                            )}

                                            {/* Actions de contact et navigation */}
                                            <div className="mb-3">
                                                <div className="flex space-x-2">
                                                    {order.customerPhone && (
                                                        <button
                                                            onClick={() => callCustomer(order.customerPhone!)}
                                                            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            📞 Appeler
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openNativeNavigation(order.deliveryAddress)}
                                                        className={`flex items-center px-3 py-2 text-sm font-medium rounded focus:outline-none focus:ring-2 ${
                                                            isOnline 
                                                                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                                                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                                        }`}
                                                        title={isOnline ? "Ouvrir dans Google Maps" : "Ouvrir dans l'app de navigation native"}
                                                    >
                                                        {isOnline ? '🗺️ Google Maps' : '🧭 Navigation GPS'}
                                                    </button>
                                                </div>
                                                {!isOnline && (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        * Ouverture dans l'application de navigation de votre appareil
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions pour l'étape courante */}
                                            {isCurrent && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleCompleteStep(order)}
                                                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    >
                                                        ✅ Marquer comme livrée
                                                    </button>
                                                    <button
                                                        onClick={() => handleSkipStep(order)}
                                                        className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                                    >
                                                        ⏭️ Passer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de confirmation pour passer une étape */}
            {showSkipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowSkipModal(null)} />
                    <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Passer cette livraison</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Pourquoi souhaitez-vous passer cette livraison ?
                        </p>
                        <textarea
                            value={skipReason}
                            onChange={(e) => setSkipReason(e.target.value)}
                            placeholder="Ex: Client absent, adresse introuvable, etc."
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                            rows={3}
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowSkipModal(null)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => showSkipModal && confirmSkip(showSkipModal)}
                                disabled={!skipReason.trim()}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};