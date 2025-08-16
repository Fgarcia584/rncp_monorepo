import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGetUsersQuery } from './store/api/userApi';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import PWABadge from './PWABadge.tsx';

function App() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    const { data: users, isLoading: usersLoading } = useGetUsersQuery(undefined, {
        skip: !isAuthenticated,
    });

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
                                    <span className="text-white text-sm font-medium">Bonjour, {user?.name}</span>
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

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {isAuthenticated ? (
                    <ProtectedRoute>
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h2>
                                <p className="text-gray-600">Bienvenue dans votre espace personnel</p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        Vos informations
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 font-medium">Nom:</span>
                                            <span className="text-gray-900">{user?.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 font-medium">Email:</span>
                                            <span className="text-gray-900">{user?.email}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 font-medium">Membre depuis:</span>
                                            <span className="text-gray-900">
                                                {user?.createdAt &&
                                                    new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                        Utilisateurs
                                    </h3>
                                    {usersLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex items-center space-x-3">
                                                <div className="loading-spinner"></div>
                                                <span className="text-gray-600">Chargement des utilisateurs...</span>
                                            </div>
                                        </div>
                                    ) : users && users.length > 0 ? (
                                        <div className="space-y-3">
                                            {users.map((userData) => (
                                                <div
                                                    key={userData.id}
                                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                        <span className="text-primary-700 text-sm font-semibold">
                                                            {userData.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {userData.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {userData.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 mb-2">
                                                <svg
                                                    className="mx-auto h-12 w-12"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-gray-600">Aucun utilisateur trouvé</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ProtectedRoute>
                ) : (
                    <div className="max-w-2xl mx-auto text-center py-16">
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-primary-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Bienvenue sur notre application PWA
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Connectez-vous pour accéder à vos fonctionnalités personnalisées et découvrir toutes les
                                possibilités de notre plateforme.
                            </p>
                            <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary px-8 py-3 text-lg">
                                Commencer maintenant
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mt-16">
                            <div className="text-center p-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                                    <svg
                                        className="w-6 h-6 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sécurisé</h3>
                                <p className="text-gray-600 text-sm">Authentification sécurisée avec JWT</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                                    <svg
                                        className="w-6 h-6 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapide</h3>
                                <p className="text-gray-600 text-sm">Performance optimale avec PWA</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                                    <svg
                                        className="w-6 h-6 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile</h3>
                                <p className="text-gray-600 text-sm">Expérience optimisée mobile</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            <PWABadge />
        </div>
    );
}

export default App;
