import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus, OrderPriority, UserRole } from '../../types';

describe('OrderController', () => {
    let controller: OrderController;
    let orderService: jest.Mocked<OrderService>;

    const mockOrderResponse = {
        id: 1,
        merchantId: 1,
        customerName: 'John Doe',
        customerPhone: '+33123456789',
        deliveryAddress: '123 Main Street, Paris',
        scheduledDeliveryTime: new Date('2024-01-15T14:30:00Z'),
        status: OrderStatus.PENDING,
        priority: OrderPriority.NORMAL,
        deliveryPersonId: undefined,
        notes: 'Test order',
        estimatedDeliveryDuration: 30,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
    };

    const mockOrdersListResponse = {
        orders: [mockOrderResponse],
        total: 1,
        page: 1,
        limit: 10,
    };

    const createOrderDto: CreateOrderDto = {
        customerName: 'John Doe',
        customerPhone: '+33123456789',
        deliveryAddress: '123 Main Street, Paris',
        scheduledDeliveryTime: new Date('2024-01-15T14:30:00Z'),
        priority: OrderPriority.NORMAL,
        notes: 'Test order',
        estimatedDeliveryDuration: 30,
    };

    const mockMerchantUser = {
        userId: 1,
        role: UserRole.MERCHANT,
        email: 'merchant@test.com',
    };

    const mockDeliveryPersonUser = {
        userId: 2,
        role: UserRole.DELIVERY_PERSON,
        email: 'delivery@test.com',
    };

    const mockAdminUser = {
        userId: 3,
        role: UserRole.ADMIN,
        email: 'admin@test.com',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                {
                    provide: OrderService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findAvailableOrders: jest.fn(),
                        findById: jest.fn(),
                        update: jest.fn(),
                        acceptOrder: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<OrderController>(OrderController);
        orderService = module.get(OrderService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create order when user is merchant', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.create.mockResolvedValue(mockOrderResponse);

            // Act
            const result = await controller.create(mockRequest, createOrderDto);

            // Assert
            expect(orderService.create).toHaveBeenCalledWith(
                mockMerchantUser.userId,
                createOrderDto,
            );
            expect(result).toEqual(mockOrderResponse);
        });

        it('should throw error when user is not merchant', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };

            // Act & Assert
            try {
                await controller.create(mockRequest, createOrderDto);
                fail('Expected ForbiddenException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.message).toBe('Only merchants can create orders');
            }
            expect(orderService.create).not.toHaveBeenCalled();
        });

        it('should throw error when user is admin (not merchant)', async () => {
            // Arrange
            const mockRequest = { user: mockAdminUser };

            // Act & Assert
            try {
                await controller.create(mockRequest, createOrderDto);
                fail('Expected ForbiddenException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.message).toBe('Only merchants can create orders');
            }
        });
    });

    describe('findAll', () => {
        it('should return orders for merchant (filtered by merchantId)', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act
            const result = await controller.findAll(mockRequest, 1, 10);

            // Assert
            expect(orderService.findAll).toHaveBeenCalledWith(1, 10, {
                merchantId: mockMerchantUser.userId,
            });
            expect(result).toEqual(mockOrdersListResponse);
        });

        it('should return orders for delivery person (filtered by deliveryPersonId)', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act
            const result = await controller.findAll(mockRequest, 1, 10);

            // Assert
            expect(orderService.findAll).toHaveBeenCalledWith(1, 10, {
                deliveryPersonId: mockDeliveryPersonUser.userId,
            });
            expect(result).toEqual(mockOrdersListResponse);
        });

        it('should allow admin to filter by any criteria', async () => {
            // Arrange
            const mockRequest = { user: mockAdminUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act
            const result = await controller.findAll(
                mockRequest,
                1,
                10,
                OrderStatus.PENDING,
                OrderPriority.HIGH,
                5,
                6,
            );

            // Assert
            expect(orderService.findAll).toHaveBeenCalledWith(1, 10, {
                status: OrderStatus.PENDING,
                priority: OrderPriority.HIGH,
                merchantId: 5,
                deliveryPersonId: 6,
            });
            expect(result).toEqual(mockOrdersListResponse);
        });

        it('should ignore query filters for non-admin users', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act
            await controller.findAll(
                mockRequest,
                1,
                10,
                OrderStatus.PENDING,
                OrderPriority.HIGH,
                5,
                6,
            );

            // Assert - merchant can only see their own orders, other filters ignored
            expect(orderService.findAll).toHaveBeenCalledWith(1, 10, {
                merchantId: mockMerchantUser.userId,
            });
        });

        it('should use default pagination values', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act
            await controller.findAll(mockRequest, 1, 10);

            // Assert
            expect(orderService.findAll).toHaveBeenCalledWith(
                1,
                10,
                expect.any(Object),
            );
        });
    });

    describe('findAvailableOrders', () => {
        it('should return available orders for delivery person', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            orderService.findAvailableOrders.mockResolvedValue(
                mockOrdersListResponse,
            );

            // Act
            const result = await controller.findAvailableOrders(
                mockRequest,
                1,
                10,
            );

            // Assert
            expect(orderService.findAvailableOrders).toHaveBeenCalledWith(
                1,
                10,
            );
            expect(result).toEqual(mockOrdersListResponse);
        });

        it('should throw error when user is not delivery person', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };

            // Act & Assert
            try {
                await controller.findAvailableOrders(mockRequest, 1, 10);
                fail('Expected ForbiddenException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.message).toBe(
                    'Only delivery persons can view available orders',
                );
            }
            expect(orderService.findAvailableOrders).not.toHaveBeenCalled();
        });

        it('should throw error when admin tries to view available orders', async () => {
            // Arrange
            const mockRequest = { user: mockAdminUser };

            // Act & Assert
            try {
                await controller.findAvailableOrders(mockRequest, 1, 10);
                fail('Expected ForbiddenException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.message).toBe(
                    'Only delivery persons can view available orders',
                );
            }
        });

        it('should handle pagination correctly', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            orderService.findAvailableOrders.mockResolvedValue(
                mockOrdersListResponse,
            );

            // Act
            await controller.findAvailableOrders(mockRequest, 2, 5);

            // Assert
            expect(orderService.findAvailableOrders).toHaveBeenCalledWith(2, 5);
        });
    });

    describe('findOne', () => {
        it('should return order by id', async () => {
            // Arrange
            orderService.findById.mockResolvedValue(mockOrderResponse);

            // Act
            const result = await controller.findOne(1);

            // Assert
            expect(orderService.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockOrderResponse);
        });

        it('should handle service exceptions', async () => {
            // Arrange
            orderService.findById.mockRejectedValue(
                new NotFoundException('Order not found'),
            );

            // Act & Assert
            await expect(controller.findOne(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        const updateOrderDto: UpdateOrderDto = {
            customerName: 'Updated Name',
            status: OrderStatus.IN_TRANSIT,
        };

        it('should update order successfully', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            const updatedOrder = { ...mockOrderResponse, ...updateOrderDto };
            orderService.update.mockResolvedValue(updatedOrder);

            // Act
            const result = await controller.update(
                mockRequest,
                1,
                updateOrderDto,
            );

            // Assert
            expect(orderService.update).toHaveBeenCalledWith(
                1,
                updateOrderDto,
                mockMerchantUser.userId,
                mockMerchantUser.role,
            );
            expect(result).toEqual(updatedOrder);
        });

        it('should pass user info to service for permission checks', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            orderService.update.mockResolvedValue(mockOrderResponse);

            // Act
            await controller.update(mockRequest, 1, updateOrderDto);

            // Assert
            expect(orderService.update).toHaveBeenCalledWith(
                1,
                updateOrderDto,
                mockDeliveryPersonUser.userId,
                mockDeliveryPersonUser.role,
            );
        });

        it('should handle service exceptions', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.update.mockRejectedValue(
                new ForbiddenException('Access denied'),
            );

            // Act & Assert
            await expect(
                controller.update(mockRequest, 1, updateOrderDto),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('acceptOrder', () => {
        it('should accept order when user is delivery person', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            const acceptedOrder = {
                ...mockOrderResponse,
                status: OrderStatus.ACCEPTED,
                deliveryPersonId: 2,
            };
            orderService.acceptOrder.mockResolvedValue(acceptedOrder);

            // Act
            const result = await controller.acceptOrder(mockRequest, 1);

            // Assert
            expect(orderService.acceptOrder).toHaveBeenCalledWith(
                1,
                mockDeliveryPersonUser.userId,
            );
            expect(result).toEqual(acceptedOrder);
        });

        it('should throw error when user is not delivery person', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };

            // Act & Assert
            try {
                await controller.acceptOrder(mockRequest, 1);
                fail('Expected ForbiddenException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.message).toBe(
                    'Only delivery persons can accept orders',
                );
            }
            expect(orderService.acceptOrder).not.toHaveBeenCalled();
        });

        it('should throw error when admin tries to accept order', async () => {
            // Arrange
            const mockRequest = { user: mockAdminUser };

            // Act & Assert
            try {
                await controller.acceptOrder(mockRequest, 1);
                fail('Expected ForbiddenException to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.message).toBe(
                    'Only delivery persons can accept orders',
                );
            }
        });

        it('should handle service exceptions', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            orderService.acceptOrder.mockRejectedValue(
                new NotFoundException('Order not available'),
            );

            // Act & Assert
            await expect(
                controller.acceptOrder(mockRequest, 1),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove order successfully', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.remove.mockResolvedValue();

            // Act
            await controller.remove(mockRequest, 1);

            // Assert
            expect(orderService.remove).toHaveBeenCalledWith(
                1,
                mockMerchantUser.userId,
                mockMerchantUser.role,
            );
        });

        it('should pass user info for permission checks', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            orderService.remove.mockResolvedValue();

            // Act
            await controller.remove(mockRequest, 1);

            // Assert
            expect(orderService.remove).toHaveBeenCalledWith(
                1,
                mockDeliveryPersonUser.userId,
                mockDeliveryPersonUser.role,
            );
        });

        it('should handle service exceptions', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.remove.mockRejectedValue(
                new ForbiddenException('Cannot delete this order'),
            );

            // Act & Assert
            await expect(controller.remove(mockRequest, 1)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    describe('health', () => {
        it('should return health check status', () => {
            // Act
            const result = controller.health();

            // Assert
            expect(result).toEqual({
                status: 'ok',
                service: 'order-service',
                timestamp: expect.any(String),
            });
        });
    });

    describe('Parameter parsing and validation', () => {
        it('should handle ParseIntPipe for ID parameters', async () => {
            // This is implicitly tested in all methods that use @Param('id', ParseIntPipe)
            // The pipe will throw BadRequestException for invalid integers
            orderService.findById.mockResolvedValue(mockOrderResponse);

            // Act
            const result = await controller.findOne(1);

            // Assert
            expect(orderService.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockOrderResponse);
        });

        it('should handle DefaultValuePipe for pagination parameters', async () => {
            // Arrange
            const mockRequest = { user: mockMerchantUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act - not passing page and limit to test DefaultValuePipe
            const result = await controller.findAll(mockRequest, 1, 10);

            // Assert
            expect(orderService.findAll).toHaveBeenCalledWith(
                1,
                10,
                expect.any(Object),
            );
            expect(result).toEqual(mockOrdersListResponse);
        });

        it('should handle optional ParseIntPipe for query parameters', async () => {
            // Arrange
            const mockRequest = { user: mockAdminUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act - passing undefined for optional parameters
            await controller.findAll(
                mockRequest,
                1,
                10,
                undefined,
                undefined,
                undefined,
                undefined,
            );

            // Assert
            expect(orderService.findAll).toHaveBeenCalledWith(1, 10, {});
        });
    });

    describe('Role-based filtering edge cases', () => {
        it('should handle unknown user role gracefully', async () => {
            // Arrange
            const mockRequest = {
                user: { ...mockMerchantUser, role: 'UNKNOWN_ROLE' as UserRole },
            };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act
            const result = await controller.findAll(mockRequest, 1, 10);

            // Assert - should not apply any role-based filters for unknown role
            expect(orderService.findAll).toHaveBeenCalledWith(1, 10, {});
            expect(result).toEqual(mockOrdersListResponse);
        });

        it('should not apply admin filters for non-admin with admin query parameters', async () => {
            // Arrange
            const mockRequest = { user: mockDeliveryPersonUser };
            orderService.findAll.mockResolvedValue(mockOrdersListResponse);

            // Act
            await controller.findAll(
                mockRequest,
                1,
                10,
                OrderStatus.PENDING,
                OrderPriority.HIGH,
                999, // This should be ignored for delivery person
                888, // This should be ignored for delivery person
            );

            // Assert - should only apply deliveryPersonId filter for delivery person
            expect(orderService.findAll).toHaveBeenCalledWith(1, 10, {
                deliveryPersonId: mockDeliveryPersonUser.userId,
            });
        });
    });
});
