import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    GoogleRouteRequest,
    GoogleRouteResponse,
    GeocodingRequest,
    GeocodingResponse,
    DistanceMatrixRequest,
    DistanceMatrixResponse,
    Coordinates,
} from '@rncp/types';

const API_BASE_URL = 'http://localhost:3001';

export const geoApi = createApi({
    reducerPath: 'geoApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/geo`,
        prepareHeaders: (headers, { getState }) => {
            // Récupérer le token d'auth si nécessaire
            const token = (getState() as { auth?: { token?: string } }).auth?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Route', 'Geocoding'],
    endpoints: (builder) => ({
        // Calcul d'itinéraire simple
        calculateRoute: builder.mutation<GoogleRouteResponse, GoogleRouteRequest>({
            query: (request) => ({
                url: '/route',
                method: 'POST',
                body: request,
            }),
            invalidatesTags: ['Route'],
        }),

        // Calcul d'itinéraire optimisé pour livraison
        calculateOptimizedDeliveryRoute: builder.mutation<
            GoogleRouteResponse,
            {
                deliveryPersonLocation: Coordinates;
                pickupLocation: Coordinates;
                deliveryLocation: Coordinates;
            }
        >({
            query: (body) => ({
                url: '/route/optimized',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Route'],
        }),

        // Géocodage
        geocode: builder.mutation<GeocodingResponse, GeocodingRequest>({
            query: (request) => ({
                url: '/geocode',
                method: 'POST',
                body: request,
            }),
            invalidatesTags: ['Geocoding'],
        }),

        // Géocodage d'adresse simple
        geocodeAddress: builder.query<GeocodingResponse, string>({
            query: (address) => ({
                url: '/geocode/address',
                params: { address },
            }),
            providesTags: ['Geocoding'],
        }),

        // Géocodage inverse
        reverseGeocode: builder.query<GeocodingResponse, Coordinates>({
            query: ({ latitude, longitude }) => ({
                url: '/geocode/coordinates',
                params: { lat: latitude, lng: longitude },
            }),
            providesTags: ['Geocoding'],
        }),

        // Calcul de matrice de distance
        calculateDistanceMatrix: builder.mutation<DistanceMatrixResponse, DistanceMatrixRequest>({
            query: (request) => ({
                url: '/distance-matrix',
                method: 'POST',
                body: request,
            }),
        }),

        // Validation d'adresse
        validateAddress: builder.mutation<
            {
                isValid: boolean;
                formattedAddress?: string;
                coordinates?: Coordinates;
            },
            string
        >({
            query: (address) => ({
                url: '/validate-address',
                method: 'POST',
                body: { address },
            }),
        }),

        // Calcul ETA
        calculateETA: builder.mutation<
            {
                durationMinutes: number;
                durationWithTrafficMinutes?: number;
                distanceKm: number;
            },
            {
                from: Coordinates;
                to: Coordinates;
            }
        >({
            query: (body) => ({
                url: '/eta',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useCalculateRouteMutation,
    useCalculateOptimizedDeliveryRouteMutation,
    useGeocodeMutation,
    useGeocodeAddressQuery,
    useReverseGeocodeQuery,
    useCalculateDistanceMatrixMutation,
    useValidateAddressMutation,
    useCalculateETAMutation,
} = geoApi;
