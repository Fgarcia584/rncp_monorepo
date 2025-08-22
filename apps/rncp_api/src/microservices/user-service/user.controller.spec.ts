import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRole, JwtPayload, User } from '../../types';
import {
    CreateUserRequestDto,
    UpdateUserRequestDto,
    UpdateUserRoleDto,
} from './dto/user.dto';

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService; // eslint-disable-line @typescript-eslint/no-unused-vars

    const mockUserService = {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateRole: jest.fn(),
        remove: jest.fn(),
    };

    const mockAdminUser: JwtPayload = {
        sub: 1,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        iat: Date.now(),
        expiresIn: Date.now() + 15 * 60 * 1000,
    };

    const mockRegularUser: JwtPayload = {
        sub: 2,
        email: 'user@test.com',
        role: UserRole.DELIVERY_PERSON,
        iat: Date.now(),
        expiresIn: Date.now() + 15 * 60 * 1000,
    };

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.DELIVERY_PERSON,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all users when called by admin', async () => {
            const mockUsers: User[] = [mockUser];
            mockUserService.findAll.mockResolvedValue(mockUsers);

            const result = await controller.findAll();

            expect(result).toEqual(mockUsers);
            expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
        });

        it('should call userService.findAll', async () => {
            const mockUsers: User[] = [mockUser];
            mockUserService.findAll.mockResolvedValue(mockUsers);

            await controller.findAll();

            expect(mockUserService.findAll).toHaveBeenCalledWith();
        });
    });

    describe('getProfile', () => {
        it('should return user profile for authenticated user', async () => {
            mockUserService.findById.mockResolvedValue(mockUser);

            const result = await controller.getProfile(mockRegularUser);

            expect(result).toEqual(mockUser);
            expect(mockUserService.findById).toHaveBeenCalledWith(
                mockRegularUser.sub,
            );
        });

        it('should return admin profile for admin user', async () => {
            const adminProfile: User = { ...mockUser, role: UserRole.ADMIN };
            mockUserService.findById.mockResolvedValue(adminProfile);

            const result = await controller.getProfile(mockAdminUser);

            expect(result).toEqual(adminProfile);
            expect(mockUserService.findById).toHaveBeenCalledWith(
                mockAdminUser.sub,
            );
        });
    });

    describe('findById', () => {
        it('should return specific user when called by admin', async () => {
            mockUserService.findById.mockResolvedValue(mockUser);

            const result = await controller.findById(1);

            expect(result).toEqual(mockUser);
            expect(mockUserService.findById).toHaveBeenCalledWith(1);
        });

        it('should call userService.findById with correct id', async () => {
            mockUserService.findById.mockResolvedValue(mockUser);

            await controller.findById(5);

            expect(mockUserService.findById).toHaveBeenCalledWith(5);
        });
    });

    describe('create', () => {
        it('should create a new user when called by admin', async () => {
            const createUserDto: CreateUserRequestDto = {
                email: 'new@test.com',
                name: 'New User',
                password: 'password123',
                role: UserRole.MERCHANT,
            };
            const createdUser: User = { ...mockUser, ...createUserDto, id: 2 };
            mockUserService.create.mockResolvedValue(createdUser);

            const result = await controller.create(createUserDto);

            expect(result).toEqual(createdUser);
            expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
        });

        it('should create user with default role when none specified', async () => {
            const createUserDto: CreateUserRequestDto = {
                email: 'new@test.com',
                name: 'New User',
                password: 'password123',
            };
            const createdUser: User = { ...mockUser, ...createUserDto, id: 2 };
            mockUserService.create.mockResolvedValue(createdUser);

            const result = await controller.create(createUserDto);

            expect(result).toEqual(createdUser);
            expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('update', () => {
        const updateUserDto: UpdateUserRequestDto = {
            name: 'Updated Name',
            email: 'updated@test.com',
        };

        it('should allow admin to update any user', async () => {
            const updatedUser: User = { ...mockUser, ...updateUserDto };
            mockUserService.update.mockResolvedValue(updatedUser);

            const result = await controller.update(
                2,
                updateUserDto,
                mockAdminUser,
            );

            expect(result).toEqual(updatedUser);
            expect(mockUserService.update).toHaveBeenCalledWith(
                2,
                updateUserDto,
            );
        });

        it('should allow user to update their own profile', async () => {
            const updatedUser: User = { ...mockUser, ...updateUserDto };
            mockUserService.update.mockResolvedValue(updatedUser);

            const result = await controller.update(
                2,
                updateUserDto,
                mockRegularUser,
            );

            expect(result).toEqual(updatedUser);
            expect(mockUserService.update).toHaveBeenCalledWith(
                2,
                updateUserDto,
            );
        });

        it('should throw error when non-admin tries to update another user', async () => {
            await expect(
                controller.update(999, updateUserDto, mockRegularUser),
            ).rejects.toThrow(
                'Forbidden: You can only update your own profile',
            );

            expect(mockUserService.update).not.toHaveBeenCalled();
        });

        it('should remove role from update when non-admin tries to change role', async () => {
            const updateWithRole: UpdateUserRequestDto = {
                ...updateUserDto,
                role: UserRole.ADMIN,
            };
            const expectedUpdateDto = { ...updateUserDto };
            const updatedUser: User = { ...mockUser, ...expectedUpdateDto };
            mockUserService.update.mockResolvedValue(updatedUser);

            const result = await controller.update(
                2,
                updateWithRole,
                mockRegularUser,
            );

            expect(result).toEqual(updatedUser);
            expect(mockUserService.update).toHaveBeenCalledWith(
                2,
                expectedUpdateDto,
            );
        });

        it('should allow admin to change role in regular update', async () => {
            const updateWithRole: UpdateUserRequestDto = {
                ...updateUserDto,
                role: UserRole.MERCHANT,
            };
            const updatedUser: User = { ...mockUser, ...updateWithRole };
            mockUserService.update.mockResolvedValue(updatedUser);

            const result = await controller.update(
                2,
                updateWithRole,
                mockAdminUser,
            );

            expect(result).toEqual(updatedUser);
            expect(mockUserService.update).toHaveBeenCalledWith(
                2,
                updateWithRole,
            );
        });
    });

    describe('updateRole', () => {
        it('should update user role when called by admin', async () => {
            const updateRoleDto: UpdateUserRoleDto = {
                role: UserRole.MERCHANT,
            };
            const updatedUser: User = { ...mockUser, role: UserRole.MERCHANT };
            mockUserService.updateRole.mockResolvedValue(updatedUser);

            const result = await controller.updateRole(1, updateRoleDto);

            expect(result).toEqual(updatedUser);
            expect(mockUserService.updateRole).toHaveBeenCalledWith(
                1,
                UserRole.MERCHANT,
            );
        });

        it('should handle all role types correctly', async () => {
            const roles = [
                UserRole.ADMIN,
                UserRole.DELIVERY_PERSON,
                UserRole.MERCHANT,
                UserRole.LOGISTICS_TECHNICIAN,
            ];

            for (const role of roles) {
                const updateRoleDto: UpdateUserRoleDto = { role };
                const updatedUser: User = { ...mockUser, role };
                mockUserService.updateRole.mockResolvedValue(updatedUser);

                const result = await controller.updateRole(1, updateRoleDto);

                expect(result).toEqual(updatedUser);
                expect(mockUserService.updateRole).toHaveBeenCalledWith(
                    1,
                    role,
                );
            }

            expect(mockUserService.updateRole).toHaveBeenCalledTimes(
                roles.length,
            );
        });
    });

    describe('remove', () => {
        it('should remove user when called by admin', async () => {
            mockUserService.remove.mockResolvedValue(undefined);

            const result = await controller.remove(1);

            expect(result).toBeUndefined();
            expect(mockUserService.remove).toHaveBeenCalledWith(1);
        });

        it('should call userService.remove with correct id', async () => {
            mockUserService.remove.mockResolvedValue(undefined);

            await controller.remove(5);

            expect(mockUserService.remove).toHaveBeenCalledWith(5);
        });
    });

    describe('getHealth', () => {
        it('should return health status', () => {
            const result = controller.getHealth();

            expect(result).toHaveProperty('status', 'ok');
            expect(result).toHaveProperty('service', 'user-service');
            expect(result).toHaveProperty('timestamp');
            expect(typeof result.timestamp).toBe('string');
        });

        it('should return current timestamp', () => {
            const beforeCall = new Date().toISOString();
            const result = controller.getHealth();
            const afterCall = new Date().toISOString();

            expect(result.timestamp >= beforeCall).toBe(true);
            expect(result.timestamp <= afterCall).toBe(true);
        });
    });

    describe('Role-based access scenarios', () => {
        it('should handle logistics technician accessing their own profile', async () => {
            const logisticsTechUser: JwtPayload = {
                sub: 3,
                email: 'logistics@test.com',
                role: UserRole.LOGISTICS_TECHNICIAN,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };
            mockUserService.findById.mockResolvedValue(mockUser);

            const result = await controller.getProfile(logisticsTechUser);

            expect(result).toEqual(mockUser);
            expect(mockUserService.findById).toHaveBeenCalledWith(3);
        });

        it('should handle merchant accessing their own profile', async () => {
            const merchantUser: JwtPayload = {
                sub: 4,
                email: 'merchant@test.com',
                role: UserRole.MERCHANT,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };
            mockUserService.findById.mockResolvedValue(mockUser);

            const result = await controller.getProfile(merchantUser);

            expect(result).toEqual(mockUser);
            expect(mockUserService.findById).toHaveBeenCalledWith(4);
        });

        it('should prevent non-admin from updating another user of different role', async () => {
            const merchantUser: JwtPayload = {
                sub: 4,
                email: 'merchant@test.com',
                role: UserRole.MERCHANT,
                iat: Date.now(),
                expiresIn: Date.now() + 15 * 60 * 1000,
            };

            await expect(
                controller.update(2, { name: 'Updated' }, merchantUser),
            ).rejects.toThrow(
                'Forbidden: You can only update your own profile',
            );
        });
    });

    describe('Error handling', () => {
        it('should propagate service errors', async () => {
            const error = new Error('Service error');
            mockUserService.findById.mockRejectedValue(error);

            await expect(controller.findById(1)).rejects.toThrow(
                'Service error',
            );
        });

        it('should handle creation errors', async () => {
            const createUserDto: CreateUserRequestDto = {
                email: 'test@test.com',
                name: 'Test User',
                password: 'password123',
            };
            const error = new Error('Creation failed');
            mockUserService.create.mockRejectedValue(error);

            await expect(controller.create(createUserDto)).rejects.toThrow(
                'Creation failed',
            );
        });

        it('should handle update errors', async () => {
            const updateUserDto: UpdateUserRequestDto = {
                name: 'Updated Name',
            };
            const error = new Error('Update failed');
            mockUserService.update.mockRejectedValue(error);

            await expect(
                controller.update(1, updateUserDto, mockAdminUser),
            ).rejects.toThrow('Update failed');
        });
    });
});
