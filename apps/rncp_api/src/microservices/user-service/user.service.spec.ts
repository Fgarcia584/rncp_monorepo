import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from '../../entities';
import { UpdateUserDto } from '@rncp/types';

describe('UserService', () => {
    let service: UserService;
    let userRepository: jest.Mocked<Repository<User>>;

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
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of users without password', async () => {
            // Arrange
            userRepository.find.mockResolvedValue(mockUsers);

            // Act
            const result = await service.findAll();

            // Assert
            expect(userRepository.find).toHaveBeenCalledWith({
                select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
            });
            expect(result).toEqual(mockUsers);
        });

        it('should return empty array when no users found', async () => {
            // Arrange
            userRepository.find.mockResolvedValue([]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(userRepository.find).toHaveBeenCalledWith({
                select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
            });
            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return a user when found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(mockUser);

            // Act
            const result = await service.findById(1);

            // Assert
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            // Arrange
            userRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findById(999)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found'),
            );
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 999 },
                select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
            });
        });
    });

    describe('update', () => {
        const updateUserDto: UpdateUserDto = {
            name: 'Updated Name',
            email: 'updated@example.com',
        };

        it('should successfully update a user', async () => {
            // Arrange
            const updatedUser = {
                ...mockUser,
                ...updateUserDto,
                updatedAt: new Date('2023-01-03'),
            };

            // Mock findById (which is called internally)
            jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
            userRepository.save.mockResolvedValue(updatedUser);

            // Act
            const result = await service.update(1, updateUserDto);

            // Assert
            expect(service.findById).toHaveBeenCalledWith(1);
            expect(userRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                ...updateUserDto,
            });
            expect(result).toEqual({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            });
        });

        it('should throw NotFoundException when user to update not found', async () => {
            // Arrange
            jest.spyOn(service, 'findById').mockRejectedValue(
                new NotFoundException('User with ID 999 not found'),
            );

            // Act & Assert
            await expect(service.update(999, updateUserDto)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found'),
            );
            expect(service.findById).toHaveBeenCalledWith(999);
            expect(userRepository.save).not.toHaveBeenCalled();
        });

        it('should update only provided fields', async () => {
            // Arrange
            const partialUpdateDto: UpdateUserDto = {
                name: 'Only Name Updated',
            };
            const updatedUser = {
                ...mockUser,
                name: 'Only Name Updated',
                updatedAt: new Date('2023-01-03'),
            };

            jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
            userRepository.save.mockResolvedValue(updatedUser);

            // Act
            const result = await service.update(1, partialUpdateDto);

            // Assert
            expect(userRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                name: 'Only Name Updated',
            });
            expect(result.name).toBe('Only Name Updated');
            expect(result.email).toBe(mockUser.email); // Should remain unchanged
        });
    });

    describe('remove', () => {
        it('should successfully remove a user', async () => {
            // Arrange
            jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
            userRepository.remove.mockResolvedValue(mockUser);

            // Act
            await service.remove(1);

            // Assert
            expect(service.findById).toHaveBeenCalledWith(1);
            expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
        });

        it('should throw NotFoundException when user to remove not found', async () => {
            // Arrange
            jest.spyOn(service, 'findById').mockRejectedValue(
                new NotFoundException('User with ID 999 not found'),
            );

            // Act & Assert
            await expect(service.remove(999)).rejects.toThrow(
                new NotFoundException('User with ID 999 not found'),
            );
            expect(service.findById).toHaveBeenCalledWith(999);
            expect(userRepository.remove).not.toHaveBeenCalled();
        });
    });
});
