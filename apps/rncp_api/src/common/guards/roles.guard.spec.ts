import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole, JwtPayload } from '../../types';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;
    let mockExecutionContext: Partial<ExecutionContext>;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);

        mockExecutionContext = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn(),
            }),
        };
    });

    describe('canActivate', () => {
        it('should allow access when no roles are required', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(
                undefined,
            );

            const result = guard.canActivate(
                mockExecutionContext as ExecutionContext,
            );

            expect(result).toBe(true);
        });

        it('should deny access when user is not present', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                UserRole.ADMIN,
            ]);
            const mockRequest = { user: null };
            (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
                getRequest: () => mockRequest,
            });

            const result = guard.canActivate(
                mockExecutionContext as ExecutionContext,
            );

            expect(result).toBe(false);
        });

        it('should allow access for admin users to any endpoint', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                UserRole.MERCHANT,
            ]);
            const mockUser: JwtPayload = {
                sub: 1,
                email: 'admin@test.com',
                role: UserRole.ADMIN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };
            const mockRequest = { user: mockUser };
            (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
                getRequest: () => mockRequest,
            });

            const result = guard.canActivate(
                mockExecutionContext as ExecutionContext,
            );

            expect(result).toBe(true);
        });

        it('should allow access when user role matches required role', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                UserRole.MERCHANT,
            ]);
            const mockUser: JwtPayload = {
                sub: 1,
                email: 'merchant@test.com',
                role: UserRole.MERCHANT,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };
            const mockRequest = { user: mockUser };
            (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
                getRequest: () => mockRequest,
            });

            const result = guard.canActivate(
                mockExecutionContext as ExecutionContext,
            );

            expect(result).toBe(true);
        });

        it('should allow access when user role is in the required roles array', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                UserRole.MERCHANT,
                UserRole.LOGISTICS_TECHNICIAN,
            ]);
            const mockUser: JwtPayload = {
                sub: 1,
                email: 'logistics@test.com',
                role: UserRole.LOGISTICS_TECHNICIAN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };
            const mockRequest = { user: mockUser };
            (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
                getRequest: () => mockRequest,
            });

            const result = guard.canActivate(
                mockExecutionContext as ExecutionContext,
            );

            expect(result).toBe(true);
        });

        it('should deny access when user role does not match required roles', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                UserRole.ADMIN,
            ]);
            const mockUser: JwtPayload = {
                sub: 1,
                email: 'delivery@test.com',
                role: UserRole.DELIVERY_PERSON,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };
            const mockRequest = { user: mockUser };
            (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
                getRequest: () => mockRequest,
            });

            const result = guard.canActivate(
                mockExecutionContext as ExecutionContext,
            );

            expect(result).toBe(false);
        });

        it('should properly call reflector with correct parameters', () => {
            const getAllAndOverrideSpy = jest.spyOn(
                reflector,
                'getAllAndOverride',
            );
            const mockHandler = jest.fn();
            const mockClass = jest.fn();
            const mockUser: JwtPayload = {
                sub: 1,
                email: 'test@example.com',
                role: UserRole.ADMIN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            mockExecutionContext.getHandler = jest
                .fn()
                .mockReturnValue(mockHandler);
            mockExecutionContext.getClass = jest
                .fn()
                .mockReturnValue(mockClass);
            (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
                getRequest: () => ({ user: mockUser }),
            });

            getAllAndOverrideSpy.mockReturnValue([UserRole.ADMIN]);

            guard.canActivate(mockExecutionContext as ExecutionContext);

            expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
                mockHandler,
                mockClass,
            ]);
        });
    });
});
