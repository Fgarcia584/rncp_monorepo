import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DeliveryTracking, DeliveryTrackingEvent, Position, Coordinates } from '@rncp/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export const trackingApi = createApi({
    reducerPath: 'trackingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/tracking`,
        prepareHeaders: (headers, { getState }) => {
            // Récupérer le token d'auth si nécessaire
            const token = (getState() as { auth?: { token?: string } }).auth?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['DeliveryTracking', 'DeliveryPersonPosition'],
    endpoints: (builder) => ({
        // Mise à jour de position d'un livreur
        updateDeliveryPersonPosition: builder.mutation<
            { events: DeliveryTrackingEvent[] },
            {
                deliveryPersonId: number;
                position: Position;
            }
        >({
            query: ({ deliveryPersonId, position }) => ({
                url: `/delivery-person/${deliveryPersonId}/position`,
                method: 'POST',
                body: position,
            }),
            invalidatesTags: (_result, _error, { deliveryPersonId }) => [
                { type: 'DeliveryPersonPosition', id: deliveryPersonId },
                'DeliveryTracking',
            ],
        }),

        // Récupération de position d'un livreur
        getDeliveryPersonPosition: builder.query<Position, number>({
            query: (deliveryPersonId) => ({
                url: `/delivery-person/${deliveryPersonId}/position`,
            }),
            providesTags: (_result, _error, deliveryPersonId) => [
                { type: 'DeliveryPersonPosition', id: deliveryPersonId },
            ],
        }),

        // Démarrage du tracking d'une livraison
        startDeliveryTracking: builder.mutation<
            DeliveryTracking,
            {
                orderId: number;
                deliveryPersonId: number;
                pickupLocation: Coordinates;
                deliveryLocation: Coordinates;
            }
        >({
            query: ({ orderId, ...body }) => ({
                url: `/order/${orderId}/start`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { orderId }) => [
                { type: 'DeliveryTracking', id: orderId },
                'DeliveryTracking',
            ],
        }),

        // Mise à jour du statut de livraison
        updateDeliveryStatus: builder.mutation<
            { event: DeliveryTrackingEvent | null },
            {
                orderId: number;
                status: DeliveryTracking['status'];
            }
        >({
            query: ({ orderId, status }) => ({
                url: `/order/${orderId}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: (_result, _error, { orderId }) => [{ type: 'DeliveryTracking', id: orderId }],
        }),

        // Recalcul de route
        recalculateRoute: builder.mutation<
            { event: DeliveryTrackingEvent | null },
            {
                orderId: number;
                pickupLocation: Coordinates;
                deliveryLocation: Coordinates;
            }
        >({
            query: ({ orderId, ...body }) => ({
                url: `/order/${orderId}/recalculate-route`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { orderId }) => [{ type: 'DeliveryTracking', id: orderId }],
        }),

        // Récupération du tracking d'une commande
        getDeliveryTracking: builder.query<DeliveryTracking, number>({
            query: (orderId) => ({
                url: `/order/${orderId}`,
            }),
            providesTags: (_result, _error, orderId) => [{ type: 'DeliveryTracking', id: orderId }],
        }),

        // Récupération de tous les trackings d'un livreur
        getDeliveryPersonTrackings: builder.query<{ trackings: DeliveryTracking[] }, number>({
            query: (deliveryPersonId) => ({
                url: `/delivery-person/${deliveryPersonId}/orders`,
            }),
            providesTags: (_result, _error, deliveryPersonId) => [
                { type: 'DeliveryTracking', id: `person-${deliveryPersonId}` },
                'DeliveryTracking',
            ],
        }),
    }),
});

export const {
    useUpdateDeliveryPersonPositionMutation,
    useGetDeliveryPersonPositionQuery,
    useStartDeliveryTrackingMutation,
    useUpdateDeliveryStatusMutation,
    useRecalculateRouteMutation,
    useGetDeliveryTrackingQuery,
    useGetDeliveryPersonTrackingsQuery,
} = trackingApi;
