import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Détection iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Détection si l'app est déjà installée (mode standalone)
        const standalone = window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone 
            || document.referrer.includes('android-app://');
        setIsStandalone(standalone);

        // Écouter l'événement beforeinstallprompt pour Android/Desktop
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Pour iOS, montrer le prompt manuellement si pas encore installé
        if (iOS && !standalone) {
            setShowInstallPrompt(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowInstallPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Sauvegarder la préférence dans localStorage
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Ne pas afficher si déjà installé ou si l'utilisateur a déjà refusé
    if (isStandalone || !showInstallPrompt) {
        return null;
    }

    // Vérifier si l'utilisateur a déjà refusé
    if (localStorage.getItem('pwa-install-dismissed')) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mx-auto">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7c0-1.1-.9-2-2-2h-3V3c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v2H5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1s1-.45 1-1V8h2v11c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8h2v1c0 .55.45 1 1 1s1-.45 1-1V7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                            Installer l'application
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {isIOS 
                                ? 'Ajoutez cette app à votre écran d\'accueil pour un accès rapide'
                                : 'Installez cette app pour un accès rapide et une meilleure expérience'
                            }
                        </p>
                        
                        {isIOS && (
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                                <p className="flex items-center mb-1">
                                    <span className="mr-2">1.</span>
                                    Appuyez sur 
                                    <svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7 14l5-5 5 5z"/>
                                    </svg>
                                    en bas de l'écran
                                </p>
                                <p className="flex items-center">
                                    <span className="mr-2">2.</span>
                                    Sélectionnez "Ajouter à l'écran d'accueil"
                                </p>
                            </div>
                        )}
                        
                        <div className="flex space-x-2 mt-3">
                            {!isIOS && (
                                <button
                                    onClick={handleInstallClick}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Installer
                                </button>
                            )}
                            <button
                                onClick={handleDismiss}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                {isIOS ? 'Compris' : 'Plus tard'}
                            </button>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}