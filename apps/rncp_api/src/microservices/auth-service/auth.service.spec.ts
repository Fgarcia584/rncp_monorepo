import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User, RefreshToken } from '../../entities';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { UserRole, JwtPayload } from '../../types';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<Repository<User>>;
    let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
    let jwtService: jest.Mocked<JwtService>;

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        role: UserRole.DELIVERY_PERSON,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        refreshTokens: [],
    };

    const mockRefreshToken: RefreshToken = {
        id: 1,
        token: 'refresh_token_123',
        userId: 1,
        user: mockUser,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
        createdAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(RefreshToken),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get(getRepositoryToken(User));
        refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
        jwtService = module.get(JwtService);
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

        it('should successfully register a new user', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);
            mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
            userRepository.create.mockReturnValue(mockUser);
            userRepository.save.mockResolvedValue(mockUser);
            jwtService.sign
                .mockReturnValueOnce('access_token_123')
                .mockReturnValueOnce('refresh_token_123');
            refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
            refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

            // Act
            const result = await service.register(registerDto);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            });
            expect(mockedBcrypt.hash).toHaveBeenCalledWith(
                registerDto.password,
                12,
            );
            expect(userRepository.create).toHaveBeenCalledWith({
                email: registerDto.email,
                name: registerDto.name,
                password: 'hashedPassword',
                role: UserRole.DELIVERY_PERSON,
            });
            expect(userRepository.save).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.role,
                    createdAt: mockUser.createdAt,
                    updatedAt: mockUser.updatedAt,
                },
                accessToken: 'access_token_123',
                refreshToken: 'refresh_token_123',
            });
        });

        it('should throw ConflictException if user already exists', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(service.register(registerDto)).rejects.toThrow(
                ConflictException,
            );
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            });
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should successfully login with valid credentials', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            jwtService.sign
                .mockReturnValueOnce('access_token_123')
                .mockReturnValueOnce('refresh_token_123');
            refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
            refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

            // Act
            const result = await service.login(loginDto);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: loginDto.email },
            });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.password,
            );
            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                    role: mockUser.role,
                    createdAt: mockUser.createdAt,
                    updatedAt: mockUser.updatedAt,
                },
                accessToken: 'access_token_123',
                refreshToken: 'refresh_token_123',
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: loginDto.email },
            });
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            // Act & Assert
            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(
                loginDto.password,
                mockUser.password,
            );
        });
    });

    describe('refresh', () => {
        const refreshTokenDto: RefreshTokenDto = {
            refreshToken: 'refresh_token_123',
        };

        it('should successfully refresh tokens', async () => {
            // Arrange
            refreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
            jwtService.sign
                .mockReturnValueOnce('new_access_token')
                .mockReturnValueOnce('new_refresh_token');
            refreshTokenRepository.create.mockReturnValue(mockRefreshToken);
            refreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
            refreshTokenRepository.remove.mockResolvedValue(mockRefreshToken);

            // Act
            const result = await service.refresh(refreshTokenDto);

            // Assert
            expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
                where: {
                    token: refreshTokenDto.refreshToken,
                    isRevoked: false,
                },
                relations: ['user'],
            });
            expect(refreshTokenRepository.remove).toHaveBeenCalledWith(
                mockRefreshToken,
            );
            expect(result).toEqual({
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
            });
        });

        it('should throw UnauthorizedException if refresh token not found', async () => {
            // Arrange
            refreshTokenRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException if refresh token is expired', async () => {
            // Arrange
            const expiredToken = {
                ...mockRefreshToken,
                expiresAt: new Date(Date.now() - 1000), // Expired
            };
            refreshTokenRepository.findOne.mockResolvedValue(expiredToken);
            refreshTokenRepository.remove.mockResolvedValue(expiredToken);

            // Act & Assert
            await expect(service.refresh(refreshTokenDto)).rejects.toThrow(
                UnauthorizedException,
            );
            expect(refreshTokenRepository.remove).toHaveBeenCalledWith(
                expiredToken,
            );
        });
    });

    describe('logout', () => {
        it('should successfully logout by removing refresh token', async () => {
            // Arrange
            refreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
            refreshTokenRepository.remove.mockResolvedValue(mockRefreshToken);

            // Act
            await service.logout('refresh_token_123');

            // Assert
            expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
                where: { token: 'refresh_token_123' },
            });
            expect(refreshTokenRepository.remove).toHaveBeenCalledWith(
                mockRefreshToken,
            );
        });

        it('should handle logout gracefully when token not found', async () => {
            // Arrange
            refreshTokenRepository.findOne.mockResolvedValue(null);

            // Act
            await service.logout('nonexistent_token');

            // Assert
            expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
                where: { token: 'nonexistent_token' },
            });
            expect(refreshTokenRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('validateUser', () => {
        const jwtPayload: JwtPayload = {
            sub: 1,
            email: 'test@example.com',
            role: UserRole.DELIVERY_PERSON,
            iat: 1234567890,
            expiresIn: 1234567890 + 900,
        };

        it('should return user if found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await service.validateUser(jwtPayload);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: jwtPayload.sub },
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act
            const result = await service.validateUser(jwtPayload);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: jwtPayload.sub },
            });
            expect(result).toBeNull();
        });
    });
});
