import { baseApi } from './baseApi';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    TokenPair,
    RefreshTokenRequest,
    AuthUser,
} from '../../types';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Auth'],
        }),
        refresh: builder.mutation<TokenPair, RefreshTokenRequest>({
            query: (refreshData) => ({
                url: '/auth/refresh',
                method: 'POST',
                body: refreshData,
            }),
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
                body: {}, // Empty body - refresh token is in cookies
            }),
            invalidatesTags: ['Auth'],
        }),
        getProfile: builder.query<AuthUser, void>({
            query: () => '/auth/profile',
            providesTags: ['Auth'],
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useLogoutMutation, useGetProfileQuery } =
    authApi;
