import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Order } from '../../entities';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import {
    OrderStatus,
    OrderPriority,
    UserRole,
    OrderResponse,
} from '@rncp/types';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
    ) {}

    async create(
        merchantId: number,
        createOrderDto: CreateOrderDto,
    ): Promise<OrderResponse> {
        // Validate and create safe date
        const scheduledDate = new Date(createOrderDto.scheduledDeliveryTime);
        if (
            isNaN(scheduledDate.getTime()) ||
            scheduledDate.getFullYear() > 3000
        ) {
            console.warn(
                '⚠️ Invalid scheduledDeliveryTime provided:',
                createOrderDto.scheduledDeliveryTime,
            );
            throw new Error('Invalid scheduled delivery time provided');
        }

        const order = this.orderRepository.create({
            merchantId,
            ...createOrderDto,
            scheduledDeliveryTime: scheduledDate,
        });

        const savedOrder = await this.orderRepository.save(order);
        return this.mapToResponse(savedOrder);
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        filters?: {
            status?: OrderStatus;
            priority?: OrderPriority;
            merchantId?: number;
            deliveryPersonId?: number;
        },
    ) {
        const queryBuilder = this.orderRepository.createQueryBuilder('order');

        if (filters?.status) {
            queryBuilder.andWhere('order.status = :status', {
                status: filters.status,
            });
        }

        if (filters?.priority) {
            queryBuilder.andWhere('order.priority = :priority', {
                priority: filters.priority,
            });
        }

        if (filters?.merchantId) {
            queryBuilder.andWhere('order.merchantId = :merchantId', {
                merchantId: filters.merchantId,
            });
        }

        if (filters?.deliveryPersonId) {
            queryBuilder.andWhere(
                'order.deliveryPersonId = :deliveryPersonId',
                {
                    deliveryPersonId: filters.deliveryPersonId,
                },
            );
        }

        queryBuilder
            .orderBy('order.scheduledDeliveryTime', 'ASC')
            .addOrderBy('order.priority', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [orders, total] = await queryBuilder.getManyAndCount();

        return {
            orders: orders.map((order) => this.mapToResponse(order)),
            total,
            page,
            limit,
        };
    }

    async findAvailableOrders(page: number = 1, limit: number = 10) {
        const [orders, total] = await this.orderRepository.findAndCount({
            where: {
                status: OrderStatus.PENDING,
                deliveryPersonId: IsNull(),
            },
            order: {
                priority: 'DESC',
                scheduledDeliveryTime: 'ASC',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            orders: orders.map((order) => this.mapToResponse(order)),
            total,
            page,
            limit,
        };
    }

    async findById(id: number): Promise<OrderResponse> {
        const order = await this.orderRepository.findOne({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return this.mapToResponse(order);
    }

    async update(
        id: number,
        updateOrderDto: UpdateOrderDto,
        userId: number,
        userRole: UserRole,
    ): Promise<OrderResponse> {
        const order = await this.orderRepository.findOne({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        // Check permissions
        if (userRole === UserRole.MERCHANT && order.merchantId !== userId) {
            throw new ForbiddenException('You can only update your own orders');
        }

        if (userRole === UserRole.DELIVERY_PERSON) {
            // Delivery persons can only update status and accept orders
            const allowedUpdates: (keyof UpdateOrderDto)[] = [
                'status',
                'deliveryPersonId',
            ];
            const hasInvalidUpdates = Object.keys(updateOrderDto).some(
                (key) => !allowedUpdates.includes(key as keyof UpdateOrderDto),
            );

            if (hasInvalidUpdates) {
                throw new ForbiddenException(
                    'Delivery persons can only update order status and assignment',
                );
            }

            // Can only accept orders that are pending and unassigned
            if (
                updateOrderDto.deliveryPersonId === userId &&
                order.status !== OrderStatus.PENDING
            ) {
                throw new ForbiddenException('Can only accept pending orders');
            }
        }

        // Apply updates
        Object.assign(order, updateOrderDto);

        if (updateOrderDto.scheduledDeliveryTime) {
            const updatedDate = new Date(updateOrderDto.scheduledDeliveryTime);
            if (
                isNaN(updatedDate.getTime()) ||
                updatedDate.getFullYear() > 3000
            ) {
                console.warn(
                    '⚠️ Invalid scheduledDeliveryTime in update:',
                    updateOrderDto.scheduledDeliveryTime,
                );
                throw new Error('Invalid scheduled delivery time provided');
            }
            order.scheduledDeliveryTime = updatedDate;
        }

        const updatedOrder = await this.orderRepository.save(order);
        return this.mapToResponse(updatedOrder);
    }

    async remove(
        id: number,
        userId: number,
        userRole: UserRole,
    ): Promise<void> {
        const order = await this.orderRepository.findOne({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        // Only merchants can delete their own orders, and only if they're still pending
        if (userRole !== UserRole.MERCHANT || order.merchantId !== userId) {
            throw new ForbiddenException(
                'Only merchants can delete their own orders',
            );
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new ForbiddenException('Only pending orders can be deleted');
        }

        await this.orderRepository.remove(order);
    }

    async acceptOrder(
        orderId: number,
        deliveryPersonId: number,
    ): Promise<OrderResponse> {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
                status: OrderStatus.PENDING,
                deliveryPersonId: IsNull(),
            },
        });

        if (!order) {
            throw new NotFoundException(
                'Available order not found or already assigned',
            );
        }

        order.deliveryPersonId = deliveryPersonId;
        order.status = OrderStatus.ACCEPTED;

        const updatedOrder = await this.orderRepository.save(order);

        return this.mapToResponse(updatedOrder);
    }

    private mapToResponse(order: Order): OrderResponse {
        // Validate and correct invalid dates
        const validateDate = (date: Date, fieldName: string): Date => {
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                console.warn(
                    `⚠️ Invalid date in ${fieldName}, using current date`,
                );
                return new Date();
            }

            // Check for unrealistic future dates (year > 3000)
            if (date.getFullYear() > 3000) {
                console.warn(
                    `⚠️ Unrealistic date in ${fieldName}: ${date.toISOString()}, correcting to current date`,
                );
                return new Date();
            }

            return date;
        };

        const response: OrderResponse = {
            id: order.id,
            merchantId: order.merchantId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            deliveryAddress: order.deliveryAddress,
            scheduledDeliveryTime: validateDate(
                order.scheduledDeliveryTime,
                'scheduledDeliveryTime',
            ),
            status: order.status,
            priority: order.priority,
            deliveryPersonId: order.deliveryPersonId,
            notes: order.notes,
            estimatedDeliveryDuration: order.estimatedDeliveryDuration,
            createdAt: validateDate(order.createdAt, 'createdAt'),
            updatedAt: validateDate(order.updatedAt, 'updatedAt'),
        };

        // Log any undefined fields for debugging, but let TypeORM handle them naturally
        Object.keys(response).forEach((key) => {
            if (response[key] === undefined) {
                console.log(`ℹ️ Optional field is undefined: ${key}`);
            }
        });

        return response;
    }
}
