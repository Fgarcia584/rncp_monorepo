import * as Sentry from '@sentry/react';

export const initSentry = () => {
    const env = (import.meta as unknown as { env: ImportMetaEnv }).env;
    const dsn = env?.VITE_SENTRY_DSN;
    const environment = env?.VITE_ENVIRONMENT || env?.MODE || 'development';

    // Only initialize Sentry if DSN is provided
    if (!dsn) {
        console.warn('Sentry DSN not provided. Sentry will not be initialized.');
        return;
    }

    Sentry.init({
        dsn,
        environment,

        // Performance monitoring
        integrations: [
            Sentry.browserTracingIntegration({
                // Capture navigation and route changes
                enableInp: true,
            }),
            Sentry.replayIntegration({
                // Capture replays only for errors in production
                maskAllText: environment === 'production',
                blockAllMedia: environment === 'production',
            }),
        ],

        // Performance Monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Session Replay
        replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,

        // Release and Debug
        release: env?.VITE_APP_VERSION || 'unknown',
        debug: environment === 'development',

        // Error filtering
        beforeSend(event, hint) {
            // Filter out common non-critical errors
            const error = hint.originalException;

            if (error instanceof Error) {
                // Filter out network errors that are expected
                if (
                    error.message?.includes('Failed to fetch') ||
                    error.message?.includes('NetworkError') ||
                    error.message?.includes('ChunkLoadError')
                ) {
                    return null;
                }

                // Filter out ResizeObserver errors (common browser quirk)
                if (error.message?.includes('ResizeObserver loop limit exceeded')) {
                    return null;
                }
            }

            return event;
        },

        // Additional configuration for PWA
        initialScope: {
            tags: {
                app: 'rncp-pwa',
                platform: 'web',
            },
        },
    });
};

// Export Sentry for use in error boundaries and manual error reporting
export { Sentry };
