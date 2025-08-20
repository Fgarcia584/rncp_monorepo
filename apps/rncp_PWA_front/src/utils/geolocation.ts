import { Position } from '@rncp/types';

// Fonction utilitaire pour obtenir un nom d'affichage pour une position
export const getLocationDisplayName = (position: Position): string => {
    const { latitude, longitude, accuracy } = position;

    // Format simple avec coordonnées arrondies
    const lat = latitude.toFixed(4);
    const lng = longitude.toFixed(4);

    let displayName = `${lat}, ${lng}`;

    if (accuracy !== undefined) {
        displayName += ` (±${Math.round(accuracy)}m)`;
    }

    return displayName;
};
