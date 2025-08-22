import React, { useEffect } from 'react';
import { Order } from '../../types';

interface OrderListModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    onOrderSelect: (order: Order) => void;
}

export const OrderListModal: React.FC<OrderListModalProps> = ({ isOpen, onClose, orders, onOrderSelect }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOrderClick = (order: Order) => {
        onOrderSelect(order);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Commandes assignées ({orders.length})</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Fermer"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <svg
                                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
                                />
                            </svg>
                            <p>Aucune commande assignée</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <button
                                key={order.id}
                                onClick={() => handleOrderClick(order)}
                                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            #{order.id} - {order.customerName}
                                        </p>
                                        <p className="text-sm text-gray-600 truncate">{order.deliveryAddress}</p>
                                        {order.notes && (
                                            <p className="text-xs text-gray-500 mt-1 truncate">📝 {order.notes}</p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4 flex-shrink-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(order.scheduledDeliveryTime).toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
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
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};
