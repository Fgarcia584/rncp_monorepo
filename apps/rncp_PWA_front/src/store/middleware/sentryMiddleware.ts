import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { Sentry } from '../../sentry';

export const sentryMiddleware: Middleware = (store) => (next) => (action: unknown) => {
    const typedAction = action as AnyAction;
    // Set user context when auth state changes
    if (typedAction.type === 'auth/setCredentials') {
        const user = (
            typedAction as unknown as { payload: { user: { id: number; email: string; name: string; role: string } } }
        ).payload.user;
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
    if (typedAction.type === 'auth/logout') {
        Sentry.setUser(null);
        Sentry.addBreadcrumb({
            category: 'auth',
            message: 'User logged out',
            level: 'info',
        });
    }

    // Log important actions as breadcrumbs
    const actionType = typedAction.type;
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
                ...(actionType.includes('auth') ? {} : { payload: typedAction.payload }),
            },
        });
    }

    try {
        return next(typedAction);
    } catch (error) {
        // Capture Redux middleware errors
        Sentry.captureException(error, {
            tags: {
                redux_error: true,
                action_type: actionType,
            },
            extra: {
                action: typedAction,
                state: store.getState(),
            },
        });

        throw error;
    }
};
