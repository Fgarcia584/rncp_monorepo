import { Middleware } from '@reduxjs/toolkit';
import { Sentry } from '../../sentry';
import type { RootState } from '../store';

export const sentryMiddleware: Middleware<Record<string, never>, RootState> = (store) => (next) => (action) => {
    // Set user context when auth state changes
    if (action.type === 'auth/setCredentials') {
        const user = action.payload.user;
        if (user) {
            Sentry.setUser({
                id: user.id.toString(),
                email: user.email,
                username: user.name,
            });

            Sentry.setTag('user_role', user.role);

            Sentry.addBreadcrumb({
                category: 'auth',
                message: 'User logged in',
                level: 'info',
                data: {
                    userId: user.id,
                    role: user.role,
                },
            });
        }
    }

    // Clear user context on logout
    if (action.type === 'auth/logout') {
        Sentry.setUser(null);
        Sentry.addBreadcrumb({
            category: 'auth',
            message: 'User logged out',
            level: 'info',
        });
    }

    // Log important actions as breadcrumbs
    const actionType = action.type;
    const importantActions = [
        'auth/',
        'api/',
        // Add other important action patterns here
    ];

    if (importantActions.some((pattern) => actionType.startsWith(pattern))) {
        Sentry.addBreadcrumb({
            category: 'redux',
            message: `Action: ${actionType}`,
            level: 'info',
            data: {
                action: actionType,
                // Be careful not to log sensitive data
                ...(actionType.includes('auth') ? {} : { payload: action.payload }),
            },
        });
    }

    try {
        return next(action);
    } catch (error) {
        // Capture Redux middleware errors
        Sentry.captureException(error, {
            tags: {
                redux_error: true,
                action_type: actionType,
            },
            extra: {
                action,
                state: store.getState(),
            },
        });

        throw error;
    }
};
