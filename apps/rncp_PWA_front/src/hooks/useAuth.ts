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
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

    const [loginMutation] = useLoginMutation();
    const [registerMutation] = useRegisterMutation();
    const [logoutMutation] = useLogoutMutation();

    // Auto-fetch profile to check if user is authenticated via cookies
    // Skip if already have user or currently loading
    const {
        data: profileData,
        isLoading: profileLoading,
        error: profileError,
    } = useGetProfileQuery(undefined, {
        skip: !!user || isLoading,
        refetchOnMountOrArgChange: true,
        refetchOnReconnect: true,
    });

    useEffect(() => {
        if (profileData) {
            dispatch(
                setCredentials({
                    user: profileData,
                }),
            );
        }

        // If 401 error on profile, user is not authenticated
        if (profileError && 'status' in profileError && profileError.status === 401) {
            console.log('🚫 Profile fetch failed with 401, user not authenticated');
            dispatch(logout());
        }
    }, [profileData, profileError, dispatch]);

    const login = useCallback(
        async (credentials: LoginRequest) => {
            try {
                dispatch(setLoading(true));
                const result = await loginMutation(credentials).unwrap();

                // Tokens are now stored in httpOnly cookies automatically
                // Just set user data in the store
                dispatch(
                    setCredentials({
                        user: result.user,
                    }),
                );

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

                // Tokens are now stored in httpOnly cookies automatically
                // Just set user data in the store
                dispatch(
                    setCredentials({
                        user: result.user,
                    }),
                );

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
            // The logout endpoint will use the refresh token from cookies
            await logoutMutation().unwrap();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch(logout());
            // Clear RTK Query cache to prevent old user data from persisting
            dispatch(authApi.util.resetApiState());
        }
    }, [dispatch, logoutMutation]);

    // Clean up any old tokens from localStorage (migration from old localStorage-based auth)
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedToken || storedRefreshToken) {
            console.log('🧹 Cleaning legacy tokens from localStorage (now using secure cookies)');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }
    }, []);

    return {
        user,
        isAuthenticated,
        isLoading: isLoading || profileLoading,
        login,
        register,
        logout: logoutUser,
    };
};
