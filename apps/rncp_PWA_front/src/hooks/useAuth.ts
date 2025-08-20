import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetProfileQuery,
    authApi,
} from '../store/api/authApi';
import { setCredentials, logout, setLoading } from '../store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@rncp/types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, refreshToken, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    const [loginMutation] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [logoutMutation] = useLogoutMutation();

    // Auto-fetch profile if token exists but no user
    const { data: profileData, isLoading: profileLoading } = useGetProfileQuery(undefined, {
        skip: !token || !!user,
    });

    useEffect(() => {
        if (profileData && token) {
            dispatch(
                setCredentials({
                    user: profileData,
                    token,
                    refreshToken: refreshToken || '',
                }),
            );
        }
    }, [profileData, token, refreshToken, dispatch]);

    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                dispatch(setLoading(true));
                const result = await loginMutation(credentials).unwrap();

                dispatch(
                    setCredentials({
                        user: result.user,
                        token: result.accessToken,
                        refreshToken: result.refreshToken,
                    }),
                );

                // Store tokens in localStorage for persistence
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);

                return result;
            } catch (error) {
                dispatch(setLoading(false));
                throw error;
            }
        },
        [dispatch, loginMutation],
    );

    const register = useCallback(
        async (userData: RegisterRequest) => {
            try {
                dispatch(setLoading(true));
                const result = await registerMutation(userData).unwrap();

                dispatch(
                    setCredentials({
                        user: result.user,
                        token: result.accessToken,
                        refreshToken: result.refreshToken,
                    }),
                );

                // Store tokens in localStorage for persistence
                localStorage.setItem('token', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);

                return result;
            } catch (error) {
                dispatch(setLoading(false));
                throw error;
            }
        },
        [dispatch, registerMutation],
    );

    const logoutUser = useCallback(async () => {
        try {
            if (refreshToken) {
                await logoutMutation({ refreshToken }).unwrap();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch(logout());
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            // Clear RTK Query cache to prevent old user data from persisting
            dispatch(authApi.util.resetApiState());
        }
    }, [dispatch, logoutMutation, refreshToken]);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedToken && storedRefreshToken && !token) {
            dispatch(
                setCredentials({
                    user: null, // Profile will be fetched by the query above
                    token: storedToken,
                    refreshToken: storedRefreshToken,
                }),
            );
        }
    }, [dispatch, token]);

    return {
        user,
        token,
        refreshToken,
        isAuthenticated,
        isLoading: isLoading || profileLoading,
        login,
        register,
        logout: logoutUser,
    };
};
