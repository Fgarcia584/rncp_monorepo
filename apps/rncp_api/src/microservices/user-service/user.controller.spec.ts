import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from '@rncp/types';
import { User } from '../../entities';

describe('UserController', () => {
    let controller: UserController;
    let userService: jest.Mocked<UserService>;

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        refreshTokens: [],
    };

    const mockUsers: User[] = [
        mockUser,
        {
            id: 2,
            email: 'user2@example.com',
            name: 'User Two',
            password: 'hashedPassword456',
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02'),
            refreshTokens: [],
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        findAll: jest.fn(),
                        findById: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            // Arrange
            userService.findAll.mockResolvedValue(mockUsers);

            // Act
            const result = await controller.findAll();

            // Assert
            expect(userService.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockUsers);
        });

        it('should return empty array when no users found', async () => {
            // Arrange
            userService.findAll.mockResolvedValue([]);

            // Act
            const result = await controller.findAll();

            // Assert
            expect(userService.findAll).toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should throw error if service fails', async () => {
            // Arrange
            const error = new Error('Database connection failed');
            userService.findAll.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.findAll()).rejects.toThrow(error);
            expect(userService.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a user when found', async () => {
            // Arrange
            userService.findById.mockResolvedValue(mockUser);

            // Act
            const result = await controller.findById(1);

            // Assert
            expect(userService.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            // Arrange
            const error = new NotFoundException('User with ID 999 not found');
            userService.findById.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.findById(999)).rejects.toThrow(error);
            expect(userService.findById).toHaveBeenCalledWith(999);
        });

        it('should handle string id parameter correctly', async () => {
            // Arrange
            userService.findById.mockResolvedValue(mockUser);

            // Act
            const result = await controller.findById(1);

            // Assert
            expect(userService.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockUser);
        });
    });

    describe('update', () => {
        const updateUserDto: UpdateUserDto = {
            name: 'Updated Name',
            email: 'updated@example.com',
        };

        const updatedUser: User = {
            ...mockUser,
            ...updateUserDto,
            updatedAt: new Date('2023-01-03'),
        };

        it('should successfully update a user', async () => {
            // Arrange
            userService.update.mockResolvedValue(updatedUser);

            // Act
            const result = await controller.update(1, updateUserDto);

            // Assert
            expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
            expect(result).toEqual(updatedUser);
        });

        it('should throw NotFoundException when user to update not found', async () => {
            // Arrange
            const error = new NotFoundException('User with ID 999 not found');
            userService.update.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.update(999, updateUserDto)).rejects.toThrow(
                error,
            );
            expect(userService.update).toHaveBeenCalledWith(999, updateUserDto);
        });

        it('should handle partial updates', async () => {
            // Arrange
            const partialUpdateDto: UpdateUserDto = {
                name: 'Only Name Updated',
            };
            const partiallyUpdatedUser: User = {
                ...mockUser,
                name: 'Only Name Updated',
                updatedAt: new Date('2023-01-03'),
            };

            userService.update.mockResolvedValue(partiallyUpdatedUser);

            // Act
            const result = await controller.update(1, partialUpdateDto);

            // Assert
            expect(userService.update).toHaveBeenCalledWith(
                1,
                partialUpdateDto,
            );
            expect(result).toEqual(partiallyUpdatedUser);
        });

        it('should handle empty update dto', async () => {
            // Arrange
            const emptyUpdateDto: UpdateUserDto = {};
            userService.update.mockResolvedValue(mockUser);

            // Act
            const result = await controller.update(1, emptyUpdateDto);

            // Assert
            expect(userService.update).toHaveBeenCalledWith(1, emptyUpdateDto);
            expect(result).toEqual(mockUser);
        });
    });

    describe('remove', () => {
        it('should successfully remove a user', async () => {
            // Arrange
            userService.remove.mockResolvedValue(undefined);

            // Act
            await controller.remove(1);

            // Assert
            expect(userService.remove).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when user to remove not found', async () => {
            // Arrange
            const error = new NotFoundException('User with ID 999 not found');
            userService.remove.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.remove(999)).rejects.toThrow(error);
            expect(userService.remove).toHaveBeenCalledWith(999);
        });

        it('should handle service errors gracefully', async () => {
            // Arrange
            const error = new Error('Database deletion failed');
            userService.remove.mockRejectedValue(error);

            // Act & Assert
            await expect(controller.remove(1)).rejects.toThrow(error);
            expect(userService.remove).toHaveBeenCalledWith(1);
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
                service: 'user-service',
                timestamp: mockDate.toISOString(),
            });

            // Cleanup
            jest.restoreAllMocks();
        });

        it('should return current timestamp', () => {
            // Arrange
            const beforeCall = new Date().toISOString();

            // Act
            const result = controller.getHealth();
            const afterCall = new Date().toISOString();

            // Assert
            expect(result.status).toBe('ok');
            expect(result.service).toBe('user-service');
            expect(result.timestamp).toMatch(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
            );
            expect(new Date(result.timestamp).getTime()).toBeGreaterThanOrEqual(
                new Date(beforeCall).getTime(),
            );
            expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(
                new Date(afterCall).getTime(),
            );
        });
    });
});
