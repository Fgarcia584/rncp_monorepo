import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../slices/authSlice';
import { Sentry } from '../../sentry';

// Flag global pour éviter les refresh parallèles
let isRefreshing = false;
// let refreshPromise: Promise<any> | null = null;

// Type-safe access to import.meta.env with environment detection
const getApiUrl = (): string => {
    const env = (import.meta as { env?: { VITE_API_URL?: string; MODE?: string } }).env;

    // PRIORITÉ 1: Si VITE_API_URL est défini, l'utiliser (pour accès réseau)
    if (env?.VITE_API_URL && env.VITE_API_URL !== 'http://localhost:3000') {
        console.log(`🔗 API URL configured: ${env.VITE_API_URL} (mode: ${env?.MODE || 'unknown'})`);
        return env.VITE_API_URL;
    }

    // PRIORITÉ 2: En développement avec Vite dev server, utiliser l'API Gateway local
    if (
        env?.MODE === 'development' ||
        (typeof window !== 'undefined' && ['3000', '5173', '5174', '5175'].includes(window.location.port))
    ) {
        console.log('🔗 Using direct API Gateway: http://localhost:3001');
        return 'http://localhost:3001';
    }

    // PRIORITÉ 3: En production, vérifier si on a une URL d'API configurée
    // IMPORTANT: Sur Railway, vous DEVEZ définir VITE_API_URL dans les variables d'environnement
    // Exemple: VITE_API_URL=https://back-production-dd72.up.railway.app
    if (!env?.VITE_API_URL) {
        console.warn('⚠️ No VITE_API_URL configured in production!');
        console.warn('For Railway deployment, set VITE_API_URL to your backend URL');
    }

    // PRIORITÉ 4: En production locale avec nginx, utiliser le proxy /api
    console.log('🔗 Using production API with proxy: /api prefix');
    return '/api';
};

const baseQuery = fetchBaseQuery({
    baseUrl: getApiUrl(),
    credentials: 'include', // Always include cookies in requests
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    console.group('🌐 API Request');
    console.log('Args:', args);
    console.log('Base URL:', getApiUrl());
    console.groupEnd();

    let result = await baseQuery(args, api, extraOptions);

    // Log API calls for monitoring
    const url = typeof args === 'string' ? args : args.url;
    const method = typeof args === 'string' ? 'GET' : args.method || 'GET';

    // Add breadcrumb for API calls
    Sentry.addBreadcrumb({
        category: 'api',
        message: `${method} ${url}`,
        level: 'info',
        data: {
            url,
            method,
            status: result.error?.status || 'success',
        },
    });

    // Log des résultats pour débugger
    if (result.error) {
        console.group('❌ API Error');
        console.log('Status:', result.error.status);
        console.log('Data:', result.error.data);
        console.log('Args:', args);
        console.groupEnd();

        // Log non-auth errors to Sentry
        if (result.error.status !== 401) {
            Sentry.captureException(new Error(`API Error: ${method} ${url}`), {
                tags: {
                    api_error: true,
                    status: result.error.status,
                    endpoint: url,
                },
                extra: {
                    error: result.error.data,
                    method,
                    url,
                },
            });
        }
    } else if (result.data) {
        console.log('✅ API Success:', typeof args === 'string' ? args : args.url);
    }

    if (result.error && result.error.status === 401) {
        const url = typeof args === 'string' ? args : args.url;

        // Don't attempt refresh for auth endpoints (prevent infinite loops)
        if (url?.includes('/auth/refresh') || url?.includes('/auth/login') || url?.includes('/auth/register')) {
            console.log('🚫 Auth endpoint failed, logging out');
            api.dispatch(logout());
            return result;
        }

        // Try token refresh with cookies if not already refreshing
        if (!isRefreshing) {
            console.log('🔄 Attempting token refresh via cookies...');
            isRefreshing = true;

            try {
                const refreshResult = await baseQuery(
                    {
                        url: '/auth/refresh',
                        method: 'POST',
                        body: {}, // Empty body since refresh token is in cookies
                    },
                    api,
                    extraOptions,
                );

                if (refreshResult.data && !refreshResult.error) {
                    console.log('✅ Token refresh successful via cookies');
                    // Retry the original query - new tokens are automatically in cookies
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    console.log('❌ Token refresh failed, logging out');
                    Sentry.addBreadcrumb({
                        category: 'auth',
                        message: 'Token refresh failed, logging out user',
                        level: 'warning',
                    });
                    api.dispatch(logout());
                }
            } catch {
                console.log('❌ Token refresh error, logging out');
                api.dispatch(logout());
            } finally {
                isRefreshing = false;
            }
        } else {
            console.log('⏳ Refresh already in progress, waiting...');
            // Wait a bit and retry the original request
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (!isRefreshing) {
                result = await baseQuery(args, api, extraOptions);
            }
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Order', 'Auth'],
    endpoints: () => ({}),
});
