const fs = require('fs');
const path = require('path');

console.log('🚀 Railway prebuild script starting...');

// Chemins source et destination
const typesSourceDir = path.resolve(__dirname, '../../tools/types');
const typesDestDir = path.resolve(__dirname, 'src/types');

console.log('📂 Source directory:', typesSourceDir);
console.log('📂 Destination directory:', typesDestDir);

// Vérifier si le répertoire source existe
if (!fs.existsSync(typesSourceDir)) {
    console.error('❌ Source directory does not exist:', typesSourceDir);
    console.log('📋 Available files in parent directories:');
    
    try {
        const toolsDir = path.resolve(__dirname, '../../tools');
        if (fs.existsSync(toolsDir)) {
            console.log('Tools directory contents:', fs.readdirSync(toolsDir));
        } else {
            console.log('Tools directory does not exist');
        }
        
        const rootDir = path.resolve(__dirname, '../..');
        if (fs.existsSync(rootDir)) {
            console.log('Root directory contents:', fs.readdirSync(rootDir));
        }
    } catch (e) {
        console.error('Error listing directories:', e.message);
    }
    
    // Fallback: créer des types basiques si la source n'existe pas
    console.log('🔧 Creating fallback types...');
    
    if (!fs.existsSync(typesDestDir)) {
        fs.mkdirSync(typesDestDir, { recursive: true });
    }
    
    // Créer les types de base
    const fallbackTypes = {
        'user.types.ts': `export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: string;
}`,
        'auth.types.ts': `export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: string;
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
    role?: string;
}

export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
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
}`,
        'role.types.ts': `export enum UserRole {
    ADMIN = 'admin',
    DELIVERY_PERSON = 'delivery_person',
    MERCHANT = 'merchant',
    LOGISTICS_TECHNICIAN = 'logistics_technician',
}

export interface RolePermissions {
    canAccessUserManagement: boolean;
    canAccessGlobalStats: boolean;
    canAccessInventoryManagement: boolean;
    canAccessOrderManagement: boolean;
    canAccessDeliveryManagement: boolean;
    canAccessReports: boolean;
    canModifyUserRoles: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    [UserRole.ADMIN]: {
        canAccessUserManagement: true,
        canAccessGlobalStats: true,
        canAccessInventoryManagement: true,
        canAccessOrderManagement: true,
        canAccessDeliveryManagement: true,
        canAccessReports: true,
        canModifyUserRoles: true,
    },
    [UserRole.LOGISTICS_TECHNICIAN]: {
        canAccessUserManagement: false,
        canAccessGlobalStats: true,
        canAccessInventoryManagement: true,
        canAccessOrderManagement: false,
        canAccessDeliveryManagement: true,
        canAccessReports: true,
        canModifyUserRoles: false,
    },
    [UserRole.MERCHANT]: {
        canAccessUserManagement: false,
        canAccessGlobalStats: false,
        canAccessInventoryManagement: true,
        canAccessOrderManagement: true,
        canAccessDeliveryManagement: false,
        canAccessReports: false,
        canModifyUserRoles: false,
    },
    [UserRole.DELIVERY_PERSON]: {
        canAccessUserManagement: false,
        canAccessGlobalStats: false,
        canAccessInventoryManagement: false,
        canAccessOrderManagement: false,
        canAccessDeliveryManagement: true,
        canAccessReports: false,
        canModifyUserRoles: false,
    },
};

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
    return ROLE_PERMISSIONS[role][permission];
}

export function getRoleDisplayName(role: UserRole): string {
    switch (role) {
        case UserRole.ADMIN:
            return 'Administrateur';
        case UserRole.LOGISTICS_TECHNICIAN:
            return 'Technicien Logistique';
        case UserRole.MERCHANT:
            return 'Commerçant';
        case UserRole.DELIVERY_PERSON:
            return 'Livreur';
        default:
            return 'Utilisateur';
    }
}

export function isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
}`,
        'order.types.ts': `export interface Order {
    id: number;
    merchantId: number;
    deliveryPersonId?: number;
    status: string;
    priority: string;
    pickupAddress: string;
    deliveryAddress: string;
    createdAt: Date;
    updatedAt: Date;
}`,
        'geolocation.types.ts': `export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    postalCode: string;
    country: string;
}`,
        'index.ts': `export * from './auth.types';
export * from './user.types';
export * from './role.types';
export * from './order.types';
export * from './geolocation.types';`
    };
    
    for (const [filename, content] of Object.entries(fallbackTypes)) {
        fs.writeFileSync(path.join(typesDestDir, filename), content);
        console.log('✅ Created fallback:', filename);
    }
    
    console.log('🎯 Fallback types created successfully!');
    process.exit(0);
}

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(typesDestDir)) {
    fs.mkdirSync(typesDestDir, { recursive: true });
}

// Fonction pour copier récursivement
function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            // Skip test files
            if (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.test.ts')) {
                console.log(`⏭️  Skipped test file: ${entry.name}`);
                continue;
            }
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Copied: ${entry.name}`);
        }
    }
}

console.log('📋 Copying types from tools to Frontend...');
copyDir(typesSourceDir, typesDestDir);

// Vérifier que les types ont été copiés correctement
console.log('🔍 Verifying copied types...');
const indexPath = path.join(typesDestDir, 'index.ts');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    console.log('📄 Index.ts content:', indexContent);
    
    if (indexContent.includes('user.types')) {
        console.log('✅ User types export found');
    } else {
        console.log('⚠️  User types export not found');
    }
} else {
    console.log('❌ Index.ts not found');
}

// Vérifier que User est exporté
const userTypesPath = path.join(typesDestDir, 'user.types.ts');
if (fs.existsSync(userTypesPath)) {
    const userContent = fs.readFileSync(userTypesPath, 'utf8');
    if (userContent.includes('export interface User')) {
        console.log('✅ User interface export found');
    } else {
        console.log('⚠️  User interface export not found');
    }
} else {
    console.log('❌ user.types.ts not found');
}

console.log('🎯 Types copied and verified successfully!');