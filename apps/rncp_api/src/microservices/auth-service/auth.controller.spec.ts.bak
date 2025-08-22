import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
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

    const mockResponse = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        json: jest.fn(),
    };

    const mockRequest = {
        cookies: {
            refreshToken: 'refresh_token_123',
        },
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
        mockResponse.cookie.mockClear();
        mockResponse.clearCookie.mockClear();
        mockResponse.json.mockClear();
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
            const result = await controller.register(registerDto, mockResponse);

            // Assert
            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                message: 'Registration successful',
                user: mockAuthResponse.user,
            });
        });

        it('should throw error if registration fails', async () => {
            // Arrange
            const error = new Error('Registration failed');
            authService.register.mockRejectedValue(error);

            // Act & Assert
            await expect(
                controller.register(registerDto, mockResponse),
            ).rejects.toThrow(error);
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
            const result = await controller.login(loginDto, mockResponse);

            // Assert
            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                message: 'Login successful',
                user: mockAuthResponse.user,
            });
        });

        it('should throw error if login fails', async () => {
            // Arrange
            const error = new Error('Login failed');
            authService.login.mockRejectedValue(error);

            // Act & Assert
            await expect(
                controller.login(loginDto, mockResponse),
            ).rejects.toThrow(error);
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('refresh', () => {
        it('should successfully refresh tokens', async () => {
            // Arrange
            authService.refresh.mockResolvedValue(mockTokenPair);

            // Act
            const result = await controller.refresh(mockRequest, mockResponse);

            // Assert
            expect(authService.refresh).toHaveBeenCalledWith({
                refreshToken: 'refresh_token_123',
            });
            expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                message: 'Tokens refreshed successfully',
            });
        });

        it('should throw error if refresh fails', async () => {
            // Arrange
            const error = new Error('Refresh failed');
            authService.refresh.mockRejectedValue(error);

            // Act & Assert
            await expect(
                controller.refresh(mockRequest, mockResponse),
            ).rejects.toThrow(error);
            expect(authService.refresh).toHaveBeenCalledWith({
                refreshToken: 'refresh_token_123',
            });
        });
    });

    describe('logout', () => {
        it('should successfully logout', async () => {
            // Arrange
            authService.logout.mockResolvedValue(undefined);

            // Act
            const result = await controller.logout(mockRequest, mockResponse);

            // Assert
            expect(authService.logout).toHaveBeenCalledWith(
                'refresh_token_123',
            );
            expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                message: 'Logout successful',
            });
        });

        it('should throw error if logout fails', async () => {
            // Arrange
            const error = new Error('Logout failed');
            authService.logout.mockRejectedValue(error);

            // Act & Assert
            await expect(
                controller.logout(mockRequest, mockResponse),
            ).rejects.toThrow(error);
            expect(authService.logout).toHaveBeenCalledWith(
                'refresh_token_123',
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
