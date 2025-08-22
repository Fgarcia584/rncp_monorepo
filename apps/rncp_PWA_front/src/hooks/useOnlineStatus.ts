import { useState, useEffect } from 'react';

interface OnlineStatusState {
    isOnline: boolean;
    wasOffline: boolean;
    connectionType: 'wifi' | 'cellular' | 'unknown';
    lastOnlineTime: number | null;
    lastOfflineTime: number | null;
}

export const useOnlineStatus = () => {
    const [status, setStatus] = useState<OnlineStatusState>(() => ({
        isOnline: navigator.onLine,
        wasOffline: false,
        connectionType: 'unknown',
        lastOnlineTime: navigator.onLine ? Date.now() : null,
        lastOfflineTime: navigator.onLine ? null : Date.now(),
    }));

    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 Connexion Internet restaurée');
            setStatus(prev => ({
                ...prev,
                isOnline: true,
                wasOffline: true,
                lastOnlineTime: Date.now(),
            }));
        };

        const handleOffline = () => {
            console.log('📱 Mode hors ligne détecté - Passage en mode GPS');
            setStatus(prev => ({
                ...prev,
                isOnline: false,
                wasOffline: true,
                lastOfflineTime: Date.now(),
            }));
        };

        // Écouter les changements de connectivité
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Détection du type de connexion si disponible
        const updateConnectionType = () => {
            if ('connection' in navigator) {
                const connection = (navigator as any).connection;
                if (connection) {
                    const effectiveType = connection.effectiveType;
                    setStatus(prev => ({
                        ...prev,
                        connectionType: effectiveType === '4g' || effectiveType === '3g' ? 'cellular' : 'wifi'
                    }));
                }
            }
        };

        updateConnectionType();

        // Polling périodique pour vérifier la connectivité réelle
        const checkConnectivity = async () => {
            try {
                // Test avec un endpoint léger
                const response = await fetch('/favicon.ico', {
                    method: 'HEAD',
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(5000)
                });
                
                if (!status.isOnline && response.ok) {
                    handleOnline();
                }
            } catch (error) {
                if (status.isOnline) {
                    handleOffline();
                }
            }
        };

        // Vérifier la connectivité toutes les 30 secondes
        const connectivityInterval = setInterval(checkConnectivity, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(connectivityInterval);
        };
    }, [status.isOnline]);

    // Utilitaires pour l'interface
    const getOfflineDuration = () => {
        if (status.isOnline || !status.lastOfflineTime) return 0;
        return Date.now() - status.lastOfflineTime;
    };

    const getOnlineDuration = () => {
        if (!status.isOnline || !status.lastOnlineTime) return 0;
        return Date.now() - status.lastOnlineTime;
    };

    const isRecentlyBack = () => {
        if (!status.wasOffline || !status.isOnline || !status.lastOnlineTime) return false;
        return Date.now() - status.lastOnlineTime < 10000; // 10 secondes
    };

    return {
        isOnline: status.isOnline,
        wasOffline: status.wasOffline,
        connectionType: status.connectionType,
        lastOnlineTime: status.lastOnlineTime,
        lastOfflineTime: status.lastOfflineTime,
        getOfflineDuration,
        getOnlineDuration,
        isRecentlyBack: isRecentlyBack(),
    };
};