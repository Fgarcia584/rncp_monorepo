import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
    const dsn = process.env.SENTRY_DSN;
    const environment = process.env.NODE_ENV || 'development';

    if (!dsn) {
        console.warn(
            'Sentry DSN not provided. Sentry will not be initialized.',
        );
        return;
    }

    Sentry.init({
        dsn,
        environment,

        // Performance monitoring
        integrations: [nodeProfilingIntegration()],

        // Performance Monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Profiling
        profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Release and Debug
        release: process.env.APP_VERSION || 'unknown',
        debug: environment === 'development',

        // Error filtering
        beforeSend(event, hint) {
            // Filter out non-critical errors
            const error = hint.originalException;

            if (error instanceof Error) {
                // Filter out common Node.js errors that are expected
                if (
                    error.message?.includes('ECONNRESET') ||
                    error.message?.includes('ETIMEDOUT') ||
                    error.message?.includes('socket hang up')
                ) {
                    return null;
                }

                // Filter out validation errors (they're user errors, not bugs)
                if (
                    error.name === 'ValidationError' ||
                    error.name === 'BadRequestException'
                ) {
                    return null;
                }
            }

            return event;
        },

        // Additional configuration for NestJS
        initialScope: {
            tags: {
                app: 'rncp-api',
                platform: 'node',
                framework: 'nestjs',
            },
        },
    });

    console.log(`Sentry initialized for environment: ${environment}`);
};

export { Sentry };
