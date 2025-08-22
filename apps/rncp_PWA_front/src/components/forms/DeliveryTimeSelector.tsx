import React from 'react';

interface DeliveryTimeSelectorProps {
    selectedDate: string;
    selectedTime: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    required?: boolean;
}

const DELIVERY_TIME_SLOTS = [
    { value: '07:00', label: '07h00 - Tournée Matin', description: 'Livraison entre 7h et 10h' },
    { value: '11:00', label: '11h00 - Tournée Midi', description: 'Livraison entre 11h et 14h' },
    { value: '18:00', label: '18h00 - Tournée Soir', description: 'Livraison entre 18h et 21h' },
];

export const DeliveryTimeSelector: React.FC<DeliveryTimeSelectorProps> = ({
    selectedDate,
    selectedTime,
    onDateChange,
    onTimeChange,
    required = false,
}) => {
    // Calculer la date minimum (aujourd'hui)
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];

    // Calculer la date maximum (7 jours à l'avance)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="space-y-4">
            {/* Sélecteur de date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de livraison {required && '*'}
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    min={minDate}
                    max={maxDateStr}
                    required={required}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Livraison possible jusqu&apos;à 7 jours à l&apos;avance</p>
            </div>

            {/* Sélecteur d'horaire */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Créneau de livraison {required && '*'}
                </label>
                <div className="space-y-2">
                    {DELIVERY_TIME_SLOTS.map((slot) => (
                        <label
                            key={slot.value}
                            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                                selectedTime === slot.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="deliveryTime"
                                value={slot.value}
                                checked={selectedTime === slot.value}
                                onChange={(e) => onTimeChange(e.target.value)}
                                required={required}
                                className="sr-only"
                            />
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{slot.label}</p>
                                        <p className="text-gray-500">{slot.description}</p>
                                    </div>
                                </div>
                                <div
                                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                        selectedTime === slot.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                    }`}
                                >
                                    {selectedTime === slot.value && (
                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};
