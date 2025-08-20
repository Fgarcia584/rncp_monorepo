import { baseApi } from './baseApi';
import type {
    OrderResponse,
    OrdersListResponse,
    CreateOrderRequest,
    UpdateOrderRequest,
    OrderStatus,
    OrderPriority,
} from '@rncp/types';

export interface OrderFilters {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    priority?: OrderPriority;
    merchantId?: number;
    deliveryPersonId?: number;
}

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new order (merchants only)
        createOrder: builder.mutation<OrderResponse, CreateOrderRequest>({
            query: (orderData) => ({
                url: '/orders',
                method: 'POST',
                body: orderData,
            }),
            invalidatesTags: [{ type: 'Order', id: 'LIST' }],
        }),

        // Get all orders (filtered by user role)
        getOrders: builder.query<OrdersListResponse, OrderFilters | void>({
            query: (filters = {}) => {
                const params = new URLSearchParams();

                if (filters?.page) params.append('page', filters.page.toString());
                if (filters?.limit) params.append('limit', filters.limit.toString());
                if (filters?.status) params.append('status', filters.status);
                if (filters?.priority) params.append('priority', filters.priority);
                if (filters?.merchantId) params.append('merchantId', filters.merchantId.toString());
                if (filters?.deliveryPersonId) params.append('deliveryPersonId', filters.deliveryPersonId.toString());

                return {
                    url: `/orders?${params.toString()}`,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.orders.map(({ id }) => ({ type: 'Order' as const, id })),
                          { type: 'Order', id: 'LIST' },
                      ]
                    : [{ type: 'Order', id: 'LIST' }],
        }),

        // Get available orders (delivery persons only)
        getAvailableOrders: builder.query<OrdersListResponse, { page?: number; limit?: number } | void>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params?.page) searchParams.append('page', params.page.toString());
                if (params?.limit) searchParams.append('limit', params.limit.toString());

                return {
                    url: `/orders/available?${searchParams.toString()}`,
                };
            },
            providesTags: [{ type: 'Order', id: 'AVAILABLE' }],
        }),

        // Get a specific order by ID
        getOrder: builder.query<OrderResponse, number>({
            query: (id) => `/orders/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Order', id }],
        }),

        // Update an order
        updateOrder: builder.mutation<OrderResponse, { id: number; data: UpdateOrderRequest }>({
            query: ({ id, data }) => ({
                url: `/orders/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Order', id },
                { type: 'Order', id: 'LIST' },
                { type: 'Order', id: 'AVAILABLE' },
            ],
        }),

        // Accept an order (delivery persons only)
        acceptOrder: builder.mutation<OrderResponse, number>({
            query: (orderId) => ({
                url: `/orders/${orderId}/accept`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, orderId) => [
                { type: 'Order', id: orderId },
                { type: 'Order', id: 'LIST' },
                { type: 'Order', id: 'AVAILABLE' },
            ],
        }),

        // Delete an order (merchants only, pending orders only)
        deleteOrder: builder.mutation<void, number>({
            query: (id) => ({
                url: `/orders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Order', id },
                { type: 'Order', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetOrdersQuery,
    useGetAvailableOrdersQuery,
    useGetOrderQuery,
    useUpdateOrderMutation,
    useAcceptOrderMutation,
    useDeleteOrderMutation,
} = orderApi;
