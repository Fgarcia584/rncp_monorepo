import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

describe('GatewayController', () => {
    let controller: GatewayController;
    let gatewayService: GatewayService;

    const mockGatewayService = {
        proxyRequest: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GatewayController],
            providers: [
                {
                    provide: GatewayService,
                    useValue: mockGatewayService,
                },
            ],
        }).compile();

        controller = module.get<GatewayController>(GatewayController);
        gatewayService = module.get<GatewayService>(GatewayService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getHealth', () => {
        it('should return health status', () => {
            const result = controller.getHealth();

            expect(result).toEqual({
                status: 'ok',
                timestamp: expect.any(String),
                service: 'rncp-api-gateway',
                environment: expect.any(String),
            });

            // Verify timestamp is a valid ISO string
            expect(() => new Date(result.timestamp)).not.toThrow();
        });
    });

    describe('proxyAuth', () => {
        it('should proxy auth requests', async () => {
            const req = {
                method: 'POST',
                url: '/auth/login',
                body: { email: 'test@example.com', password: 'password' },
                headers: { 'content-type': 'application/json' },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn(),
            } as any;

            const mockResponse = {
                status: 200,
                data: { token: 'jwt-token' },
                headers: {},
            };

            mockGatewayService.proxyRequest.mockResolvedValue(mockResponse);

            await controller.proxyAuth(req, res);

            expect(mockGatewayService.proxyRequest).toHaveBeenCalledWith(
                'auth',
                'POST',
                '/auth/login',
                req.body,
                req.headers,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: 'jwt-token' });
        });
    });

    describe('proxyUsers', () => {
        it('should proxy users requests', async () => {
            const req = {
                method: 'GET',
                url: '/users/profile',
                headers: { authorization: 'Bearer token' },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn(),
            } as any;

            const mockResponse = {
                status: 200,
                data: { id: 1, name: 'John Doe' },
                headers: {},
            };

            mockGatewayService.proxyRequest.mockResolvedValue(mockResponse);

            await controller.proxyUsers(req, res);

            expect(mockGatewayService.proxyRequest).toHaveBeenCalledWith(
                'users',
                'GET',
                '/users/profile',
                undefined,
                req.headers,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'John Doe' });
        });
    });

    describe('proxyOrders', () => {
        it('should proxy orders requests', async () => {
            const req = {
                method: 'PUT',
                url: '/orders/123',
                body: { status: 'delivered' },
                headers: { authorization: 'Bearer token' },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn(),
            } as any;

            const mockResponse = {
                status: 200,
                data: { updated: true },
                headers: {},
            };

            mockGatewayService.proxyRequest.mockResolvedValue(mockResponse);

            await controller.proxyOrders(req, res);

            expect(mockGatewayService.proxyRequest).toHaveBeenCalledWith(
                'orders',
                'PUT',
                '/orders/123',
                req.body,
                req.headers,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ updated: true });
        });
    });

    describe('proxyGeo', () => {
        it('should proxy geo requests', async () => {
            const req = {
                method: 'POST',
                url: '/geo/geocode',
                body: { address: '1 rue de la Paix, Paris' },
                headers: { 'content-type': 'application/json' },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn(),
            } as any;

            const mockResponse = {
                status: 200,
                data: { latitude: 48.8566, longitude: 2.3522 },
                headers: {},
            };

            mockGatewayService.proxyRequest.mockResolvedValue(mockResponse);

            await controller.proxyGeo(req, res);

            expect(mockGatewayService.proxyRequest).toHaveBeenCalledWith(
                'geo',
                'POST',
                '/geo/geocode',
                req.body,
                req.headers,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ latitude: 48.8566, longitude: 2.3522 });
        });
    });

    describe('proxyTracking', () => {
        it('should proxy tracking requests', async () => {
            const req = {
                method: 'GET',
                url: '/tracking/order-123',
                headers: { authorization: 'Bearer token' },
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn(),
            } as any;

            const mockResponse = {
                status: 200,
                data: { orderId: 'order-123', location: { lat: 48.8566, lng: 2.3522 } },
                headers: {},
            };

            mockGatewayService.proxyRequest.mockResolvedValue(mockResponse);

            await controller.proxyTracking(req, res);

            expect(mockGatewayService.proxyRequest).toHaveBeenCalledWith(
                'tracking',
                'GET',
                '/tracking/order-123',
                undefined,
                req.headers,
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ orderId: 'order-123', location: { lat: 48.8566, lng: 2.3522 } });
        });
    });

    describe('error handling', () => {
        it('should handle service errors', async () => {
            const req = {
                method: 'GET',
                url: '/auth/profile',
                headers: {},
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn(),
            } as any;

            const error = {
                status: 401,
                message: 'Unauthorized',
                data: { error: 'Invalid token' },
            };

            mockGatewayService.proxyRequest.mockRejectedValue(error);

            await controller.proxyAuth(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        });

        it('should handle unknown errors', async () => {
            const req = {
                method: 'GET',
                url: '/users/profile',
                headers: {},
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn(),
            } as any;

            const error = new Error('Network error');

            mockGatewayService.proxyRequest.mockRejectedValue(error);

            await controller.proxyUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Network error' });
        });
    });
});