import { Injectable, Logger } from '@nestjs/common';
import {
    DeliveryTracking,
    DeliveryTrackingEvent,
    Position,
    Coordinates,
} from '../../types';
import { GeoService } from './geo.service';

@Injectable()
export class TrackingService {
    private readonly logger = new Logger(TrackingService.name);
    private deliveryTrackings = new Map<number, DeliveryTracking>(); // orderId -> DeliveryTracking
    private deliveryPersonPositions = new Map<number, Position>(); // deliveryPersonId -> Position

    constructor(private readonly geoService: GeoService) {}

    /**
     * Met à jour la position d'un livreur
     */
    async updateDeliveryPersonPosition(
        deliveryPersonId: number,
        position: Position,
    ): Promise<DeliveryTrackingEvent[]> {
        this.deliveryPersonPositions.set(deliveryPersonId, position);

        const events: DeliveryTrackingEvent[] = [];

        // Trouver toutes les livraisons actives pour ce livreur
        const activeDeliveries = Array.from(
            this.deliveryTrackings.values(),
        ).filter((tracking) => tracking.deliveryPersonId === deliveryPersonId);

        for (const tracking of activeDeliveries) {
            tracking.currentPosition = position;
            tracking.lastUpdated = new Date();

            // Calculer la nouvelle distance et ETA
            try {
                const destination = this.getNextDestination(tracking);
                if (destination) {
                    const eta = await this.geoService.calculateETA(
                        position,
                        destination,
                    );
                    if (eta) {
                        const durationMinutes =
                            eta.durationWithTrafficMinutes ||
                            eta.durationMinutes;
                        if (typeof durationMinutes === 'number') {
                            tracking.estimatedArrivalTime = new Date(
                                Date.now() + durationMinutes * 60 * 1000,
                            );
                            tracking.distanceToDestination =
                                eta.distanceKm * 1000; // en mètres
                        }
                    }
                }
            } catch (error) {
                this.logger.error(
                    'Error calculating ETA for delivery tracking',
                    error,
                );
            }

            // Créer un événement de mise à jour
            const event: DeliveryTrackingEvent = {
                type: 'position_update',
                orderId: tracking.orderId,
                deliveryPersonId: tracking.deliveryPersonId,
                data: {
                    position: position,
                    estimatedArrivalTime: tracking.estimatedArrivalTime,
                },
                timestamp: new Date(),
            };
            events.push(event);

            // Vérifier si le statut a changé (proximité des points)
            const statusChange = await this.checkStatusChange(tracking);
            if (statusChange) {
                const statusEvent: DeliveryTrackingEvent = {
                    type: 'status_change',
                    orderId: tracking.orderId,
                    deliveryPersonId: tracking.deliveryPersonId,
                    data: {
                        status: tracking.status,
                    },
                    timestamp: new Date(),
                };
                events.push(statusEvent);
            }
        }

        return events;
    }

    /**
     * Démarre le tracking d'une livraison
     */
    async startDeliveryTracking(
        orderId: number,
        deliveryPersonId: number,
        pickupLocation: Coordinates,
        deliveryLocation: Coordinates,
    ): Promise<DeliveryTracking> {
        const currentPosition =
            this.deliveryPersonPositions.get(deliveryPersonId);

        if (!currentPosition) {
            throw new Error(
                'Current position not available for delivery person',
            );
        }

        // Calculer la route optimisée
        let route;
        try {
            const routeResponse = await this.geoService.calculateOptimizedRoute(
                {
                    origin: currentPosition,
                    destination: deliveryLocation,
                    waypoints: [pickupLocation],
                    optimizeWaypoints: true,
                    travelMode: 'driving',
                },
            );
            route = routeResponse.routes[0];
        } catch (error) {
            this.logger.error(
                'Error calculating initial route for delivery',
                error,
            );
        }

        const tracking: DeliveryTracking = {
            orderId,
            deliveryPersonId,
            currentPosition,
            route,
            estimatedArrivalTime: route
                ? new Date(Date.now() + route.legs[0].duration.value * 1000)
                : undefined,
            distanceToDestination: route
                ? route.legs[0].distance.value
                : undefined,
            status: 'en_route_to_pickup',
            lastUpdated: new Date(),
        };

        this.deliveryTrackings.set(orderId, tracking);
        this.logger.log(
            `Started delivery tracking for order ${orderId} with delivery person ${deliveryPersonId}`,
        );

        return tracking;
    }

