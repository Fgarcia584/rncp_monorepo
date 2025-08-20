import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { OrderService } from './order.service';
import { Order } from '../../entities';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus, OrderPriority, UserRole } from '@rncp/types';

describe('OrderService', () => {
    let service: OrderService;
    let orderRepository: jest.Mocked<Repository<Order>>;
    let queryBuilder: jest.Mocked<SelectQueryBuilder<Order>>;

    const mockOrder: Order = {
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

    const mockAcceptedOrder: Order = {
        ...mockOrder,
        id: 2,
        status: OrderStatus.ACCEPTED,
        deliveryPersonId: 2,
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

    beforeEach(async () => {
        // Reset mock objects to ensure test isolation
        Object.assign(mockOrder, {
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
        });

        // Mock QueryBuilder
        queryBuilder = {
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn(),
        } as unknown as jest.Mocked<SelectQueryBuilder<Order>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        findAndCount: jest.fn(),
                        remove: jest.fn(),
                        createQueryBuilder: jest.fn(() => queryBuilder),
                    },
                },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        orderRepository = module.get(getRepositoryToken(Order));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new order successfully', async () => {
            // Arrange
            const merchantId = 1;
            orderRepository.create.mockReturnValue(mockOrder);
            orderRepository.save.mockResolvedValue(mockOrder);

            // Act
            const result = await service.create(merchantId, createOrderDto);

            // Assert
            expect(orderRepository.create).toHaveBeenCalledWith({
                merchantId,
                ...createOrderDto,
                scheduledDeliveryTime: new Date(
                    createOrderDto.scheduledDeliveryTime,
                ),
            });
            expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
            expect(result).toEqual({
                id: mockOrder.id,
                merchantId: mockOrder.merchantId,
                customerName: mockOrder.customerName,
                customerPhone: mockOrder.customerPhone,
                deliveryAddress: mockOrder.deliveryAddress,
                scheduledDeliveryTime: mockOrder.scheduledDeliveryTime,
                status: mockOrder.status,
                priority: mockOrder.priority,
                deliveryPersonId: mockOrder.deliveryPersonId,
                notes: mockOrder.notes,
                estimatedDeliveryDuration: mockOrder.estimatedDeliveryDuration,
                createdAt: mockOrder.createdAt,
                updatedAt: mockOrder.updatedAt,
            });
        });

        it('should handle date conversion correctly', async () => {
            // Arrange
            const merchantId = 1;
            const dateString = '2024-01-15T14:30:00Z';
            const dtoWithStringDate: CreateOrderDto = {
                ...createOrderDto,
                scheduledDeliveryTime: dateString as unknown as Date,
            };

            orderRepository.create.mockReturnValue(mockOrder);
            orderRepository.save.mockResolvedValue(mockOrder);

            // Act
            await service.create(merchantId, dtoWithStringDate);

            // Assert
            expect(orderRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    scheduledDeliveryTime: new Date(dateString),
                }),
            );
        });
    });

    describe('findAll', () => {
        it('should return paginated orders with default pagination', async () => {
            // Arrange
            const mockOrders = [mockOrder, mockAcceptedOrder];
            const total = 2;
            queryBuilder.getManyAndCount.mockResolvedValue([mockOrders, total]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(orderRepository.createQueryBuilder).toHaveBeenCalledWith(
                'order',
            );
            expect(queryBuilder.orderBy).toHaveBeenCalledWith(
                'order.scheduledDeliveryTime',
                'ASC',
            );
            expect(queryBuilder.addOrderBy).toHaveBeenCalledWith(
                'order.priority',
                'DESC',
            );
            expect(queryBuilder.skip).toHaveBeenCalledWith(0);
            expect(queryBuilder.take).toHaveBeenCalledWith(10);
            expect(result).toEqual({
                orders: expect.arrayContaining([
                    expect.objectContaining({ id: mockOrder.id }),
                    expect.objectContaining({ id: mockAcceptedOrder.id }),
                ]),
                total,
                page: 1,
                limit: 10,
            });
        });

        it('should apply filters correctly', async () => {
            // Arrange
            const filters = {
                status: OrderStatus.PENDING,
                priority: OrderPriority.HIGH,
                merchantId: 1,
                deliveryPersonId: 2,
            };
            queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            // Act
            await service.findAll(2, 20, filters);

            // Assert
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'order.status = :status',
                { status: filters.status },
            );
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'order.priority = :priority',
                { priority: filters.priority },
            );
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'order.merchantId = :merchantId',
                { merchantId: filters.merchantId },
            );
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(
                'order.deliveryPersonId = :deliveryPersonId',
                { deliveryPersonId: filters.deliveryPersonId },
            );
            expect(queryBuilder.skip).toHaveBeenCalledWith(20);
            expect(queryBuilder.take).toHaveBeenCalledWith(20);
        });

        it('should handle empty results', async () => {
            // Arrange
            queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result).toEqual({
                orders: [],
                total: 0,
                page: 1,
                limit: 10,
            });
        });
    });

    describe('findAvailableOrders', () => {
        it('should return available orders (pending and unassigned)', async () => {
            // Arrange
            const availableOrders = [mockOrder];
            orderRepository.findAndCount.mockResolvedValue([
                availableOrders,
                1,
            ]);

            // Act
            const result = await service.findAvailableOrders();

            // Assert
            expect(orderRepository.findAndCount).toHaveBeenCalledWith({
                where: {
                    status: OrderStatus.PENDING,
                    deliveryPersonId: IsNull(),
                },
                order: {
                    priority: 'DESC',
                    scheduledDeliveryTime: 'ASC',
                },
                skip: 0,
                take: 10,
            });
            expect(result).toEqual({
                orders: [expect.objectContaining({ id: mockOrder.id })],
                total: 1,
                page: 1,
                limit: 10,
            });
        });

        it('should handle pagination correctly', async () => {
            // Arrange
            orderRepository.findAndCount.mockResolvedValue([[], 0]);

            // Act
            await service.findAvailableOrders(3, 5);

            // Assert
            expect(orderRepository.findAndCount).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10, // (3-1) * 5
                    take: 5,
                }),
            );
        });
    });

    describe('findById', () => {
        it('should return order when found', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(mockOrder);

            // Act
            const result = await service.findById(1);

            // Assert
            expect(orderRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(
                expect.objectContaining({ id: mockOrder.id }),
            );
        });

        it('should throw NotFoundException when order not found', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findById(999)).rejects.toThrow(
                new NotFoundException('Order with ID 999 not found'),
            );
        });
    });

    describe('update', () => {
        const updateOrderDto: UpdateOrderDto = {
            customerName: 'Updated Name',
            status: OrderStatus.IN_TRANSIT,
        };

        it('should update order successfully when merchant owns the order', async () => {
            // Arrange
            const updatedOrder = { ...mockOrder, ...updateOrderDto };
            orderRepository.findOne.mockResolvedValue(mockOrder);
            orderRepository.save.mockResolvedValue(updatedOrder);

            // Act
            const result = await service.update(
                1,
                updateOrderDto,
                1,
                UserRole.MERCHANT,
            );

            // Assert
            expect(orderRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(orderRepository.save).toHaveBeenCalledWith(
                expect.objectContaining(updateOrderDto),
            );
            expect(result).toEqual(
                expect.objectContaining({ customerName: 'Updated Name' }),
            );
        });

        it('should throw NotFoundException when order does not exist', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(
                service.update(999, updateOrderDto, 1, UserRole.MERCHANT),
            ).rejects.toThrow(
                new NotFoundException('Order with ID 999 not found'),
            );
        });

        it('should throw ForbiddenException when merchant tries to update other merchants order', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(mockOrder);

            // Act & Assert
            await expect(
                service.update(1, updateOrderDto, 2, UserRole.MERCHANT),
            ).rejects.toThrow(
                new ForbiddenException('You can only update your own orders'),
            );
        });

        it('should allow delivery person to update only allowed fields', async () => {
            // Arrange
            const allowedUpdate: UpdateOrderDto = {
                status: OrderStatus.IN_TRANSIT,
                deliveryPersonId: 2,
            };
            const updatedOrder = { ...mockOrder, ...allowedUpdate };
            orderRepository.findOne.mockResolvedValue(mockOrder);
            orderRepository.save.mockResolvedValue(updatedOrder);

            // Act
            const result = await service.update(
                1,
                allowedUpdate,
                2,
                UserRole.DELIVERY_PERSON,
            );

            // Assert
            expect(result).toEqual(expect.objectContaining(allowedUpdate));
        });

        it('should throw ForbiddenException when delivery person tries to update forbidden fields', async () => {
            // Arrange
            const forbiddenUpdate: UpdateOrderDto = {
                customerName: 'Forbidden Update',
            };
            orderRepository.findOne.mockResolvedValue(mockOrder);

            // Act & Assert
            await expect(
                service.update(1, forbiddenUpdate, 2, UserRole.DELIVERY_PERSON),
            ).rejects.toThrow(
                new ForbiddenException(
                    'Delivery persons can only update order status and assignment',
                ),
            );
        });

        it('should throw ForbiddenException when delivery person tries to accept non-pending order', async () => {
            // Arrange
            const nonPendingOrder = {
                ...mockOrder,
                status: OrderStatus.ACCEPTED,
            };
            const updateDto: UpdateOrderDto = { deliveryPersonId: 2 };
            orderRepository.findOne.mockResolvedValue(nonPendingOrder);

            // Act & Assert
            await expect(
                service.update(1, updateDto, 2, UserRole.DELIVERY_PERSON),
            ).rejects.toThrow(
                new ForbiddenException('Can only accept pending orders'),
            );
        });

        it('should handle scheduled delivery time updates', async () => {
            // Arrange
            const newDate = '2024-01-20T16:00:00Z';
            const updateDto: UpdateOrderDto = {
                scheduledDeliveryTime: newDate as unknown as Date,
            };
            const updatedOrder = {
                ...mockOrder,
                scheduledDeliveryTime: new Date(newDate),
            };

            orderRepository.findOne.mockResolvedValue(mockOrder);
            orderRepository.save.mockResolvedValue(updatedOrder);

            // Act
            await service.update(1, updateDto, 1, UserRole.MERCHANT);

            // Assert
            expect(orderRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    scheduledDeliveryTime: new Date(newDate),
                }),
            );
        });
    });

    describe('remove', () => {
        it('should remove order successfully when merchant owns pending order', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(mockOrder);
            orderRepository.remove.mockResolvedValue(mockOrder);

            // Act
            await service.remove(1, 1, UserRole.MERCHANT);

            // Assert
            expect(orderRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(orderRepository.remove).toHaveBeenCalledWith(mockOrder);
        });

        it('should throw NotFoundException when order does not exist', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(
                service.remove(999, 1, UserRole.MERCHANT),
            ).rejects.toThrow(
                new NotFoundException('Order with ID 999 not found'),
            );
        });

        it('should throw ForbiddenException when non-merchant tries to delete', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(mockOrder);

            // Act & Assert
            await expect(
                service.remove(1, 2, UserRole.DELIVERY_PERSON),
            ).rejects.toThrow(
                new ForbiddenException(
                    'Only merchants can delete their own orders',
                ),
            );
        });

        it('should throw ForbiddenException when merchant tries to delete other merchants order', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(mockOrder);

            // Act & Assert
            await expect(
                service.remove(1, 2, UserRole.MERCHANT),
            ).rejects.toThrow(
                new ForbiddenException(
                    'Only merchants can delete their own orders',
                ),
            );
        });

        it('should throw ForbiddenException when trying to delete non-pending order', async () => {
            // Arrange
            const acceptedOrder = {
                ...mockOrder,
                status: OrderStatus.ACCEPTED,
            };
            orderRepository.findOne.mockResolvedValue(acceptedOrder);

            // Act & Assert
            await expect(
                service.remove(1, 1, UserRole.MERCHANT),
            ).rejects.toThrow(
                new ForbiddenException('Only pending orders can be deleted'),
            );
        });
    });

    describe('acceptOrder', () => {
        it('should accept available order successfully', async () => {
            // Arrange
            const acceptedOrder = {
                ...mockOrder,
                deliveryPersonId: 2,
                status: OrderStatus.ACCEPTED,
            };
            orderRepository.findOne.mockResolvedValue(mockOrder);
            orderRepository.save.mockResolvedValue(acceptedOrder);

            // Act
            const result = await service.acceptOrder(1, 2);

            // Assert
            expect(orderRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    status: OrderStatus.PENDING,
                    deliveryPersonId: IsNull(),
                },
            });
            expect(orderRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    deliveryPersonId: 2,
                    status: OrderStatus.ACCEPTED,
                }),
            );
            expect(result).toEqual(
                expect.objectContaining({
                    deliveryPersonId: 2,
                    status: OrderStatus.ACCEPTED,
                }),
            );
        });

        it('should throw NotFoundException when order is not available', async () => {
            // Arrange
            orderRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.acceptOrder(1, 2)).rejects.toThrow(
                new NotFoundException(
                    'Available order not found or already assigned',
                ),
            );
        });

        it('should not find already assigned order', async () => {
            // Arrange - findOne should not find the order because deliveryPersonId is not null
            orderRepository.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(service.acceptOrder(1, 2)).rejects.toThrow(
                new NotFoundException(
                    'Available order not found or already assigned',
                ),
            );

            expect(orderRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    status: OrderStatus.PENDING,
                    deliveryPersonId: IsNull(),
                },
            });
        });
    });

    describe('mapToResponse', () => {
        it('should map order entity to response correctly', async () => {
            // This is tested implicitly in other tests, but we can test the create method
            // which uses mapToResponse to ensure all fields are mapped correctly

            // Arrange
            orderRepository.create.mockReturnValue(mockOrder);
            orderRepository.save.mockResolvedValue(mockOrder);

            // Act
            const result = await service.create(1, createOrderDto);

            // Assert - verify all fields are present in response
            expect(result).toEqual({
                id: expect.any(Number),
                merchantId: expect.any(Number),
                customerName: expect.any(String),
                customerPhone: expect.any(String),
                deliveryAddress: expect.any(String),
                scheduledDeliveryTime: expect.any(Date),
                status: expect.any(String),
                priority: expect.any(String),
                deliveryPersonId: undefined,
                notes: expect.any(String),
                estimatedDeliveryDuration: expect.any(Number),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });
    });
});
