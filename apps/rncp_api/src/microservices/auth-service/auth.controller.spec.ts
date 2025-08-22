import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResponse, TokenPair, AuthUser } from '../../types';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;

    const mockAuthResponse: AuthResponse = {
        user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
        } as AuthUser,
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
    };

    const mockTokenPair: TokenPair = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        register: jest.fn(),
                        login: jest.fn(),
                        refresh: jest.fn(),
                        logout: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            email: 'newuser@example.com',
            password: 'password123',
            name: 'New User',
        };

        it('should successfully register a user', async () => {
            // Arrange
            authService.register.mockResolvedValue(mockAuthResponse);

            // Act
            const result = await controller.register(registerDto);

            // Assert
            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual(mockAuthResponse);
        });

        it('should throw error if registration fails', async () => {
            // Arrange
            const error = new Error('Registration failed');
            authService.register.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.register(registerDto)).rejects.toThrow(
                error,
            );
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should successfully login a user', async () => {
            // Arrange
            authService.login.mockResolvedValue(mockAuthResponse);

            // Act
            const result = await controller.login(loginDto);

            // Assert
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(mockAuthResponse);
        });

        it('should throw error if login fails', async () => {
            // Arrange
            const error = new Error('Login failed');
            authService.login.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.login(loginDto)).rejects.toThrow(error);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('refresh', () => {
        const refreshTokenDto: RefreshTokenDto = {
            refreshToken: 'refresh_token_123',
        };

        it('should successfully refresh tokens', async () => {
            // Arrange
            authService.refresh.mockResolvedValue(mockTokenPair);

            // Act
            const result = await controller.refresh(refreshTokenDto);

            // Assert
            expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto);
            expect(result).toEqual(mockTokenPair);
        });

        it('should throw error if refresh fails', async () => {
            // Arrange
            const error = new Error('Refresh failed');
            authService.refresh.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
                error,
            );
            expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto);
        });
    });

    describe('logout', () => {
        const refreshTokenDto: RefreshTokenDto = {
            refreshToken: 'refresh_token_123',
        };

        it('should successfully logout', async () => {
            // Arrange
            authService.logout.mockResolvedValue(undefined);

            // Act
            await controller.logout(refreshTokenDto);

            // Assert
            expect(authService.logout).toHaveBeenCalledWith(
                refreshTokenDto.refreshToken,
            );
        });

        it('should throw error if logout fails', async () => {
            // Arrange
            const error = new Error('Logout failed');
            authService.logout.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.logout(refreshTokenDto)).rejects.toThrow(
                error,
            );
            expect(authService.logout).toHaveBeenCalledWith(
                refreshTokenDto.refreshToken,
            );
        });
    });

    describe('getProfile', () => {
        it('should return user profile from request', () => {
            // Arrange
            const mockRequest = {
                user: {
                    id: 1,
                    email: 'test@example.com',
                    name: 'Test User',
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date('2023-01-01'),
                } as AuthUser,
            };

            // Act
            const result = controller.getProfile(mockRequest);

            // Assert
            expect(result).toEqual({
                id: mockRequest.user.id,
                email: mockRequest.user.email,
                name: mockRequest.user.name,
                createdAt: mockRequest.user.createdAt,
                updatedAt: mockRequest.user.updatedAt,
            });
        });
    });

    describe('getHealth', () => {
        it('should return health status', () => {
            // Arrange
            const mockDate = new Date('2023-01-01T12:00:00.000Z');
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            // Act
            const result = controller.getHealth();

            // Assert
            expect(result).toEqual({
                status: 'ok',
                service: 'auth-service',
                timestamp: mockDate.toISOString(),
            });

            // Cleanup
            jest.restoreAllMocks();
        });
    });
});
