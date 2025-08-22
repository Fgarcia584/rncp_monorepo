import { UserRole } from './role.types';

export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}

export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    sub: number;
    email: string;
    role: UserRole;
    iat: number;
    expiresIn: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

export function isApiError(error: unknown): error is { data: ApiError } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data &&
        typeof error.data.message === 'string'
    );
}

export function getErrorMessage(error: unknown, defaultMessage: string): string {
    if (isApiError(error)) {
        return error.data.message;
    }
    return defaultMessage;
}
