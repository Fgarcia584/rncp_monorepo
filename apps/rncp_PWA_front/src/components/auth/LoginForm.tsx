import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginRequest } from '../../types';

interface LoginFormProps {
    onToggle: () => void;
    onSuccess?: () => void;
}

// Fonction utilitaire pour extraire le message d'erreur de manière type-safe
function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data &&
        typeof error.data.message === 'string'
    ) {
        return error.data.message;
    }
    return defaultMessage;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggle, onSuccess }) => {
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string>('');

    const { login, isLoading } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(formData);
            onSuccess?.();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Connexion échouée. Veuillez réessayer.'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
                <p className="text-gray-600 mt-2">Accédez à votre compte</p>
            </div>

            {error && (
                <div className="form-error animate-slide-up">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="input-field"
                        placeholder="vous@exemple.com"
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="input-field"
                        placeholder="Votre mot de passe"
                        autoComplete="current-password"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="loading-spinner mr-2"></div>
                            Connexion en cours...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                />
                            </svg>
                            Se connecter
                        </>
                    )}
                </button>
            </form>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Pas encore de compte ?{' '}
                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={isLoading}
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Créer un compte
                    </button>
                </p>
            </div>
        </div>
    );
};
