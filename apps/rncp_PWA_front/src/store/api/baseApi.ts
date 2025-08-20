import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout, setCredentials } from '../slices/authSlice';
import type { RootState } from '../store';
import { TokenPair } from '@rncp/types';

// Type-safe access to import.meta.env
const getApiUrl = (): string => {
    const env = (import.meta as { env?: { VITE_API_URL?: string } }).env;
    return env?.VITE_API_URL || '/api';
};

const baseQuery = fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    let result = await baseQuery(args, api, extraOptions);

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
