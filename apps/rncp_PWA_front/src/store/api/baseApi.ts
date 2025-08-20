import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout, setCredentials } from '../slices/authSlice';
import type { RootState } from '../store';
import { TokenPair } from '@rncp/types';

// Type-safe access to import.meta.env with environment detection
const getApiUrl = (): string => {
    const env = (import.meta as { env?: { VITE_API_URL?: string; MODE?: string } }).env;

    // Si VITE_API_URL est défini, l'utiliser
    if (env?.VITE_API_URL) {
        console.log(`🔗 API URL configured: ${env.VITE_API_URL} (mode: ${env?.MODE || 'unknown'})`);
        return env.VITE_API_URL;
    }

    // Fallback basé sur l'environnement de développement
    // En développement avec Vite dev server, utiliser le proxy
    if (env?.MODE === 'development' || (typeof window !== 'undefined' && window.location.port === '3000')) {
        console.log('🔗 Using Vite proxy: /api');
        return '/api';
    }

    // En production ou dans les conteneurs
    console.log('🔗 Using production API: /api');
    return '/api';
};

const baseQuery = fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
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

    // Log des résultats pour débugger
    if (result.error) {
        console.group('❌ API Error');
        console.log('Status:', result.error.status);
        console.log('Data:', result.error.data);
        console.log('Args:', args);
        console.groupEnd();
    } else if (result.data) {
        console.log('✅ API Success:', typeof args === 'string' ? args : args.url);
    }

    if (result.error && result.error.status === 401) {
        // Try to get a new token
        const refreshToken = (api.getState() as RootState).auth.refreshToken;

        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: '/auth/refresh',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions,
            );

            if (refreshResult.data) {
                const tokens = refreshResult.data as TokenPair;
                // Store the new tokens
                api.dispatch(
                    setCredentials({
                        user: (api.getState() as RootState).auth.user,
                        token: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                    }),
                );
                // Retry the original query
                result = await baseQuery(args, api, extraOptions);
            } else {
                api.dispatch(logout());
            }
        } else {
            api.dispatch(logout());
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Auth', 'Order'],
    endpoints: () => ({}),
});
