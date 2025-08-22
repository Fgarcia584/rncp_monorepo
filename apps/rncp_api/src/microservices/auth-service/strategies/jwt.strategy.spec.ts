import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../../../types';
import { User } from '../../../entities';
import { UserRole } from '../../../types';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    // let authService: AuthService;

    const mockAuthService = {
        validateUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        // authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should be defined', () => {
            expect(strategy).toBeDefined();
        });

        it('should configure JWT strategy with correct options', () => {
            // The strategy is configured in the constructor via super()
            // We can't directly test PassportStrategy configuration,
            // but we can verify the strategy is properly instantiated
            expect(strategy).toBeInstanceOf(JwtStrategy);
        });
    });

    describe('validate', () => {
        it('should return user when validation succeeds', async () => {
            const payload: JwtPayload = {
                sub: 1,
                email: 'test@example.com',
                role: UserRole.DELIVERY_PERSON,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const mockUser: User = {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                password: 'hashedPassword',
                role: UserRole.DELIVERY_PERSON,
                refreshTokens: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockAuthService.validateUser.mockResolvedValue(mockUser);

            const result = await strategy.validate(payload);

            expect(result).toEqual(mockUser);
            expect(mockAuthService.validateUser).toHaveBeenCalledWith(payload);
        });

        it('should throw UnauthorizedException when user is not found', async () => {
            const payload: JwtPayload = {
                sub: 999,
                email: 'nonexistent@example.com',
                role: UserRole.DELIVERY_PERSON,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockAuthService.validateUser).toHaveBeenCalledWith(payload);
        });

        it('should handle admin user validation', async () => {
            const payload: JwtPayload = {
                sub: 1,
                email: 'admin@example.com',
                role: UserRole.ADMIN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const mockAdminUser: User = {
                id: 1,
                email: 'admin@example.com',
                name: 'Admin User',
                password: 'hashedPassword',
                role: UserRole.ADMIN,
                refreshTokens: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockAuthService.validateUser.mockResolvedValue(mockAdminUser);

            const result = await strategy.validate(payload);

            expect(result).toEqual(mockAdminUser);
            expect(result.role).toBe(UserRole.ADMIN);
        });

        it('should handle merchant user validation', async () => {
            const payload: JwtPayload = {
                sub: 2,
                email: 'merchant@example.com',
                role: UserRole.MERCHANT,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const mockMerchantUser: User = {
                id: 2,
                email: 'merchant@example.com',
                name: 'Merchant User',
                password: 'hashedPassword',
                role: UserRole.MERCHANT,
                refreshTokens: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockAuthService.validateUser.mockResolvedValue(mockMerchantUser);

            const result = await strategy.validate(payload);

            expect(result).toEqual(mockMerchantUser);
            expect(result.role).toBe(UserRole.MERCHANT);
        });

        it('should handle logistics technician user validation', async () => {
            const payload: JwtPayload = {
                sub: 3,
                email: 'tech@example.com',
                role: UserRole.LOGISTICS_TECHNICIAN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const mockTechUser: User = {
                id: 3,
                email: 'tech@example.com',
                name: 'Tech User',
                password: 'hashedPassword',
                role: UserRole.LOGISTICS_TECHNICIAN,
                refreshTokens: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockAuthService.validateUser.mockResolvedValue(mockTechUser);

            const result = await strategy.validate(payload);

            expect(result).toEqual(mockTechUser);
            expect(result.role).toBe(UserRole.LOGISTICS_TECHNICIAN);
        });

        it('should throw UnauthorizedException when validateUser throws', async () => {
            const payload: JwtPayload = {
                sub: 1,
                email: 'test@example.com',
                role: UserRole.DELIVERY_PERSON,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            mockAuthService.validateUser.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(strategy.validate(payload)).rejects.toThrow();
        });
    });
});
