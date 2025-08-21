import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function SimplePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            console.log('beforeinstallprompt event captured');
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowButton(true);
        };

        // Vérifier si déjà installé
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            console.log('PWA already installed');
            return;
        }

        window.addEventListener('beforeinstallprompt', handler);

        // Fallback : forcer l'affichage pour debug après 3 secondes
        const timeout = setTimeout(() => {
            if (!showButton && process.env.NODE_ENV === 'development') {
                console.log('Fallback: showing install button for testing');
                setShowButton(true);
            }
        }, 3000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            clearTimeout(timeout);
        };
    }, [showButton]);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // Fallback pour navigateurs qui ne supportent pas beforeinstallprompt
            alert('Pour installer cette PWA:\n\n• Chrome/Edge: Menu ⋮ > "Installer l\'application"\n• Safari iOS: Partager > "Ajouter à l\'écran d\'accueil"');
            return;
        }

        try {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA installed successfully');
            }
            
            setDeferredPrompt(null);
            setShowButton(false);
        } catch (error) {
            console.error('Installation failed:', error);
        }
    };

    if (!showButton) {
        return null;
    }

    return (
        <button
            onClick={handleInstall}
            className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium text-sm rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Installer l'app
        </button>
    );
}