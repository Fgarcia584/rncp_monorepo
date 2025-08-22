import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRouting } from './components/routing/RoleBasedRouting';
import { SentryTestComponent } from './components/debug/SentryTestComponent';
const getRoleDisplayName = (role: string): string => {
    switch (role) {
        case 'admin':
            return 'Administrateur';
        case 'logistics_technician':
            return 'Technicien Logistique';
        case 'merchant':
            return 'Commerçant';
        case 'delivery_person':
            return 'Livreur';
        default:
            return 'Utilisateur';
    }
};
import PWABadge from './PWABadge.tsx';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SimplePWAInstall } from './components/SimplePWAInstall';

function App() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center space-x-3">
                    <div className="loading-spinner"></div>
                    <span className="text-lg text-gray-600">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-primary-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-white">RNCP PWA Application</h1>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-white text-sm">
                                        <div className="font-medium">Bonjour, {user?.name}</div>
                                        <div className="text-xs opacity-90">
                                            {user?.role && getRoleDisplayName(user.role)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            >
                                Se connecter
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {isAuthenticated ? (
                    <ProtectedRoute>
                        <RoleBasedRouting />
                    </ProtectedRoute>
                ) : (
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Hero Section */}
                        <div className="max-w-4xl mx-auto text-center py-12 sm:py-16">
                            <div className="mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
                                    <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 7c0-1.1-.9-2-2-2h-3V3c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v2H5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1s1-.45 1-1V8h2v11c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8h2v1c0 .55.45 1 1 1s1-.45 1-1V7z" />
                                    </svg>
                                </div>
                                <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                    Plateforme de <br className="hidden sm:block" />
                                    <span className="text-primary-600">Livraison Intelligente</span>
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                    Une solution complète pour gérer vos commandes, optimiser vos livraisons et suivre
                                    vos performances en temps réel.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <button
                                            onClick={() => setIsAuthModalOpen(true)}
                                            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-8 py-4 rounded-lg text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Commencer maintenant
                                        </button>
                                        <SimplePWAInstall />
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        Application Web Progressive (PWA)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="max-w-6xl mx-auto py-16">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                    Fonctionnalités par profil
                                </h2>
                                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                    Chaque utilisateur dispose d&apos;un tableau de bord personnalisé selon son rôle
                                    dans la chaîne logistique
                                </p>
                            </div>

                            {/* User Profiles Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                                {/* Admin */}
                                <div className="feature-card text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Administrateur</h3>
                                    <p className="text-gray-600 text-sm mb-4">Gestion globale de la plateforme</p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Vue d&apos;ensemble des utilisateurs</li>
                                        <li>• Statistiques générales</li>
                                        <li>• Gestion des rôles</li>
                                    </ul>
                                </div>

                                {/* Merchant */}
                                <div className="feature-card text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7 4V2c0-.55.45-1 1-1s1 .45 1 1v2h6V2c0-.55.45-1 1-1s1 .45 1 1v2h1c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Commerçant</h3>
                                    <p className="text-gray-600 text-sm mb-4">Gestion de boutique et ventes</p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Création de commandes</li>
                                        <li>• Suivi du chiffre d&apos;affaires</li>
                                        <li>• Gestion de l&apos;inventaire</li>
                                    </ul>
                                </div>

                                {/* Delivery Person */}
                                <div className="feature-card text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Livreur</h3>
                                    <p className="text-gray-600 text-sm mb-4">Gestion des livraisons et tournées</p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Commandes disponibles</li>
                                        <li>• Navigation GPS</li>
                                        <li>• Suivi des performances</li>
                                    </ul>
                                </div>

                                {/* Logistics Technician */}
                                <div className="feature-card text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                        <svg
                                            className="w-8 h-8 text-purple-600"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4zm8 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM6 7h12v2H6V7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Technicien Logistique</h3>
                                    <p className="text-gray-600 text-sm mb-4">Optimisation des stocks et routes</p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Gestion des stocks</li>
                                        <li>• Planification des livraisons</li>
                                        <li>• Analyses et rapports</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-6">
                                        <svg
                                            className="w-7 h-7 text-primary-600"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Temps Réel</h3>
                                    <p className="text-gray-600">
                                        Suivi en direct des commandes, livraisons et performances avec des mises à jour
                                        instantanées
                                    </p>
                                </div>

                                <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-6">
                                        <svg
                                            className="w-7 h-7 text-emerald-600"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile First</h3>
                                    <p className="text-gray-600">
                                        Interface optimisée pour mobile avec support PWA pour une expérience native
                                    </p>
                                </div>

                                <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-full mb-6">
                                        <svg className="w-7 h-7 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Sécurisé</h3>
                                    <p className="text-gray-600">
                                        Authentification JWT robuste et gestion des rôles pour une sécurité optimale
                                    </p>
                                </div>
                            </div>

                            {/* Stats Section */}
                            <div className="bg-primary-600 rounded-2xl p-8 text-white">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold mb-2">Une plateforme performante</h3>
                                    <p className="text-primary-100">
                                        Optimisée pour gérer efficacement vos opérations logistiques
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                    <div>
                                        <div className="text-3xl font-bold mb-1">100%</div>
                                        <div className="text-primary-100 text-sm">Mobile Responsive</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold mb-1">24/7</div>
                                        <div className="text-primary-100 text-sm">Disponibilité</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold mb-1">4</div>
                                        <div className="text-primary-100 text-sm">Profils Utilisateurs</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold mb-1">PWA</div>
                                        <div className="text-primary-100 text-sm">Application Native</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            <PWABadge />
            <PWAInstallPrompt />

            {/* Development-only Sentry test component */}
            <SentryTestComponent />
        </div>
    );
}

export default App;
