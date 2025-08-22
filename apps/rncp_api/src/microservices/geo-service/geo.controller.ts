import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import {
    GoogleRouteRequest,
    GoogleRouteResponse,
    GeocodingRequest,
    GeocodingResponse,
    DistanceMatrixRequest,
    DistanceMatrixResponse,
    Coordinates,
} from '../../types';

@Controller('geo')
export class GeoController {
    constructor(private readonly geoService: GeoService) {}

    @Post('route')
    async calculateRoute(
        @Body() request: GoogleRouteRequest,
    ): Promise<GoogleRouteResponse> {
        try {
            return await this.geoService.calculateOptimizedRoute(request);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Route calculation failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('route/optimized')
    async calculateOptimizedDeliveryRoute(
        @Body()
        body: {
            deliveryPersonLocation: Coordinates;
            pickupLocation: Coordinates;
            deliveryLocation: Coordinates;
        },
    ): Promise<GoogleRouteResponse> {
        try {
            const request: GoogleRouteRequest = {
                origin: body.deliveryPersonLocation,
                destination: body.deliveryLocation,
                waypoints: [body.pickupLocation],
                optimizeWaypoints: true,
                travelMode: 'driving',
            };

            return await this.geoService.calculateOptimizedRoute(request);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Optimized route calculation failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('geocode')
    async geocode(
        @Body() request: GeocodingRequest,
    ): Promise<GeocodingResponse> {
        try {
            return await this.geoService.geocodeAddress(request);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Geocoding failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('geocode/address')
    async geocodeAddress(
        @Query('address') address: string,
    ): Promise<GeocodingResponse> {
        if (!address) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Address is required',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            return await this.geoService.geocodeAddress({ address });
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Address geocoding failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('geocode/coordinates')
    async reverseGeocode(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
    ): Promise<GeocodingResponse> {
        if (!lat || !lng) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Latitude and longitude are required',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const coordinates: Coordinates = {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
            };

            return await this.geoService.geocodeAddress({ coordinates });
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Reverse geocoding failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('distance-matrix')
    async calculateDistanceMatrix(
        @Body() request: DistanceMatrixRequest,
    ): Promise<DistanceMatrixResponse> {
        try {
            return await this.geoService.calculateDistanceMatrix(request);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Distance matrix calculation failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('validate-address')
    async validateAddress(@Body('address') address: string): Promise<{
        isValid: boolean;
        formattedAddress?: string;
        coordinates?: Coordinates;
    }> {
        if (!address) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Address is required',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            return await this.geoService.validateAddress(address);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Address validation failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('eta')
    async calculateETA(
        @Body() body: { from: Coordinates; to: Coordinates },
    ): Promise<{
        durationMinutes: number;
        durationWithTrafficMinutes?: number;
        distanceKm: number;
    }> {
        if (!body.from || !body.to) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'From and to coordinates are required',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            return await this.geoService.calculateETA(body.from, body.to);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'ETA calculation failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('health')
    getHealth(): { 
        status: string; 
        service: string;
        timestamp: string;
        version: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        dependencies: { googleMaps: string; redis: string };
    } {
        return {
            status: 'healthy',
            service: 'geo-service',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            dependencies: {
                googleMaps: process.env.GOOGLE_MAPS_API_KEY ? 'healthy' : 'warning',
                redis: 'healthy'
            }
        };
    }
}
