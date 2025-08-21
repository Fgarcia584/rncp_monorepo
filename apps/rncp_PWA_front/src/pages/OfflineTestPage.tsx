import React, { useState } from 'react';
import { LeafletRouteMap } from '../components/delivery/LeafletRouteMap';
import { DeliveryStepsList } from '../components/delivery/DeliveryStepsList';
import { StartDeliveryRoundModal } from '../components/delivery/StartDeliveryRoundModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OrderResponse, OrderStatus, OrderPriority } from '@rncp/types';

// Données de test pour la démonstration
const testOrders: OrderResponse[] = [
    {
        id: 1001,
        orderNumber: 'DEMO001',
        customerName: 'Client Test 1',
        customerPhone: '0123456789',
        deliveryAddress: '1 Rue de Rivoli, 75001 Paris',
        status: OrderStatus.ACCEPTED,
        priority: OrderPriority.NORMAL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledDeliveryTime: new Date(Date.now() + 3600000),
        distanceKm: 5.2,
        estimatedDeliveryDuration: 25,
    },
    {
        id: 1002,
        orderNumber: 'DEMO002',
        customerName: 'Client Test 2',
        customerPhone: '0987654321',
        deliveryAddress: '75 Avenue des Champs-Élysées, 75008 Paris',
        status: OrderStatus.ACCEPTED,
        priority: OrderPriority.HIGH,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledDeliveryTime: new Date(Date.now() + 5400000),
        distanceKm: 8.7,
        estimatedDeliveryDuration: 35,
    },
    {
        id: 1003,
        orderNumber: 'DEMO003',
        customerName: 'Client Test 3',
        customerPhone: '0147258369',
        deliveryAddress: '20 Avenue de l\'Opéra, 75001 Paris',
        status: OrderStatus.ACCEPTED,
        priority: OrderPriority.URGENT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledDeliveryTime: new Date(Date.now() + 7200000),
        distanceKm: 3.4,
        estimatedDeliveryDuration: 20,
    },
];

export function OfflineTestPage() {
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [activeDeliveryRound, setActiveDeliveryRound] = useState<{
        orders: OrderResponse[];
        optimizedOrder: number[];
        currentStep: number;
        startingAddress?: string;
    } | null>(null);
    
    const { isOnline, isRecentlyBack, getOfflineDuration, getOnlineDuration } = useOnlineStatus();

    const handleStartDelivery = (orders: OrderResponse[], startingAddress?: string) => {
        setActiveDeliveryRound({
            orders,
            optimizedOrder: [0, 1, 2], // Ordre simple pour la démo
            currentStep: 0,
            startingAddress,
        });
        setShowDeliveryModal(false);
    };

    const handleRouteCalculated = (route: google.maps.DirectionsResult) => {
        console.log('🗺️ Route calculée pour la démo:', route);
    };

    const currentPosition = {
        latitude: 48.8566,
        longitude: 2.3522,
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header avec statut de connectivité */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                🧪 Page de Test Mode Hors Ligne
                            </h1>
                            <p className="text-sm text-gray-600">
                                Démonstration du mode dégradé gracieux
                            </p>
                        </div>
                        
                        {/* Indicateur de connectivité */}
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                            isOnline 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            <div className={`w-3 h-3 rounded-full ${
                                isOnline 
                                    ? 'bg-green-500' 
                                    : 'bg-blue-500 animate-pulse'
                            }`}></div>
                            <span className="text-sm font-medium">
                                {isOnline ? '🌐 En ligne' : '📱 Mode GPS'}
                            </span>
                            {isRecentlyBack && (
                                <span className="text-xs text-orange-600">(reconnecté)</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contrôles de simulation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">🎛️ Contrôles de Simulation</h2>
                    <div className="flex space-x-4 items-center">
                        <button
                            onClick={() => {
                                (window as any).testOffline?.();
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            📱 Simuler Hors Ligne
                        </button>
                        <button
                            onClick={() => {
                                (window as any).testOnline?.();
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            🌐 Simuler En Ligne
                        </button>
                        <div className="text-sm text-gray-600">
                            État actuel: <strong>{isOnline ? 'En ligne' : 'Hors ligne'}</strong>
                            {!isOnline && ` (depuis ${Math.round(getOfflineDuration() / 1000)}s)`}
                            {isOnline && ` (depuis ${Math.round(getOnlineDuration() / 1000)}s)`}
                        </div>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowDeliveryModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        🚚 Démarrer une Tournée de Test ({testOrders.length} livraisons)
                    </button>
                </div>

                {/* Interface de livraison */}
                {activeDeliveryRound ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Carte */}
                        <div className="lg:col-span-1">
                            <LeafletRouteMap
                                orders={activeDeliveryRound.orders}
                                currentPosition={currentPosition}
                                startingAddress={activeDeliveryRound.startingAddress}
                                onRouteCalculated={handleRouteCalculated}
                                height="600px"
                            />
                        </div>
                        
                        {/* Liste des étapes */}
                        <div className="lg:col-span-1">
                            <DeliveryStepsList
                                orders={activeDeliveryRound.orders}
                                optimizedOrder={activeDeliveryRound.optimizedOrder}
                                currentStep={activeDeliveryRound.currentStep}
                                onStepComplete={(orderId) => {
                                    console.log('✅ Étape complétée:', orderId);
                                }}
                                onStepSkip={(orderId, reason) => {
                                    console.log('⏭️ Étape passée:', orderId, reason);
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="text-6xl mb-4">🚚</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Aucune tournée active
                        </h3>
                        <p className="text-gray-600">
                            Cliquez sur "Démarrer une Tournée de Test" pour voir l'interface en action
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de démarrage */}
            <StartDeliveryRoundModal
                isOpen={showDeliveryModal}
                onClose={() => setShowDeliveryModal(false)}
                orders={testOrders}
                onStartDelivery={handleStartDelivery}
            />
        </div>
    );
}