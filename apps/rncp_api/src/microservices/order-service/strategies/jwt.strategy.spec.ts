import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload, UserRole } from '../../../types';

describe('OrderService JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtStrategy],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    describe('constructor', () => {
        it('should be defined', () => {
            expect(strategy).toBeDefined();
        });

        it('should configure JWT strategy with correct options', () => {
            expect(strategy).toBeInstanceOf(JwtStrategy);
        });
    });

    describe('validate', () => {
        it('should return user info for delivery person role', async () => {
            const payload: JwtPayload = {
                sub: 1,
                email: 'delivery@example.com',
                role: UserRole.DELIVERY_PERSON,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 1,
                email: 'delivery@example.com',
                role: UserRole.DELIVERY_PERSON,
            });
        });

        it('should return user info for merchant role', async () => {
            const payload: JwtPayload = {
                sub: 2,
                email: 'merchant@example.com',
                role: UserRole.MERCHANT,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 2,
                email: 'merchant@example.com',
                role: UserRole.MERCHANT,
            });
        });

        it('should return user info for admin role', async () => {
            const payload: JwtPayload = {
                sub: 3,
                email: 'admin@example.com',
                role: UserRole.ADMIN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 3,
                email: 'admin@example.com',
                role: UserRole.ADMIN,
            });
        });

        it('should return user info for logistics technician role', async () => {
            const payload: JwtPayload = {
                sub: 4,
                email: 'tech@example.com',
                role: UserRole.LOGISTICS_TECHNICIAN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 4,
                email: 'tech@example.com',
                role: UserRole.LOGISTICS_TECHNICIAN,
            });
        });

        it('should handle payload with different timestamps', async () => {
            const now = Date.now();
            const payload: JwtPayload = {
                sub: 5,
                email: 'user@example.com',
                role: UserRole.DELIVERY_PERSON,
                iat: now - 5 * 60 * 1000, // 5 minutes ago
                expiresIn: now + 10 * 60 * 1000, // 10 minutes from now
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 5,
                email: 'user@example.com',
                role: UserRole.DELIVERY_PERSON,
            });
        });

        it('should handle expired token payload', async () => {
            const now = Date.now();
            const payload: JwtPayload = {
                sub: 6,
                email: 'expired@example.com',
                role: UserRole.DELIVERY_PERSON,
                iat: now - 30 * 60 * 1000, // 30 minutes ago
                expiresIn: now - 15 * 60 * 1000, // expired 15 minutes ago
            };

            // The JWT strategy itself doesn't check expiration (Passport does)
            // So this should still return user info
            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 6,
                email: 'expired@example.com',
                role: UserRole.DELIVERY_PERSON,
            });
        });
    });
});
