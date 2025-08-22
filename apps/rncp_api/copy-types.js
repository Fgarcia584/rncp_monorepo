/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

// Multiple possible source paths for different deployment environments
const possibleSourcePaths = [
    path.resolve(__dirname, '../../tools/types'), // Local monorepo
    path.resolve(__dirname, '../../../tools/types'), // Alternative monorepo structure
    path.resolve(__dirname, './tools/types'), // Railway deployment structure
    path.resolve(__dirname, '../tools/types'), // Another possible structure
];

const typesDestDir = path.resolve(__dirname, 'src/types');

// Find the correct source directory
let typesSourceDir = null;
for (const sourcePath of possibleSourcePaths) {
    if (fs.existsSync(sourcePath)) {
        typesSourceDir = sourcePath;
        console.log(`Found types source directory: ${sourcePath}`);
        break;
    }
}

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(typesDestDir)) {
    fs.mkdirSync(typesDestDir, { recursive: true });
}

// Fonction pour copier récursivement
function copyDir(src, dest) {
    if (!src || !fs.existsSync(src)) {
        console.log(`Source directory ${src || 'undefined'} does not exist`);
        console.log('Tried paths:', possibleSourcePaths);
        console.log('Creating fallback types...');
        createFallbackTypes(dest);
        return;
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${entry.name}`);
        }
    }
}

// Function to create fallback types when source is not available
function createFallbackTypes(dest) {
    console.log('Creating fallback types...');

    // Create index.ts with all type exports
    const indexContent = `// Fallback types for deployment
export * from './role.types';
export * from './auth.types';
export * from './order.types';
export * from './geo.types';
export * from './user.types';
`;

    // Create role.types.ts
    const roleTypesContent = `export enum UserRole {
    ADMIN = 'ADMIN',
    MERCHANT = 'MERCHANT',
    DELIVERY_PERSON = 'DELIVERY_PERSON'
}
`;

    // Create auth.types.ts
    const authTypesContent = `import { UserRole } from './role.types';

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
`;

    // Create order.types.ts
    const orderTypesContent = `import { UserRole } from './role.types';

export enum OrderStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export enum OrderPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export interface OrderFilters {
    status?: OrderStatus;
    priority?: OrderPriority;
    merchantId?: number;
    deliveryPersonId?: number;
}
`;

    // Create geo.types.ts
    const geoTypesContent = `export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    postalCode: string;
    country: string;
}
`;

    // Create user.types.ts
    const userTypesContent = `import { UserRole } from './role.types';

export interface CreateUserRequest {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
}

export interface UpdateUserRequest {
    email?: string;
    name?: string;
    role?: UserRole;
}

export interface UserResponse {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
`;

    // Write all files
    fs.writeFileSync(path.join(dest, 'index.ts'), indexContent);
    fs.writeFileSync(path.join(dest, 'role.types.ts'), roleTypesContent);
    fs.writeFileSync(path.join(dest, 'auth.types.ts'), authTypesContent);
    fs.writeFileSync(path.join(dest, 'order.types.ts'), orderTypesContent);
    fs.writeFileSync(path.join(dest, 'geo.types.ts'), geoTypesContent);
    fs.writeFileSync(path.join(dest, 'user.types.ts'), userTypesContent);

    console.log('Fallback types created successfully!');
}

console.log('Copying types from tools to API...');
copyDir(typesSourceDir, typesDestDir);
console.log('Types copied successfully!');
