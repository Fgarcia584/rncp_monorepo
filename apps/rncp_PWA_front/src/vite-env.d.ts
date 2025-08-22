/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly FRONTEND_URL?: string;
    readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Leaflet CSS and asset declarations for Vite
declare module 'leaflet/dist/leaflet.css';

declare module 'leaflet/dist/images/marker-icon.png' {
    const src: string;
    export default src;
}

declare module 'leaflet/dist/images/marker-shadow.png' {
    const src: string;
    export default src;
}

// Types pour Google Maps PlaceAutocompleteElement
declare namespace google.maps.places {
    interface PlaceResult {
        formatted_address?: string;
        formattedAddress?: string;
        geometry?: {
            location: {
                lat(): number;
                lng(): number;
            };
        };
        address_components?: unknown[];
        place_id?: string;
        placeId?: string;
    }
}
