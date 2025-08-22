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
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto, OrderFilters } from './dto/order.dto';
import { OrderStatus, OrderPriority, UserRole } from '../../types';

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
        return this.orderService.create(req.user.userId, createOrderDto);
    }

    @Post('create')
    createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        // Only merchants can create orders
        if (req.user.role !== UserRole.MERCHANT) {
            throw new ForbiddenException('Only merchants can create orders');
        }
        return this.orderService.create(req.user.userId, createOrderDto);
    }

    @Get('all')
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
        const filters: OrderFilters = {};

        // Apply role-based filtering
        if (req.user.role === UserRole.MERCHANT) {
            // Merchants can only see their own orders
            filters.merchantId = req.user.userId;
        } else if (req.user.role === UserRole.DELIVERY_PERSON) {
            // Delivery persons can only see their assigned orders
            filters.deliveryPersonId = req.user.userId;
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
            req.user.userId,
            req.user.role,
        );
    }

    @Post(':id/accept')
    @HttpCode(HttpStatus.OK)
    acceptOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
        // Only delivery persons can accept orders
        if (req.user.role !== UserRole.DELIVERY_PERSON) {
            throw new ForbiddenException(
                'Only delivery persons can accept orders',
            );
        }

        return this.orderService.acceptOrder(id, req.user.userId);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.remove(id, req.user.userId, req.user.role);
    }

    // Test endpoint to debug Gateway communication
    @Post(':id/test-accept')
    @HttpCode(HttpStatus.OK)
    testAccept(@Request() req, @Param('id', ParseIntPipe) id: number) {
        console.log(
            `🧪 TEST POST /orders/${id}/test-accept - User: ${req.user?.userId}`,
        );

        const testResponse = {
            success: true,
            orderId: id,
            userId: req.user?.userId,
            message: 'Test endpoint working',
            timestamp: new Date().toISOString(),
        };

        console.log('🧪 Test response:', JSON.stringify(testResponse, null, 2));
        console.log('🌐 NestJS will send test response with status 200');

        return testResponse;
    }

    // Ultra-simple endpoint for debugging HTTP response
    @Post('simple-test')
    @HttpCode(HttpStatus.OK)
    @Public()
    simpleTest(): string {
        console.log('🔥 Ultra-simple endpoint called');
        console.log('🔥 Returning plain string "OK"');
        return 'OK';
    }

    // Even simpler endpoint - minimal JSON response
    @Get('ping')
    @HttpCode(HttpStatus.OK)
    @Public()
    ping() {
        console.log('🏓 Ping endpoint called');
        const response = { ping: 'pong' };
        console.log('🏓 Returning:', response);
        return response;
    }

    @Public()
    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'order-service',
            timestamp: new Date().toISOString(),
        };
    }
}
