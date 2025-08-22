import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    Client,
    DirectionsRequest,
    DirectionsResponse,
    GeocodeRequest,
    GeocodeResponse,
    DistanceMatrixRequest,
    DistanceMatrixResponse,
    TravelMode,
    UnitSystem,
    TravelRestriction,
} from '@googlemaps/google-maps-services-js';
import {
    Coordinates,
    GoogleRouteRequest,
    GoogleRouteResponse,
    GeocodingRequest,
    GeocodingResponse,
    DistanceMatrixRequest as CustomDistanceMatrixRequest,
    DistanceMatrixResponse as CustomDistanceMatrixResponse,
    TravelModeType,
} from '../../types';

@Injectable()
export class GeoService {
    private readonly logger = new Logger(GeoService.name);
    private readonly googleMapsClient: Client;
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey =
            this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
        this.googleMapsClient = new Client({});

        if (!this.apiKey) {
            this.logger.warn(
                'Google Maps API key not configured. Some features may not work properly.',
            );
        }
    }

    /**
     * Calcule un itinéraire optimisé avec l'API Google Directions
     */
    async calculateOptimizedRoute(
        request: GoogleRouteRequest,
    ): Promise<GoogleRouteResponse> {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        try {
            const directionsRequest: DirectionsRequest = {
                params: {
                    origin: `${request.origin.latitude},${request.origin.longitude}`,
                    destination: `${request.destination.latitude},${request.destination.longitude}`,
                    key: this.apiKey,
                    mode:
                        this.convertTravelMode(request.travelMode) ||
                        TravelMode.driving,
                    optimize: request.optimizeWaypoints || false,
                    avoid: this.buildAvoidanceParams(request),
                    departure_time: 'now', // Pour le trafic en temps réel
                },
            };

            // Ajout des points intermédiaires si présents
            if (request.waypoints && request.waypoints.length > 0) {
                directionsRequest.params.waypoints = request.waypoints.map(
                    (wp) => ({ lat: wp.latitude, lng: wp.longitude }),
                );
                directionsRequest.params.optimize =
                    request.optimizeWaypoints || false;
            }

            const response: DirectionsResponse =
                await this.googleMapsClient.directions(directionsRequest);

            return this.transformGoogleDirectionsResponse(response.data);
        } catch (error) {
            this.logger.error(
                'Error calculating route with Google Maps API',
                error,
            );
            throw new Error(`Failed to calculate route: ${error.message}`);
        }
    }

    /**
     * Géocode une adresse en coordonnées
     */
    async geocodeAddress(
        request: GeocodingRequest,
    ): Promise<GeocodingResponse> {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        try {
            const geocodeRequest: GeocodeRequest = {
                params: {
                    key: this.apiKey,
                },
            };

            if (request.address) {
                geocodeRequest.params.address = request.address;
            } else if (request.coordinates) {
                // Pour le géocodage inverse, utiliser une requête séparée avec reverseGeocode
                const reverseGeocodeRequest = {
                    params: {
                        latlng: {
                            lat: request.coordinates.latitude,
                            lng: request.coordinates.longitude,
                        },
                        key: this.apiKey,
                    },
                };
                const response: GeocodeResponse =
                    await this.googleMapsClient.reverseGeocode(
                        reverseGeocodeRequest,
                    );
                return this.transformGoogleGeocodeResponse(response.data);
            } else {
                throw new Error(
                    'Either address or coordinates must be provided',
                );
            }

            if (request.language) {
                geocodeRequest.params.language = request.language;
            }

            if (request.region) {
                geocodeRequest.params.region = request.region;
            }

            const response: GeocodeResponse =
                await this.googleMapsClient.geocode(geocodeRequest);

            return this.transformGoogleGeocodeResponse(response.data);
        } catch (error) {
            this.logger.error('Error geocoding with Google Maps API', error);
            throw new Error(`Failed to geocode: ${error.message}`);
        }
    }

    /**
     * Calcule les distances et durées entre plusieurs points
     */
    async calculateDistanceMatrix(
        request: CustomDistanceMatrixRequest,
    ): Promise<CustomDistanceMatrixResponse> {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        try {
            const distanceMatrixRequest: DistanceMatrixRequest = {
                params: {
                    origins: request.origins.map((coord) => ({
                        lat: coord.latitude,
                        lng: coord.longitude,
                    })),
                    destinations: request.destinations.map((coord) => ({
                        lat: coord.latitude,
                        lng: coord.longitude,
                    })),
                    key: this.apiKey,
                    mode:
                        this.convertTravelMode(request.travelMode) ||
                        TravelMode.driving,
                    units: (request.units as UnitSystem) || UnitSystem.metric,
                    avoid: this.buildAvoidanceParams(request),
                    departure_time: new Date(), // Pour les durées avec trafic
                },
            };

            const response: DistanceMatrixResponse =
                await this.googleMapsClient.distancematrix(
                    distanceMatrixRequest,
                );

            return this.transformGoogleDistanceMatrixResponse(response.data);
        } catch (error) {
            this.logger.error(
                'Error calculating distance matrix with Google Maps API',
                error,
            );
            throw new Error(
                `Failed to calculate distance matrix: ${error.message}`,
            );
        }
    }

    /**
     * Valide et nettoie une adresse
     */
    async validateAddress(address: string): Promise<{
        isValid: boolean;
        formattedAddress?: string;
        coordinates?: Coordinates;
    }> {
        try {
            const result = await this.geocodeAddress({ address });

            if (result.results && result.results.length > 0) {
                const firstResult = result.results[0];
                return {
                    isValid: true,
                    formattedAddress: firstResult.formattedAddress,
                    coordinates: firstResult.geometry.location,
                };
            }

            return { isValid: false };
        } catch (error) {
            this.logger.error('Error validating address', error);
            return { isValid: false };
        }
    }

    /**
     * Calcule l'ETA entre deux points en tenant compte du trafic
     */
    async calculateETA(
        from: Coordinates,
        to: Coordinates,
    ): Promise<{
        durationMinutes: number;
        durationWithTrafficMinutes?: number;
        distanceKm: number;
    }> {
        try {
            const result = await this.calculateDistanceMatrix({
                origins: [from],
                destinations: [to],
                travelMode: 'driving',
            });

            if (
                result.rows &&
                result.rows.length > 0 &&
                result.rows[0].elements.length > 0
            ) {
                const element = result.rows[0].elements[0];

                return {
                    durationMinutes: Math.round(element.duration.value / 60),
                    durationWithTrafficMinutes: element.durationInTraffic
                        ? Math.round(element.durationInTraffic.value / 60)
                        : undefined,
                    distanceKm:
                        Math.round((element.distance.value / 1000) * 100) / 100, // Arrondi à 2 décimales
                };
            }

            throw new Error('No results from distance matrix');
        } catch (error) {
            this.logger.error('Error calculating ETA', error);
            throw new Error(`Failed to calculate ETA: ${error.message}`);
        }
    }

    /**
     * Construit les paramètres d'évitement pour Google Maps
     */
    private buildAvoidanceParams(request): TravelRestriction[] {
        const avoid: TravelRestriction[] = [];
        if (request.avoidTolls) avoid.push(TravelRestriction.tolls);
        if (request.avoidHighways) avoid.push(TravelRestriction.highways);
        if (request.avoidFerries) avoid.push(TravelRestriction.ferries);
        return avoid;
    }

    /**
     * Convertit notre type TravelModeType vers l'enum TravelMode de Google Maps
     */
    private convertTravelMode(mode?: TravelModeType): TravelMode | undefined {
        if (!mode) return undefined;

        switch (mode) {
            case 'driving':
                return TravelMode.driving;
            case 'walking':
                return TravelMode.walking;
            case 'bicycling':
                return TravelMode.bicycling;
            case 'transit':
                return TravelMode.transit;
            default:
                return TravelMode.driving;
        }
    }

    /**
     * Transforme la réponse Google Directions en format personnalisé
     */
    private transformGoogleDirectionsResponse(
        googleResponse,
    ): GoogleRouteResponse {
        return {
            geocodedWaypoints: googleResponse.geocoded_waypoints,
            routes: googleResponse.routes.map((route) => ({
                bounds: {
                    northeast: route.bounds.northeast,
                    southwest: route.bounds.southwest,
                },
                legs: route.legs.map((leg) => ({
                    distance: leg.distance,
                    duration: leg.duration,
                    durationInTraffic: leg.duration_in_traffic,
                    endAddress: leg.end_address,
                    endLocation: leg.end_location,
                    startAddress: leg.start_address,
                    startLocation: leg.start_location,
                    steps: leg.steps.map((step) => ({
                        distance: step.distance,
                        duration: step.duration,
                        endLocation: step.end_location,
                        startLocation: step.start_location,
                        htmlInstructions: step.html_instructions,
                        polyline: step.polyline,
                        travelMode: step.travel_mode,
                        maneuver: step.maneuver,
                    })),
                })),
                overviewPolyline: route.overview_polyline,
                summary: route.summary,
                warnings: route.warnings,
                waypointOrder: route.waypoint_order,
            })),
            status: googleResponse.status,
        };
    }

    /**
     * Transforme la réponse Google Geocode en format personnalisé
     */
    private transformGoogleGeocodeResponse(googleResponse): GeocodingResponse {
        return {
            results: googleResponse.results.map((result) => ({
                addressComponents: result.address_components,
                formattedAddress: result.formatted_address,
                geometry: {
                    location: result.geometry.location,
                    locationType: result.geometry.location_type,
                    viewport: result.geometry.viewport,
                },
                placeId: result.place_id,
                types: result.types,
            })),
            status: googleResponse.status,
        };
    }

    /**
     * Transforme la réponse Google Distance Matrix en format personnalisé
     */
    private transformGoogleDistanceMatrixResponse(
        googleResponse,
    ): CustomDistanceMatrixResponse {
        return {
            destinationAddresses: googleResponse.destination_addresses,
            originAddresses: googleResponse.origin_addresses,
            rows: googleResponse.rows.map((row) => ({
                elements: row.elements.map((element) => ({
                    distance: element.distance,
                    duration: element.duration,
                    durationInTraffic: element.duration_in_traffic,
                    status: element.status,
                })),
            })),
            status: googleResponse.status,
        };
    }
}
