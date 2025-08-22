import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    resolve: {
        alias: {
            '@rncp/types': path.resolve(__dirname, './src/types/index.ts'),
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
    preview: {
        host: '0.0.0.0',
        port: 3000,
        allowedHosts: true, // Allow all hosts for Railway deployment
    },
    server: {
        host: '0.0.0.0', // Allow access from network
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.log('Proxy error:', err);
                    });
                    proxy.on('proxyReq', (_proxyReq, req) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
                // Ne pas retirer le /api pour correspondre aux routes de l'API Gateway NestJS
                // rewrite: (path) => path.replace(/^\/api/, ''),
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
                disabled: true,
                config: false,
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
                icons: [
                    {
                        src: '/favicon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any maskable',
                    },
                ],
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
