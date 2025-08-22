import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsDateString,
    IsNumber,
    Min,
    ValidateNested,
    IsLatitude,
    IsLongitude,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
    CreateOrderRequest,
    UpdateOrderRequest,
    OrderPriority,
    OrderStatus,
} from '@rncp/types';

export class CoordinatesDto {
    @IsLatitude()
    latitude: number;

    @IsLongitude()
    longitude: number;
}

export class CreateOrderDto implements CreateOrderRequest {
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsString()
    @IsNotEmpty()
    deliveryAddress: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoordinatesDto)
    deliveryCoordinates?: CoordinatesDto;

    @IsDateString()
    scheduledDeliveryTime: Date;

    @IsOptional()
    @IsEnum(OrderPriority)
    priority?: OrderPriority;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => parseInt(value))
    estimatedDeliveryDuration?: number;
}

export class UpdateOrderDto implements UpdateOrderRequest {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    customerName?: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    deliveryAddress?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CoordinatesDto)
    deliveryCoordinates?: CoordinatesDto;

    @IsOptional()
    @IsDateString()
    scheduledDeliveryTime?: Date;

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @IsOptional()
    @IsEnum(OrderPriority)
    priority?: OrderPriority;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    deliveryPersonId?: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => parseInt(value))
    estimatedDeliveryDuration?: number;
}

export interface OrderFilters {
    status?: OrderStatus;
    priority?: OrderPriority;
    merchantId?: number;
    deliveryPersonId?: number;
}
