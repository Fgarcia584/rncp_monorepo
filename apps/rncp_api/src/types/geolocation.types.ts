// Types pour la géolocalisation et les routes Google Maps

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
    status:
        | 'en_route_to_pickup'
        | 'at_pickup'
        | 'en_route_to_delivery'
        | 'at_delivery'
        | 'completed';
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
    type:
        | 'position_update'
        | 'status_change'
        | 'eta_update'
        | 'route_recalculated';
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
}
