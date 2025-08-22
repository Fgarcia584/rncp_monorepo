import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string, placeDetails?: google.maps.places.PlaceResult) => void;
    required?: boolean;
    className?: string;
    placeholder?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    required = false,
    className = '',
    placeholder = 'Saisissez une adresse...',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const initializeAutocomplete = async () => {
            console.log("🚀 Initialisation de l'autocomplétion...");

            try {
                const apiKey = (import.meta as unknown as { env: { VITE_GOOGLE_MAPS_API_KEY: string } }).env
                    .VITE_GOOGLE_MAPS_API_KEY;
                console.log('🔑 Clé API présente:', !!apiKey && apiKey !== 'YOUR_API_KEY_HERE');

                if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
                    console.error('❌ Clé API Google Maps non configurée');
                    setError('Clé API Google Maps non configurée');
                    return;
                }

                console.log('📚 Chargement des bibliothèques Google Maps...');
                const loader = new Loader({
                    apiKey: apiKey,
                    version: 'weekly',
                    libraries: ['places'],
                });

                await loader.load();
                console.log('✅ Bibliothèques Google Maps chargées');

                // Vérifier que l'input existe
                if (!inputRef.current) {
                    console.error('❌ Référence input non trouvée');
                    setError('Référence input non trouvée');
                    return;
                }

                console.log("🎯 Input référence trouvée, création de l'autocomplétion...");

                // Supprimer l'avertissement en désactivant temporairement les logs
                const originalWarn = console.warn;
                console.warn = () => {};

                try {
                    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
                        types: ['address'],
                        componentRestrictions: { country: 'fr' },
                        fields: ['formatted_address', 'geometry', 'address_components', 'place_id'],
                    });

                    console.log('🔧 Autocomplétion créée, ajout du listener...');

                    autocompleteRef.current.addListener('place_changed', () => {
                        const place = autocompleteRef.current?.getPlace();
                        if (place && place.formatted_address) {
                            console.log('📍 Lieu sélectionné:', place.formatted_address);
                            onChange(place.formatted_address, place);
                        }
                    });

                    // Ajouter des listeners pour déboguer l'autocomplétion
                    if (inputRef.current) {
                        inputRef.current.addEventListener('input', () => {
                            console.log("🔍 Input event détecté sur l'input Google Maps");
                        });

                        inputRef.current.addEventListener('focus', () => {
                            console.log("🎯 Focus sur l'input d'autocomplétion");
                        });
                    }

                    console.log('✅ Autocomplétion complètement initialisée');
                } finally {
                    // Restaurer les logs après 1 seconde
                    setTimeout(() => {
                        console.warn = originalWarn;
                    }, 1000);
                }

                setIsLoaded(true);
                setError('');
                console.log('🎉 État isLoaded mis à true');
            } catch (err) {
                console.error('💥 Erreur lors du chargement de Google Maps:', err);
                setError("Erreur lors du chargement de l'autocomplétion");
            }
        };

        // Timeout de sécurité : forcer le chargement après 10 secondes
        const timeoutId = setTimeout(() => {
            if (!isLoaded) {
                console.warn('⚠️ Timeout de sécurité : activation du mode manuel');
                setError('Timeout - Mode manuel activé');
            }
        }, 10000);

        initializeAutocomplete();

        return () => {
            clearTimeout(timeoutId);
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [onChange, isLoaded]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        console.log('⌨️ Frappe détectée:', newValue);

        // Ne pas interférer avec l'autocomplétion Google Maps
        // Laisser Google Maps gérer la frappe naturellement
        onChange(newValue);

        // Vérifier si les suggestions apparaissent
        setTimeout(() => {
            const pacContainer = document.querySelector('.pac-container');
            if (pacContainer) {
                console.log('📝 Suggestions détectées dans le DOM:', pacContainer);
                console.log('👀 Visibilité des suggestions:', window.getComputedStyle(pacContainer as Element).display);
            } else {
                console.log('❌ Aucune suggestion trouvée dans le DOM');
            }
        }, 100);
    };

    if (error) {
        return (
            <div className="space-y-2">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    rows={3}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
                    placeholder="Mode de secours - saisissez l'adresse manuellement"
                />
                <p className="text-sm text-amber-600">⚠️ {error} - Mode manuel activé</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    required={required}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className} ${
                        !isLoaded ? 'bg-gray-50' : ''
                    }`}
                    placeholder={isLoaded ? placeholder : "Chargement de l'autocomplétion..."}
                    disabled={!isLoaded}
                />
                {!isLoaded && !error && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            {/* Styles CSS pour les suggestions Google Maps */}
            <style>{`
                .pac-container {
                    z-index: 9999 !important;
                    border-radius: 0.375rem !important;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid #e5e7eb !important;
                    margin-top: 1px !important;
                    font-family: system-ui, -apple-system, sans-serif !important;
                }
                
                .pac-item {
                    padding: 10px 15px !important;
                    font-size: 14px !important;
                    border-bottom: 1px solid #f3f4f6 !important;
                    cursor: pointer !important;
                    line-height: 1.4 !important;
                }
                
                .pac-item:last-child {
                    border-bottom: none !important;
                }
                
                .pac-item:hover {
                    background-color: #f9fafb !important;
                }
                
                .pac-item-selected {
                    background-color: #3b82f6 !important;
                    color: white !important;
                }
                
                .pac-item-query {
                    font-weight: 600 !important;
                    color: #1f2937 !important;
                }
                
                .pac-matched {
                    font-weight: 700 !important;
                    color: #374151 !important;
                }
                
                .pac-item-selected .pac-matched,
                .pac-item-selected .pac-item-query {
                    color: white !important;
                }
                
                .pac-icon {
                    margin-right: 8px !important;
                }
            `}</style>
        </>
    );
};
