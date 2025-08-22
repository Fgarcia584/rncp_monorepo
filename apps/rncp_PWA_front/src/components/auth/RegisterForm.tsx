import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RegisterRequest } from '../../types';

interface RegisterFormProps {
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

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggle, onSuccess }) => {
    const [formData, setFormData] = useState<RegisterRequest>({
        email: '',
        password: '',
        name: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string>('');

    const { register, isLoading } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'confirmPassword') {
            setConfirmPassword(value);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            await register(formData);
            onSuccess?.();
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Inscription échouée. Veuillez réessayer.'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
                <p className="text-gray-600 mt-2">Rejoignez notre plateforme</p>
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="input-field"
                        placeholder="Jean Dupont"
                        autoComplete="name"
                    />
                </div>

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
                        minLength={6}
                        disabled={isLoading}
                        className="input-field"
                        placeholder="Au moins 6 caractères"
                        autoComplete="new-password"
                    />
                    <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le mot de passe
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="input-field"
                        placeholder="Répétez votre mot de passe"
                        autoComplete="new-password"
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
                            Création en cours...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Créer le compte
                        </>
                    )}
                </button>
            </form>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={isLoading}
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Se connecter
                    </button>
                </p>
            </div>
        </div>
    );
};
