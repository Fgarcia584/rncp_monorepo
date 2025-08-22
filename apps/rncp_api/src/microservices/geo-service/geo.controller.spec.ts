import { Test, TestingModule } from '@nestjs/testing';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GeoController', () => {
    let controller: GeoController;
    // let geoService: GeoService;

    const mockGeoService = {
        calculateOptimizedRoute: jest.fn(),
        geocodeAddress: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GeoController],
            providers: [
                {
                    provide: GeoService,
                    useValue: mockGeoService,
                },
            ],
        }).compile();

        controller = module.get<GeoController>(GeoController);
        // geoService = module.get<GeoService>(GeoService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('calculateRoute', () => {
        it('should calculate route successfully', async () => {
            const request = {
                origin: { latitude: 48.8566, longitude: 2.3522 },
                destination: { latitude: 48.8584, longitude: 2.2945 },
                waypoints: [],
                optimize: true,
                avoid: [],
            };

            const mockResponse = {
                success: true,
                route: {
                    distance: 5000,
                    duration: 600,
                    polyline: 'encodedPolyline',
                    waypoints: [],
                    optimizedOrder: [],
                },
            };

            mockGeoService.calculateOptimizedRoute.mockResolvedValue(
                mockResponse,
            );

            const result = await controller.calculateRoute(request);

            expect(result).toEqual(mockResponse);
            expect(mockGeoService.calculateOptimizedRoute).toHaveBeenCalledWith(
                request,
            );
        });

        it('should handle service errors', async () => {
            const request = {
                origin: { latitude: 48.8566, longitude: 2.3522 },
                destination: { latitude: 48.8584, longitude: 2.2945 },
                waypoints: [],
                optimize: false,
                avoid: [],
            };

            mockGeoService.calculateOptimizedRoute.mockRejectedValue(
                new Error('Service error'),
            );

            await expect(controller.calculateRoute(request)).rejects.toThrow(
                HttpException,
            );
        });
    });

    describe('geocode', () => {
        it('should geocode address successfully', async () => {
            const request = {
                address: '1 rue de la Paix, Paris',
            };

            const mockResponse = {
                success: true,
                location: {
                    latitude: 48.8566,
                    longitude: 2.3522,
                    formattedAddress: '1 Rue de la Paix, 75002 Paris, France',
                    placeId: 'test-place-id',
                },
            };

            mockGeoService.geocodeAddress.mockResolvedValue(mockResponse);

            const result = await controller.geocode(request);

            expect(result).toEqual(mockResponse);
            expect(mockGeoService.geocodeAddress).toHaveBeenCalledWith(request);
        });

        it('should handle geocoding errors', async () => {
            const request = {
                address: 'Invalid Address',
            };

            mockGeoService.geocodeAddress.mockRejectedValue(
                new Error('Geocoding failed'),
            );

            await expect(controller.geocode(request)).rejects.toThrow(
                HttpException,
            );
        });
    });

    describe('geocodeAddress', () => {
        it('should geocode address by query param successfully', async () => {
            const address = '1 rue de la Paix, Paris';
            const mockResponse = {
                success: true,
                location: {
                    latitude: 48.8566,
                    longitude: 2.3522,
                    formattedAddress: '1 Rue de la Paix, 75002 Paris, France',
                    placeId: 'test-place-id',
                },
            };

            mockGeoService.geocodeAddress.mockResolvedValue(mockResponse);

            const result = await controller.geocodeAddress(address);

            expect(result).toEqual(mockResponse);
            expect(mockGeoService.geocodeAddress).toHaveBeenCalledWith({
                address,
            });
        });

        it('should throw error for missing address', async () => {
            await expect(controller.geocodeAddress('')).rejects.toThrow(
                new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: 'Address is required',
                    },
                    HttpStatus.BAD_REQUEST,
                ),
            );
        });
    });

    describe('reverseGeocode', () => {
        it('should reverse geocode coordinates successfully', async () => {
            const lat = '48.8566';
            const lng = '2.3522';
            const mockResponse = {
                success: true,
                location: {
                    latitude: 48.8566,
                    longitude: 2.3522,
                    formattedAddress: 'Paris, France',
                    placeId: 'test-place-id',
                },
            };

            mockGeoService.geocodeAddress.mockResolvedValue(mockResponse);

            const result = await controller.reverseGeocode(lat, lng);

            expect(result).toEqual(mockResponse);
            expect(mockGeoService.geocodeAddress).toHaveBeenCalledWith({
                coordinates: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                },
            });
        });

        it('should throw error for missing coordinates', async () => {
            await expect(
                controller.reverseGeocode('', '2.3522'),
            ).rejects.toThrow(
                new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: 'Latitude and longitude are required',
                    },
                    HttpStatus.BAD_REQUEST,
                ),
            );
        });
    });

    describe('getHealth', () => {
        it('should return health status', () => {
            const result = controller.getHealth();

            expect(result).toEqual({
                status: 'ok',
                timestamp: expect.any(String),
            });

            // Verify timestamp is a valid ISO string
            expect(() => new Date(result.timestamp)).not.toThrow();
        });
    });
});
