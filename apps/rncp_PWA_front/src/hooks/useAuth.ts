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
import type { LoginRequest, RegisterRequest } from '../types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, refreshToken, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    const [loginMutation] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [logoutMutation] = useLogoutMutation();

    // Auto-fetch profile if token exists but no user
    // Skip if no token, already have user, or currently refreshing
    const {
        data: profileData,
        isLoading: profileLoading,
        error: profileError,
    } = useGetProfileQuery(undefined, {
        skip: !token || !!user || isLoading,
        refetchOnMountOrArgChange: false,
        refetchOnReconnect: false,
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

        // Si erreur 401 sur le profile, nettoyer tout
        if (profileError && 'status' in profileError && profileError.status === 401) {
            console.log('🚫 Profile fetch failed with 401, cleaning up...');
            dispatch(logout());
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }
    }, [profileData, profileError, token, refreshToken, dispatch]);

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

        // Vérifier que les tokens sont valides (non vides)
        if (storedToken && storedRefreshToken && !token && storedToken !== 'undefined') {
            dispatch(
                setCredentials({
                    user: null, // Profile will be fetched by the query above
                    token: storedToken,
                    refreshToken: storedRefreshToken,
                }),
            );
        } else if (storedToken === 'undefined' || storedRefreshToken === 'undefined') {
            // Nettoyer les tokens invalides
            console.log('🧹 Cleaning invalid tokens from localStorage');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
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
