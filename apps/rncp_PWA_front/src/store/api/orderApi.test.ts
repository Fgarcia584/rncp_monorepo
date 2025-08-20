import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import { orderApi, OrderFilters } from './orderApi';
import { OrderStatus, OrderPriority } from '@rncp/types';

// Mock fetch for RTK Query
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Create a test store
const createTestStore = () => {
    const store = configureStore({
        reducer: {
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });
    setupListeners(store.dispatch);
    return store;
};

// Mock order data
const mockOrder = {
    id: 1,
    merchantId: 1,
    customerName: 'John Doe',
    customerPhone: '+33123456789',
    deliveryAddress: '123 Main Street, Paris',
    scheduledDeliveryTime: '2024-01-15T14:30:00Z',
    status: OrderStatus.PENDING,
    priority: OrderPriority.NORMAL,
    deliveryPersonId: null,
    notes: 'Test order',
    estimatedDeliveryDuration: 30,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
};

const mockOrdersList = {
    orders: [mockOrder],
    total: 1,
    page: 1,
    limit: 10,
};

const mockCreateOrderRequest = {
    customerName: 'John Doe',
    customerPhone: '+33123456789',
    deliveryAddress: '123 Main Street, Paris',
    scheduledDeliveryTime: new Date('2024-01-15T14:30:00Z'),
    priority: OrderPriority.NORMAL,
    notes: 'Test order',
    estimatedDeliveryDuration: 30,
};

describe('orderApi', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        store = createTestStore();
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    describe('createOrder mutation', () => {
        it('should create order with correct payload', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrder,
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.createOrder.initiate(mockCreateOrderRequest));

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/orders'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(mockCreateOrderRequest),
                    headers: expect.objectContaining({
                        'content-type': 'application/json',
                    }),
                }),
            );
            expect(result.data).toEqual(mockOrder);
        });

        it('should handle error response', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ message: 'Validation error' }),
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.createOrder.initiate(mockCreateOrderRequest));

            // Assert
            expect(result.isError).toBe(true);
            expect(result.error).toMatchObject({
                status: 400,
                data: { message: 'Validation error' },
            });
        });

        it('should invalidate correct tags', () => {
            const endpoint = orderApi.endpoints.createOrder;
            expect(endpoint.invalidatesTags).toEqual([{ type: 'Order', id: 'LIST' }]);
        });
    });

    describe('getOrders query', () => {
        it('should fetch orders with default parameters', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrdersList,
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.getOrders.initiate());

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/orders?'),
                expect.objectContaining({
                    method: 'GET',
                }),
            );
            expect(result.data).toEqual(mockOrdersList);
        });

        it('should build correct query string with filters', async () => {
            // Arrange
            const filters: OrderFilters = {
                page: 2,
                limit: 20,
                status: OrderStatus.PENDING,
                priority: OrderPriority.HIGH,
                merchantId: 5,
                deliveryPersonId: 3,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrdersList,
            } as Response);

            // Act
            await store.dispatch(orderApi.endpoints.getOrders.initiate(filters));

            // Assert
            const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
            const url = lastCall[0] as string;

            expect(url).toContain('page=2');
            expect(url).toContain('limit=20');
            expect(url).toContain('status=pending');
            expect(url).toContain('priority=high');
            expect(url).toContain('merchantId=5');
            expect(url).toContain('deliveryPersonId=3');
        });

        it('should handle optional filters correctly', async () => {
            // Arrange
            const filters: OrderFilters = {
                page: 1,
                status: OrderStatus.PENDING,
                // Other filters are undefined
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrdersList,
            } as Response);

            // Act
            await store.dispatch(orderApi.endpoints.getOrders.initiate(filters));

            // Assert
            const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
            const url = lastCall[0] as string;

            expect(url).toContain('page=1');
            expect(url).toContain('status=pending');
            expect(url).not.toContain('limit=');
            expect(url).not.toContain('priority=');
            expect(url).not.toContain('merchantId=');
            expect(url).not.toContain('deliveryPersonId=');
        });

        it('should provide correct tags', () => {
            const endpoint = orderApi.endpoints.getOrders;
            const mockResult = mockOrdersList;

            const tags = endpoint.providesTags?.(mockResult, undefined as unknown, {} as unknown);
            expect(tags).toEqual([
                { type: 'Order', id: 1 },
                { type: 'Order', id: 'LIST' },
            ]);
        });

        it('should handle empty result tags', () => {
            const endpoint = orderApi.endpoints.getOrders;

            const tags = endpoint.providesTags?.(undefined, undefined as unknown, {} as unknown);
            expect(tags).toEqual([{ type: 'Order', id: 'LIST' }]);
        });
    });

    describe('getAvailableOrders query', () => {
        it('should fetch available orders with default parameters', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrdersList,
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.getAvailableOrders.initiate());

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/orders/available?'),
                expect.objectContaining({
                    method: 'GET',
                }),
            );
            expect(result.data).toEqual(mockOrdersList);
        });

        it('should handle pagination parameters', async () => {
            // Arrange
            const params = { page: 2, limit: 5 };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrdersList,
            } as Response);

            // Act
            await store.dispatch(orderApi.endpoints.getAvailableOrders.initiate(params));

            // Assert
            const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
            const url = lastCall[0] as string;

            expect(url).toContain('page=2');
            expect(url).toContain('limit=5');
        });

        it('should handle void parameters', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrdersList,
            } as Response);

            // Act
            await store.dispatch(orderApi.endpoints.getAvailableOrders.initiate(undefined));

            // Assert
            const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
            const url = lastCall[0] as string;

            expect(url).not.toContain('page=');
            expect(url).not.toContain('limit=');
        });

        it('should provide correct tags', () => {
            const endpoint = orderApi.endpoints.getAvailableOrders;
            const tags = endpoint.providesTags;
            expect(tags).toEqual([{ type: 'Order', id: 'AVAILABLE' }]);
        });
    });

    describe('getOrder query', () => {
        it('should fetch single order by ID', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrder,
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.getOrder.initiate(1));

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/orders/1'),
                expect.objectContaining({
                    method: 'GET',
                }),
            );
            expect(result.data).toEqual(mockOrder);
        });

        it('should provide correct tags', () => {
            const endpoint = orderApi.endpoints.getOrder;
            const tags = endpoint.providesTags?.(mockOrder, undefined as unknown, 1);
            expect(tags).toEqual([{ type: 'Order', id: 1 }]);
        });
    });

    describe('updateOrder mutation', () => {
        it('should update order with correct payload', async () => {
            // Arrange
            const updateData = { status: OrderStatus.IN_TRANSIT };
            const updatedOrder = { ...mockOrder, status: OrderStatus.IN_TRANSIT };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => updatedOrder,
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.updateOrder.initiate({ id: 1, data: updateData }));

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/orders/1'),
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify(updateData),
                    headers: expect.objectContaining({
                        'content-type': 'application/json',
                    }),
                }),
            );
            expect(result.data).toEqual(updatedOrder);
        });

        it('should invalidate correct tags', () => {
            const endpoint = orderApi.endpoints.updateOrder;
            const tags = endpoint.invalidatesTags?.(undefined, undefined as unknown, { id: 1, data: {} });
            expect(tags).toEqual([
                { type: 'Order', id: 1 },
                { type: 'Order', id: 'LIST' },
                { type: 'Order', id: 'AVAILABLE' },
            ]);
        });
    });

    describe('acceptOrder mutation', () => {
        it('should accept order with correct endpoint', async () => {
            // Arrange
            const acceptedOrder = {
                ...mockOrder,
                status: OrderStatus.ACCEPTED,
                deliveryPersonId: 2,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => acceptedOrder,
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.acceptOrder.initiate(1));

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/orders/1/accept'),
                expect.objectContaining({
                    method: 'POST',
                }),
            );
            expect(result.data).toEqual(acceptedOrder);
        });

        it('should invalidate correct tags', () => {
            const endpoint = orderApi.endpoints.acceptOrder;
            const tags = endpoint.invalidatesTags?.(undefined, undefined as unknown, 1);
            expect(tags).toEqual([
                { type: 'Order', id: 1 },
                { type: 'Order', id: 'LIST' },
                { type: 'Order', id: 'AVAILABLE' },
            ]);
        });
    });

    describe('deleteOrder mutation', () => {
        it('should delete order with correct endpoint', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.deleteOrder.initiate(1));

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/orders/1'),
                expect.objectContaining({
                    method: 'DELETE',
                }),
            );
            expect(result.data).toEqual({});
        });

        it('should invalidate correct tags', () => {
            const endpoint = orderApi.endpoints.deleteOrder;
            const tags = endpoint.invalidatesTags?.(undefined, undefined as unknown, 1);
            expect(tags).toEqual([
                { type: 'Order', id: 1 },
                { type: 'Order', id: 'LIST' },
            ]);
        });
    });

    describe('Error handling', () => {
        it('should handle network errors', async () => {
            // Arrange
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            // Act
            const result = await store.dispatch(orderApi.endpoints.getOrders.initiate());

            // Assert
            expect(result.isError).toBe(true);
            expect(result.error).toEqual({
                error: 'Network error',
                status: 'FETCH_ERROR',
            });
        });

        it('should handle HTTP error responses', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                json: async () => ({ message: 'Access denied' }),
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.getOrders.initiate());

            // Assert
            expect(result.isError).toBe(true);
            expect(result.error).toMatchObject({
                status: 403,
                data: { message: 'Access denied' },
            });
        });

        it('should handle 404 errors', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: async () => ({ message: 'Order not found' }),
            } as Response);

            // Act
            const result = await store.dispatch(orderApi.endpoints.getOrder.initiate(999));

            // Assert
            expect(result.isError).toBe(true);
            expect(result.error).toMatchObject({
                status: 404,
                data: { message: 'Order not found' },
            });
        });
    });

    describe('Cache behavior', () => {
        it('should use cached data for repeated queries', async () => {
            // Arrange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrdersList,
            } as Response);

            // Act - First call
            const result1 = await store.dispatch(orderApi.endpoints.getOrders.initiate());

            // Act - Second call (should use cache)
            const result2 = await store.dispatch(orderApi.endpoints.getOrders.initiate());

            // Assert
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(result1.data).toEqual(result2.data);
        });

        it('should refetch after cache invalidation', async () => {
            // Arrange
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockOrdersList,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockOrder,
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ ...mockOrdersList, total: 2 }),
                } as Response);

            // Act - Initial fetch
            await store.dispatch(orderApi.endpoints.getOrders.initiate());

            // Act - Create order (should invalidate cache)
            await store.dispatch(orderApi.endpoints.createOrder.initiate(mockCreateOrderRequest));

            // Act - Fetch again (should make new request)
            const result = await store.dispatch(orderApi.endpoints.getOrders.initiate());

            // Assert
            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(result.data).toEqual({ ...mockOrdersList, total: 2 });
        });
    });

    describe('TypeScript type safety', () => {
        it('should enforce correct parameter types', () => {
            // These should compile without errors
            const validFilters: OrderFilters = {
                page: 1,
                limit: 10,
                status: OrderStatus.PENDING,
                priority: OrderPriority.HIGH,
                merchantId: 1,
                deliveryPersonId: 2,
            };

            const validCreateRequest = {
                customerName: 'Test',
                deliveryAddress: 'Test Address',
                scheduledDeliveryTime: new Date(),
            };

            const validUpdateRequest = {
                status: OrderStatus.ACCEPTED,
                customerName: 'Updated Name',
            };

            // These should be valid
            expect(validFilters.status).toBe(OrderStatus.PENDING);
            expect(validCreateRequest.customerName).toBe('Test');
            expect(validUpdateRequest.status).toBe(OrderStatus.ACCEPTED);
        });
    });
});
