import React, { useState } from 'react';
import { OrderResponse } from '@rncp/types';
import { AddressAutocomplete } from '../forms/AddressAutocomplete';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface StartDeliveryRoundModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: OrderResponse[];
    onStartDelivery: (orders: OrderResponse[], startingAddress?: string) => void;
}

export const StartDeliveryRoundModal: React.FC<StartDeliveryRoundModalProps> = ({
    isOpen,
    onClose,
    orders,
    onStartDelivery,
}) => {
    const [isStarting, setIsStarting] = useState(false);
    const [startingAddress, setStartingAddress] = useState('');
    const [isRequestingGeolocation, setIsRequestingGeolocation] = useState(false);
    const { position, loading: isGeoLoading, error: geoError, getCurrentPosition } = useGeolocation();
    const { isOnline } = useOnlineStatus();

    if (!isOpen) return null;

    const handleUseCurrentLocation = async () => {
        setIsRequestingGeolocation(true);
        try {
            await getCurrentPosition();
            // Effacer l'adresse saisie puisqu'on utilise la géolocalisation
            setStartingAddress('');
        } catch (error) {
            console.error('Erreur lors de la récupération de la position:', error);
        } finally {
            setIsRequestingGeolocation(false);
        }
    };

    const handleStartDelivery = async () => {
        setIsStarting(true);
        try {
            await onStartDelivery(orders, startingAddress || undefined);
        } finally {
            setIsStarting(false);
        }
    };

    const totalDistance = orders.reduce((sum, order) => sum + (order.distanceKm || 0), 0);
    const estimatedTime = orders.reduce((sum, order) => sum + (order.estimatedDeliveryDuration || 30), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">🚚 Commencer la tournée</h3>
                </div>

                <div className="px-6 py-4">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Vous êtes sur le point de commencer une tournée optimisée avec{' '}
                            <span className="font-semibold">{orders.length} livraisons</span>.
                        </p>

                        {/* Sélection du point de départ */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📍 Point de départ
                            </label>
                            
                            <div className="space-y-3">
                                {/* Bouton de géolocalisation */}
                                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 mr-3">
                                            {position ? (
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            ) : geoError ? (
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            ) : (
                                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                Ma position actuelle
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {position ? (
                                                    `Latitude: ${position.latitude.toFixed(4)}, Longitude: ${position.longitude.toFixed(4)}`
                                                ) : geoError ? (
                                                    `Erreur: ${geoError}`
                                                ) : (
                                                    'Position non définie'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isRequestingGeolocation || isGeoLoading}
                                        className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isRequestingGeolocation || isGeoLoading ? (
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                                Localisation...
                                            </div>
                                        ) : (
                                            '📍 Utiliser ma position'
                                        )}
                                    </button>
                                </div>

                                {/* Divider OU */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-xs text-gray-500">
                                        <span className="bg-white px-2">OU</span>
                                    </div>
                                </div>

                                {/* Saisie manuelle d'adresse */}
                                <div>
                                    <AddressAutocomplete
                                        value={startingAddress}
                                        onChange={(address) => setStartingAddress(address)}
                                        placeholder="Saisissez une adresse de départ..."
                                        className="mb-2"
                                    />
                                    <p className="text-xs text-gray-500">
                                        {isOnline 
                                            ? 'Saisissez une adresse spécifique ou utilisez votre position actuelle'
                                            : 'En mode GPS, votre position actuelle est recommandée'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">📊 Résumé de la tournée</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-700">Nombre de livraisons :</span>
                                    <div className="font-semibold">{orders.length}</div>
                                </div>
                                <div>
                                    <span className="text-blue-700">Temps estimé :</span>
                                    <div className="font-semibold">{Math.round(estimatedTime / 60)}h {estimatedTime % 60}min</div>
                                </div>
                                {totalDistance > 0 && (
                                    <>
                                        <div>
                                            <span className="text-blue-700">Distance totale :</span>
                                            <div className="font-semibold">{totalDistance.toFixed(1)} km</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">📍 Livraisons prévues</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {orders.map((order, index) => (
                                    <div key={order.id} className="flex items-center p-2 bg-gray-50 rounded">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.customerName}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {order.deliveryAddress}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(order.scheduledDeliveryTime).toLocaleTimeString('fr-FR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isOnline ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-amber-800">
                                            <strong>Important :</strong> Google Maps calculera automatiquement l&apos;itinéraire optimal.
                                            L&apos;ordre des livraisons pourrait être différent de celui affiché ci-dessus.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-800">
                                            <strong>Mode GPS :</strong> Connexion Internet indisponible. 
                                            Votre position GPS sera utilisée avec routes approximatives. 
                                            Navigation possible vers les apps natives (Google Maps, Waze).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isStarting}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleStartDelivery}
                        disabled={isStarting || orders.length === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isStarting ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Démarrage...
                            </div>
                        ) : (
                            <>
                                🚀 Commencer la tournée
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};