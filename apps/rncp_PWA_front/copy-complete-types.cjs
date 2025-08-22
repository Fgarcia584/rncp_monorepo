const fs = require('fs');
const path = require('path');

console.log('🚀 Copying complete types for Railway deployment...');

// Chemins source et destination
const typesSourceDir = path.resolve(__dirname, '../../tools/types');
const typesDestDir = path.resolve(__dirname, 'src/types');

console.log('📂 Source directory:', typesSourceDir);
console.log('📂 Destination directory:', typesDestDir);

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(typesDestDir)) {
    fs.mkdirSync(typesDestDir, { recursive: true });
}

// Types exacts copiés des fichiers source
const completeTypes = {
    'auth.types.ts': `import { UserRole } from './role.types';

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
}`,

    'user.types.ts': `import { UserRole } from './role.types';

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

    'order.types.ts': `export enum OrderStatus {
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
}`,

    'geolocation.types.ts': `// Types pour la géolocalisation et les routes Google Maps

export interface Coordinates {
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

// Types Google Maps Routes API
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
        value: number; // en mètres
    };
    duration: {
        text: string;
        value: number; // en secondes
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

// Types pour le tracking en temps réel
export interface DeliveryTracking {
    orderId: number;
    deliveryPersonId: number;
    currentPosition: Position;
    route?: GoogleRoute;
    estimatedArrivalTime?: Date;
    distanceToDestination?: number; // en mètres
    status: 'en_route_to_pickup' | 'at_pickup' | 'en_route_to_delivery' | 'at_delivery' | 'completed';
    lastUpdated: Date;
}

// Types pour les étapes de livraison
export interface DeliveryWaypoint {
    id: string;
    type: 'pickup' | 'delivery' | 'current_position';
    coordinates: Coordinates;
    address: string;
    orderId?: number;
    estimatedArrivalTime?: Date;
    actualArrivalTime?: Date;
    status: 'pending' | 'arrived' | 'completed';
    instructions?: string;
}

// Types pour l'optimisation de route
export interface OptimizedRoute {
    waypoints: DeliveryWaypoint[];
    totalDistance: number; // en mètres
    totalDuration: number; // en secondes
    totalDurationInTraffic?: number; // en secondes avec trafic
    googleRoute: GoogleRoute;
    optimizationApplied: boolean;
    createdAt: Date;
}

// Types pour les événements WebSocket
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

// Types pour la configuration des cartes
export interface MapConfiguration {
    defaultCenter: Coordinates;
    defaultZoom: number;
    maxZoom: number;
    minZoom: number;
    tileLayer: {
        url: string;
        attribution: string;
    };
    googleMapsApiKey?: string;
}

// Types pour les marqueurs personnalisés
export interface MapMarkerProps {
    position: Coordinates;
    type: 'delivery_person' | 'pickup' | 'delivery' | 'merchant';
    status?: string;
    tooltip?: string;
    onClick?: () => void;
    customIcon?: string;
}

// Types pour les contrôles de carte
export interface MapControlsProps {
    showCurrentLocation?: boolean;
    showFullScreen?: boolean;
    showLayerControl?: boolean;
    showRouteControl?: boolean;
}

// Types pour l'API Distance Matrix de Google
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

// Types pour le géocodage
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
}`,

    'index.ts': `export * from './auth.types';
export * from './user.types';
export * from './role.types';
export * from './order.types';
export * from './geolocation.types';`
};

// Si le répertoire source existe, tenter de copier depuis là
if (fs.existsSync(typesSourceDir)) {
    console.log('📋 Source directory found, copying from monorepo...');
    
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
                console.log(`✅ Copied from source: ${entry.name}`);
            }
        }
    }
    
    copyDir(typesSourceDir, typesDestDir);
} else {
    console.log('🔧 Source directory not found, using complete fallback types...');
    
    // Créer les types complets
    for (const [filename, content] of Object.entries(completeTypes)) {
        fs.writeFileSync(path.join(typesDestDir, filename), content);
        console.log(`✅ Created complete type file: ${filename}`);
    }
}

// Vérifier que les types critiques sont présents
console.log('🔍 Verifying critical types...');
const indexPath = path.join(typesDestDir, 'index.ts');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    console.log('📄 Index.ts content:', indexContent);
} else {
    console.log('❌ Index.ts not found');
}

// Vérifier les types spécifiques qui posaient problème
const criticalTypes = [
    { file: 'user.types.ts', search: 'export interface User' },
    { file: 'order.types.ts', search: 'export enum OrderStatus' },
    { file: 'order.types.ts', search: 'export enum OrderPriority' },
    { file: 'order.types.ts', search: 'export interface OrderResponse' },
    { file: 'order.types.ts', search: 'export interface OrdersListResponse' },
    { file: 'order.types.ts', search: 'export interface CreateOrderRequest' },
    { file: 'geolocation.types.ts', search: 'export interface GeocodingResponse' },
    { file: 'geolocation.types.ts', search: 'export interface DistanceMatrixRequest' },
    { file: 'geolocation.types.ts', search: 'export interface DistanceMatrixResponse' },
    { file: 'geolocation.types.ts', search: 'export interface Coordinates' }
];

for (const { file, search } of criticalTypes) {
    const filePath = path.join(typesDestDir, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(search)) {
            console.log(`✅ Found: ${search} in ${file}`);
        } else {
            console.log(`⚠️  Missing: ${search} in ${file}`);
        }
    } else {
        console.log(`❌ File not found: ${file}`);
    }
}

console.log('🎯 Complete types setup finished!');