/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
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
