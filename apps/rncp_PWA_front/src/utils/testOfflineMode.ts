// Utilitaire pour tester le mode hors ligne

export const simulateOfflineMode = () => {
    // Forcer le navigateur en mode hors ligne
    if ('serviceWorker' in navigator) {
        console.log('📱 Simulation du mode hors ligne...');
        
        // Définir navigator.onLine à false (simulation)
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false,
        });

        // Émettre l'événement offline
        window.dispatchEvent(new Event('offline'));
        
        console.log('✅ Mode hors ligne simulé');
        return true;
    }
    
    console.warn('⚠️ ServiceWorker non supporté');
    return false;
};

export const simulateOnlineMode = () => {
    console.log('🌐 Simulation du mode en ligne...');
    
    // Rétablir navigator.onLine à true
    Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
    });

    // Émettre l'événement online
    window.dispatchEvent(new Event('online'));
    
    console.log('✅ Mode en ligne simulé');
    return true;
};

// Ajouter au window global pour les tests
declare global {
    interface Window {
        testOffline: () => boolean;
        testOnline: () => boolean;
    }
}

window.testOffline = simulateOfflineMode;
window.testOnline = simulateOnlineMode;