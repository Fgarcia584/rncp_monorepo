import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    HttpException,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import {
    DeliveryTracking,
    DeliveryTrackingEvent,
    Position,
    Coordinates,
} from '../../types';

@Controller('tracking')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) {}

    @Post('delivery-person/:id/position')
    async updateDeliveryPersonPosition(
        @Param('id', ParseIntPipe) deliveryPersonId: number,
        @Body() position: Position,
    ): Promise<{ events: DeliveryTrackingEvent[] }> {
        try {
            const events =
                await this.trackingService.updateDeliveryPersonPosition(
                    deliveryPersonId,
                    position,
                );
            return { events };
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Position update failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('delivery-person/:id/position')
    getDeliveryPersonPosition(
        @Param('id', ParseIntPipe) deliveryPersonId: number,
    ): Position | null {
        const position =
            this.trackingService.getDeliveryPersonPosition(deliveryPersonId);
        if (!position) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Position not found',
                    message:
                        'No position data available for this delivery person',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return position;
    }

    @Post('order/:id/start')
    async startDeliveryTracking(
        @Param('id', ParseIntPipe) orderId: number,
        @Body()
        body: {
            deliveryPersonId: number;
            pickupLocation: Coordinates;
            deliveryLocation: Coordinates;
        },
    ): Promise<DeliveryTracking> {
        try {
            return await this.trackingService.startDeliveryTracking(
                orderId,
                body.deliveryPersonId,
                body.pickupLocation,
                body.deliveryLocation,
            );
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Failed to start delivery tracking',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Put('order/:id/status')
    updateDeliveryStatus(
        @Param('id', ParseIntPipe) orderId: number,
        @Body('status') status: DeliveryTracking['status'],
    ): { event: DeliveryTrackingEvent | null } {
        const event = this.trackingService.updateDeliveryStatus(
            orderId,
            status,
        );
        return { event };
    }

    @Post('order/:id/recalculate-route')
    async recalculateRoute(
        @Param('id', ParseIntPipe) orderId: number,
        @Body()
        body: {
            pickupLocation: Coordinates;
            deliveryLocation: Coordinates;
        },
    ): Promise<{ event: DeliveryTrackingEvent | null }> {
        try {
            const event = await this.trackingService.recalculateRoute(
                orderId,
                body.pickupLocation,
                body.deliveryLocation,
            );
            return { event };
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'Route recalculation failed',
                    message: error.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('order/:id')
    getDeliveryTracking(
        @Param('id', ParseIntPipe) orderId: number,
    ): DeliveryTracking {
        const tracking = this.trackingService.getDeliveryTracking(orderId);
        if (!tracking) {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: 'Tracking not found',
                    message: 'No tracking data available for this order',
                },
                HttpStatus.NOT_FOUND,
            );
        }
        return tracking;
    }

    @Get('delivery-person/:id/orders')
    getDeliveryPersonTrackings(
        @Param('id', ParseIntPipe) deliveryPersonId: number,
    ): {
        trackings: DeliveryTracking[];
    } {
        const trackings =
            this.trackingService.getDeliveryPersonTrackings(deliveryPersonId);
        return { trackings };
    }

    @Get('health')
    getHealth(): { status: string; timestamp: string } {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
