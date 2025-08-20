import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
    DefaultValuePipe,
    ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth-service/guards/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus, OrderPriority, UserRole } from '@rncp/types';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        // Only merchants can create orders
        if (req.user.role !== UserRole.MERCHANT) {
            throw new ForbiddenException('Only merchants can create orders');
        }
        return this.orderService.create(req.user.id, createOrderDto);
    }

    @Get()
    findAll(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status') status?: OrderStatus,
        @Query('priority') priority?: OrderPriority,
        @Query('merchantId', new ParseIntPipe({ optional: true }))
        merchantId?: number,
        @Query('deliveryPersonId', new ParseIntPipe({ optional: true }))
        deliveryPersonId?: number,
    ) {
        let filters;

        // Apply role-based filtering
        if (req.user.role === UserRole.MERCHANT) {
            // Merchants can only see their own orders
            filters.merchantId = req.user.id;
        } else if (req.user.role === UserRole.DELIVERY_PERSON) {
            // Delivery persons can only see their assigned orders
            filters.deliveryPersonId = req.user.id;
        }

        // Apply query filters (admins can filter by any criteria)
        if (status && req.user.role === UserRole.ADMIN) filters.status = status;
        if (priority && req.user.role === UserRole.ADMIN)
            filters.priority = priority;
        if (merchantId && req.user.role === UserRole.ADMIN)
            filters.merchantId = merchantId;
        if (deliveryPersonId && req.user.role === UserRole.ADMIN)
            filters.deliveryPersonId = deliveryPersonId;

        return this.orderService.findAll(page, limit, filters);
    }

    @Get('available')
    findAvailableOrders(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        // Only delivery persons can see available orders
        if (req.user.role !== UserRole.DELIVERY_PERSON) {
            throw new ForbiddenException(
                'Only delivery persons can view available orders',
            );
        }
        return this.orderService.findAvailableOrders(page, limit);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.findById(id);
    }

    @Patch(':id')
    update(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOrderDto: UpdateOrderDto,
    ) {
        return this.orderService.update(
            id,
            updateOrderDto,
            req.user.id,
            req.user.role,
        );
    }

    @Post(':id/accept')
    acceptOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
        // Only delivery persons can accept orders
        if (req.user.role !== UserRole.DELIVERY_PERSON) {
            throw new ForbiddenException(
                'Only delivery persons can accept orders',
            );
        }
        return this.orderService.acceptOrder(id, req.user.id);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.remove(id, req.user.id, req.user.role);
    }

    @Get('health')
    health() {
        return { status: 'ok', service: 'order-service' };
    }
}
