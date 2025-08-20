import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@rncp/types';

// Temporary workaround for CommonJS import issue in Vite build
const UserRole = {
    ADMIN: 'admin' as const,
    DELIVERY_PERSON: 'delivery_person' as const,
    MERCHANT: 'merchant' as const,
    LOGISTICS_TECHNICIAN: 'logistics_technician' as const,
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                user: AuthUser | null;
                token: string;
                refreshToken: string;
            }>,
        ) => {
            const { user, token, refreshToken } = action.payload;
            state.user = user;
            state.token = token;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
});

export const { setCredentials, logout, setLoading, updateUser } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === UserRole.ADMIN;
export const selectIsLogisticsTechnician = (state: { auth: AuthState }) =>
    state.auth.user?.role === UserRole.LOGISTICS_TECHNICIAN;
export const selectIsMerchant = (state: { auth: AuthState }) => state.auth.user?.role === UserRole.MERCHANT;
export const selectIsDeliveryPerson = (state: { auth: AuthState }) =>
    state.auth.user?.role === UserRole.DELIVERY_PERSON;

export default authSlice.reducer;
