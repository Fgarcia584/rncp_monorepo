export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    IN_TRANSIT = 'in_transit',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum DeliveryStatus {
    EN_ROUTE_TO_PICKUP = 'en_route_to_pickup',
    AT_PICKUP = 'at_pickup',
    PICKED_UP = 'picked_up',
    EN_ROUTE_TO_DELIVERY = 'en_route_to_delivery',
    AT_DELIVERY = 'at_delivery',
    DELIVERED = 'delivered',
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
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    merchantAddress?: string;
    merchantCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime: Date;
    status: OrderStatus;
    deliveryStatus?: DeliveryStatus;
    priority: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number; // in minutes
    actualDeliveryDuration?: number; // in minutes
    distanceKm?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderRequest {
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime: Date;
    priority?: OrderPriority;
    notes?: string;
    estimatedDeliveryDuration?: number;
}

export interface UpdateOrderRequest {
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime?: Date;
    status?: OrderStatus;
    deliveryStatus?: DeliveryStatus;
    priority?: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number;
    actualDeliveryDuration?: number;
    distanceKm?: number;
}

export interface OrderResponse {
    id: number;
    merchantId: number;
    customerName: string;
    customerPhone?: string;
    deliveryAddress: string;
    deliveryCoordinates?: {
        latitude: number;
        longitude: number;
    };
    merchantAddress?: string;
    merchantCoordinates?: {
        latitude: number;
        longitude: number;
    };
    scheduledDeliveryTime: Date;
    status: OrderStatus;
    deliveryStatus?: DeliveryStatus;
    priority: OrderPriority;
    deliveryPersonId?: number;
    notes?: string;
    estimatedDeliveryDuration?: number;
    actualDeliveryDuration?: number;
    distanceKm?: number;
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
