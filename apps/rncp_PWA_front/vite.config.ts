import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@rncp/types': path.resolve(__dirname, '../../tools/dist/esm'),
        },
    },
    build: {
        rollupOptions: {
            external: [],
            output: {
                globals: {},
            },
        },
        commonjsOptions: {
            include: [/@rncp\/types/, /node_modules/],
            transformMixedEsModules: true,
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
        fs: {
            allow: ['..'],
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers':
                'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
        },
    },
    css: {
        postcss: {},
        devSourcemap: true,
    },
    define: {
        __DEV__: true,
    },
    optimizeDeps: {
        include: ['tailwindcss', '@rncp/types'],
        force: true,
    },
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            
            pwaAssets: {
                disabled: false,
                config: true,
            },

            manifest: {
                name: 'Plateforme de Livraison Intelligente',
                short_name: 'RNCP Livraison',
                description: 'Application de gestion des livraisons et commandes en temps réel',
                theme_color: '#16a34a',
                background_color: '#f0fdf4',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                orientation: 'portrait-primary',
                categories: ['business', 'productivity'],
                lang: 'fr',
                // Les icônes seront générées automatiquement par pwaAssets
            },

            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
            },

            devOptions: {
                enabled: true,
                navigateFallback: 'index.html',
                suppressWarnings: false,
                type: 'module',
            },
        }),
    ],
});
