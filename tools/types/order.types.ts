export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    IN_TRANSIT = 'in_transit',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum OrderPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface Order {
    id: number;
    merchantId: number;
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    scheduledDeliveryTime: Date;
    status: OrderStatus;
    priority: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number; // in minutes
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderRequest {
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    scheduledDeliveryTime: Date;
    priority?: OrderPriority;
    notes?: string;
    estimatedDeliveryDuration?: number;
}

export interface UpdateOrderRequest {
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    scheduledDeliveryTime?: Date;
    status?: OrderStatus;
    priority?: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number;
}

export interface OrderResponse {
    id: number;
    merchantId: number;
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    scheduledDeliveryTime: Date;
    status: OrderStatus;
    priority: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrdersListResponse {
    orders: OrderResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface OrderFilters {
    status?: OrderStatus;
    priority?: OrderPriority;
    merchantId?: number;
    deliveryPersonId?: number;
    startDate?: Date;
    endDate?: Date;
}