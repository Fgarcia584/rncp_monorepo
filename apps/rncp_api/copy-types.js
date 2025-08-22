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

// Re-export commonly used types for backward compatibility
export type { Coordinates, Position, TravelModeType } from './geo.types';
export type { GoogleRouteRequest, GoogleRouteResponse } from './geo.types';
export type { GeocodingRequest, GeocodingResponse } from './geo.types';
export type { DistanceMatrixRequest, DistanceMatrixResponse } from './geo.types';
export type { DeliveryTracking, DeliveryTrackingEvent } from './geo.types';
`;

    // Create role.types.ts
    const roleTypesContent = `export enum UserRole {
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
    const orderTypesContent = `export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    IN_TRANSIT = 'in_transit',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum DeliveryStatus {
    EN_ROUTE_TO_PICKUP = 'en_route_to_pickup',
    AT_PICKUP = 'at_pickup',
    PICKED_UP = 'picked_up',
    EN_ROUTE_TO_DELIVERY = 'en_route_to_delivery',
    AT_DELIVERY = 'at_delivery',
    DELIVERED = 'delivered',
}

export enum OrderPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface Order {
    id: number;
    merchantId: number;
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    merchantAddress?: string;
    merchantCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime: Date;
    status: OrderStatus;
    deliveryStatus?: DeliveryStatus;
    priority: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number;
    actualDeliveryDuration?: number;
    distanceKm?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderRequest {
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime: Date;
    priority?: OrderPriority;
    notes?: string;
    estimatedDeliveryDuration?: number;
}

export interface UpdateOrderRequest {
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime?: Date;
    status?: OrderStatus;
    deliveryStatus?: DeliveryStatus;
    priority?: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number;
    actualDeliveryDuration?: number;
    distanceKm?: number;
}

export interface OrderResponse {
    id: number;
    merchantId: number;
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    merchantAddress?: string;
    merchantCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime: Date;
    status: OrderStatus;
    deliveryStatus?: DeliveryStatus;
    priority: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number;
    actualDeliveryDuration?: number;
    distanceKm?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrdersListResponse {
    orders: OrderResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface OrderFilters {
    status?: OrderStatus;
    priority?: OrderPriority;
    merchantId?: number;
    deliveryPersonId?: number;
    startDate?: Date;
    endDate?: Date;
}
`;

    // Create geo.types.ts
    const geoTypesContent = `export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Position extends Coordinates {
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
}

export type TravelModeType = 'driving' | 'walking' | 'bicycling' | 'transit';

export interface GoogleRouteRequest {
    origin: Coordinates;
    destination: Coordinates;
    waypoints?: Coordinates[];
    optimizeWaypoints?: boolean;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
    travelMode?: TravelModeType;
}

export interface GoogleRouteStep {
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    endLocation: Coordinates;
    startLocation: Coordinates;
    htmlInstructions: string;
    polyline: {
        points: string;
    };
    travelMode: string;
    maneuver?: string;
}

export interface GoogleRouteLeg {
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    durationInTraffic?: {
        text: string;
        value: number;
    };
    endAddress: string;
    endLocation: Coordinates;
    startAddress: string;
    startLocation: Coordinates;
    steps: GoogleRouteStep[];
}

export interface GoogleRoute {
    bounds: {
        northeast: Coordinates;
        southwest: Coordinates;
    };
    legs: GoogleRouteLeg[];
    overviewPolyline: {
        points: string;
    };
    summary: string;
    warnings: string[];
    waypointOrder: number[];
}

export interface GoogleRouteResponse {
    geocodedWaypoints: Array<{
        geocoderStatus: string;
        placeId: string;
        types: string[];
    }>;
    routes: GoogleRoute[];
    status: string;
}

export interface DeliveryTracking {
    orderId: number;
    deliveryPersonId: number;
    currentPosition: Position;
    route?: GoogleRoute;
    estimatedArrivalTime?: Date;
    distanceToDestination?: number;
    status: 'en_route_to_pickup' | 'at_pickup' | 'en_route_to_delivery' | 'at_delivery' | 'completed';
    lastUpdated: Date;
}

export interface DeliveryTrackingEvent {
    type: 'position_update' | 'status_change' | 'eta_update' | 'route_recalculated';
    orderId: number;
    deliveryPersonId: number;
    data: {
        position?: Position;
        status?: DeliveryTracking['status'];
        estimatedArrivalTime?: Date;
        route?: GoogleRoute;
    };
    timestamp: Date;
}

export interface DistanceMatrixRequest {
    origins: Coordinates[];
    destinations: Coordinates[];
    travelMode?: TravelModeType;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
    units?: 'metric' | 'imperial';
}

export interface DistanceMatrixElement {
    distance: {
        text: string;
        value: number;
    };
    duration: {
        text: string;
        value: number;
    };
    durationInTraffic?: {
        text: string;
        value: number;
    };
    status: string;
}

export interface DistanceMatrixResponse {
    destinationAddresses: string[];
    originAddresses: string[];
    rows: Array<{
        elements: DistanceMatrixElement[];
    }>;
    status: string;
}

export interface GeocodingRequest {
    address?: string;
    coordinates?: Coordinates;
    language?: string;
    region?: string;
}

export interface GeocodingResult {
    addressComponents: Array<{
        longName: string;
        shortName: string;
        types: string[];
    }>;
    formattedAddress: string;
    geometry: {
        location: Coordinates;
        locationType: string;
        viewport: {
            northeast: Coordinates;
            southwest: Coordinates;
        };
    };
    placeId: string;
    types: string[];
}

export interface GeocodingResponse {
    results: GeocodingResult[];
    status: string;
}

export interface GeoLocation {
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

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
}

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