    /**
     * Met à jour le statut d'une livraison
     */
    updateDeliveryStatus(
        orderId: number,
        status: DeliveryTracking['status'],
    ): DeliveryTrackingEvent | null {
        const tracking = this.deliveryTrackings.get(orderId);

        if (!tracking) {
            this.logger.warn(
                `Attempted to update status for non-existent tracking: ${orderId}`,
            );
            return null;
        }

        const oldStatus = tracking.status;
        tracking.status = status;
        tracking.lastUpdated = new Date();

        this.logger.log(
            `Updated delivery status for order ${orderId}: ${oldStatus} -> ${status}`,
        );

        // Si livraison terminée, nettoyer le tracking
        if (status === 'completed') {
            this.deliveryTrackings.delete(orderId);
        }

        return {
            type: 'status_change',
            orderId: tracking.orderId,
            deliveryPersonId: tracking.deliveryPersonId,
            data: {
                status: status,
            },
            timestamp: new Date(),
        };
    }

    /**
     * Recalcule la route d'une livraison
     */
    async recalculateRoute(
        orderId: number,
        pickupLocation: Coordinates,
        deliveryLocation: Coordinates,
    ): Promise<DeliveryTrackingEvent | null> {
        const tracking = this.deliveryTrackings.get(orderId);

        if (!tracking) {
            return null;
        }

        try {
            const routeResponse = await this.geoService.calculateOptimizedRoute(
                {
                    origin: tracking.currentPosition,
                    destination:
                        tracking.status === 'en_route_to_pickup'
                            ? pickupLocation
                            : deliveryLocation,
                    waypoints:
                        tracking.status === 'en_route_to_pickup'
                            ? []
                            : undefined,
                    optimizeWaypoints: false,
                    travelMode: 'driving',
                },
            );

            tracking.route = routeResponse.routes[0];
            tracking.estimatedArrivalTime = new Date(
                Date.now() + tracking.route.legs[0].duration.value * 1000,
            );
            tracking.distanceToDestination =
                tracking.route.legs[0].distance.value;
            tracking.lastUpdated = new Date();

            return {
                type: 'route_recalculated',
                orderId: tracking.orderId,
                deliveryPersonId: tracking.deliveryPersonId,
                data: {
                    route: tracking.route,
                    estimatedArrivalTime: tracking.estimatedArrivalTime,
                },
                timestamp: new Date(),
            };
        } catch (error) {
            this.logger.error('Error recalculating route', error);
            return null;
        }
    }

    /**
     * Récupère le tracking d'une livraison
     */
    getDeliveryTracking(orderId: number): DeliveryTracking | undefined {
        return this.deliveryTrackings.get(orderId);
    }

    /**
     * Récupère tous les trackings actifs pour un livreur
     */
    getDeliveryPersonTrackings(deliveryPersonId: number): DeliveryTracking[] {
        return Array.from(this.deliveryTrackings.values()).filter(
            (tracking) => tracking.deliveryPersonId === deliveryPersonId,
        );
    }

    /**
     * Récupère la position actuelle d'un livreur
     */
    getDeliveryPersonPosition(deliveryPersonId: number): Position | undefined {
        return this.deliveryPersonPositions.get(deliveryPersonId);
    }

    /**
     * Récupère la prochaine destination selon le statut
     */
    private getNextDestination(tracking: DeliveryTracking): Coordinates | null {
        if (!tracking.route || !tracking.route.legs.length) {
            return null;
        }

        switch (tracking.status) {
            case 'en_route_to_pickup':
                return tracking.route.legs[0].endLocation;
            case 'en_route_to_delivery':
                return tracking.route.legs.length > 1
                    ? tracking.route.legs[1].endLocation
                    : tracking.route.legs[0].endLocation;
            default:
                return null;
        }
    }

    /**
     * Vérifie si le statut doit changer selon la proximité
     */
    private async checkStatusChange(
        tracking: DeliveryTracking,
    ): Promise<boolean> {
        const PROXIMITY_THRESHOLD = 100; // 100 mètres

        const destination = this.getNextDestination(tracking);
        if (!destination || !tracking.distanceToDestination) {
            return false;
        }

        // Si très proche de la destination
        if (tracking.distanceToDestination <= PROXIMITY_THRESHOLD) {
            let newStatus: DeliveryTracking['status'] | null = null;

            switch (tracking.status) {
                case 'en_route_to_pickup':
                    newStatus = 'at_pickup';
                    break;
                case 'en_route_to_delivery':
                    newStatus = 'at_delivery';
                    break;
            }

            if (newStatus && newStatus !== tracking.status) {
                tracking.status = newStatus;
                this.logger.log(
                    `Auto-updated delivery status for order ${tracking.orderId}: proximity detected`,
                );
                return true;
            }
        }

        return false;
    }
}
