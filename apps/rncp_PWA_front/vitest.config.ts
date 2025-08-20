import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@rncp/types': path.resolve(__dirname, '../../tools/dist/esm'),
        },
    },
    define: {
        // Define environment variables for tests
        'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3001/api'),
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test-setup.ts'],
        css: true,
        reporters: ['verbose'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
});
