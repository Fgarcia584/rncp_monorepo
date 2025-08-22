import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout, setCredentials } from '../slices/authSlice';
import type { RootState } from '../store';
import { TokenPair } from '../../types';

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

    // PRIORITÉ 3: En production ou dans les conteneurs, nginx ajoute déjà le préfixe /api
    console.log('🔗 Using production API: empty baseUrl (nginx handles /api prefix)');
    return '';
};

const baseQuery = fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;

        headers.set('Content-Type', 'application/json');

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

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
        // Ne pas tenter de refresh pour les endpoints d'auth
        const url = typeof args === 'string' ? args : args.url;
        if (url?.includes('/auth/refresh') || url?.includes('/auth/login')) {
            console.log('🚫 Auth endpoint failed, logging out');
            api.dispatch(logout());
            // Nettoyer localStorage immédiatement
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return result;
        }

        const refreshToken = (api.getState() as RootState).auth.refreshToken;

        if (refreshToken && !isRefreshing) {
            console.log('🔄 Attempting token refresh...');
            isRefreshing = true;

            try {
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
                    console.log('✅ Token refresh successful');
                    const tokens = refreshResult.data as TokenPair;
                    // Store the new tokens
                    api.dispatch(
                        setCredentials({
                            user: (api.getState() as RootState).auth.user,
                            token: tokens.accessToken,
                            refreshToken: tokens.refreshToken,
                        }),
                    );
                    // Update localStorage
                    localStorage.setItem('token', tokens.accessToken);
                    localStorage.setItem('refreshToken', tokens.refreshToken);

                    // Retry the original query
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    console.log('❌ Token refresh failed, logging out');
                    api.dispatch(logout());
                    // Nettoyer localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            } finally {
                isRefreshing = false;
            }
        } else if (isRefreshing) {
            console.log('⏳ Refresh already in progress, skipping...');
            // Un refresh est déjà en cours, on attend un peu et on réessaye
            await new Promise((resolve) => setTimeout(resolve, 1000));
            result = await baseQuery(args, api, extraOptions);
        } else {
            console.log('🚫 No refresh token available, logging out');
            api.dispatch(logout());
            // Nettoyer localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
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
