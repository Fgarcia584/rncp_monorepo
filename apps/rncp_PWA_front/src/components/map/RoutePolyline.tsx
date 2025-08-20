import React, { useEffect, useRef } from 'react';
import { Polyline, useMap, Marker, Popup } from 'react-leaflet';
import { decode as decodePolyline } from '@googlemaps/polyline-codec';
import { GoogleRoute, GoogleRouteStep } from '@rncp/types';
import L from 'leaflet';

interface RoutePolylineProps {
    route: GoogleRoute;
    color?: string;
    weight?: number;
    opacity?: number;
    animated?: boolean;
    showDirections?: boolean;
    onStepClick?: (step: GoogleRouteStep) => void;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({
    route,
    color = '#3B82F6',
    weight = 4,
    opacity = 0.7,
    animated = false,
    showDirections = false,
    onStepClick,
}) => {
    const map = useMap();
    const polylineRef = useRef<L.Polyline | null>(null);

    // Décoder le polyline de Google Maps
    const decodedCoordinates = React.useMemo(() => {
        if (!route.overviewPolyline?.points) return [];

        try {
            const decoded = decodePolyline(route.overviewPolyline.points);
            return decoded.map(([lat, lng]) => [lat, lng] as [number, number]);
        } catch (error) {
            console.error('Error decoding polyline:', error);
            return [];
        }
    }, [route.overviewPolyline?.points]);

    // Animation de tracé progressif
    useEffect(() => {
        if (!animated || !polylineRef.current || decodedCoordinates.length === 0) return;

        const polylineElement = polylineRef.current;
        const totalPoints = decodedCoordinates.length;
        let currentPoints = 1;

        const animatePolyline = () => {
            if (currentPoints <= totalPoints) {
                const visiblePoints = decodedCoordinates.slice(0, currentPoints);
                polylineElement.setLatLngs(visiblePoints);
                currentPoints++;
                setTimeout(animatePolyline, 50); // Animation par points toutes les 50ms
            }
        };

        // Commencer l'animation
        polylineElement.setLatLngs([]);
        animatePolyline();
    }, [animated, decodedCoordinates]);

    // Adapter la vue à la route
    useEffect(() => {
        if (route.bounds && map) {
            const bounds = L.latLngBounds(
                [route.bounds.southwest.latitude, route.bounds.southwest.longitude],
                [route.bounds.northeast.latitude, route.bounds.northeast.longitude],
            );
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [route.bounds, map]);

    if (decodedCoordinates.length === 0) {
        return null;
    }

    return (
        <>
            <Polyline
                ref={polylineRef}
                positions={animated ? [] : decodedCoordinates}
                color={color}
                weight={weight}
                opacity={opacity}
                smoothFactor={1.0}
            />

            {/* Marqueurs de direction optionnels */}
            {showDirections &&
                route.legs &&
                route.legs.map((leg, legIndex) =>
                    leg.steps.map((step, stepIndex) => (
                        <DirectionMarker
                            key={`${legIndex}-${stepIndex}`}
                            step={step}
                            onClick={() => onStepClick?.(step)}
                        />
                    )),
                )}
        </>
    );
};

interface DirectionMarkerProps {
    step: GoogleRouteStep;
    onClick?: () => void;
}

const DirectionMarker: React.FC<DirectionMarkerProps> = ({ step, onClick }) => {
    const iconHtml = `
        <div class="direction-marker bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
            ${getStepIcon(step.maneuver)}
        </div>
    `;

    const customIcon = L.divIcon({
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
        className: 'direction-marker-container',
    });

    return (
        <Marker
            position={[step.startLocation.latitude, step.startLocation.longitude]}
            icon={customIcon}
            eventHandlers={{
                click: onClick,
            }}
        >
            <Popup>
                <div className="p-2 max-w-xs">
                    <div className="text-xs" dangerouslySetInnerHTML={{ __html: step.htmlInstructions }} />
                    <div className="mt-1 text-xs text-gray-600">
                        {step.distance.text} • {step.duration.text}
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

const getStepIcon = (maneuver?: string): string => {
    if (!maneuver) return '→';

    switch (maneuver) {
        case 'turn-left':
            return '←';
        case 'turn-right':
            return '→';
        case 'turn-sharp-left':
            return '↙';
        case 'turn-sharp-right':
            return '↗';
        case 'uturn-left':
            return '↶';
        case 'uturn-right':
            return '↷';
        case 'straight':
            return '↑';
        case 'ramp-left':
            return '↖';
        case 'ramp-right':
            return '↗';
        case 'merge':
            return '⊃';
        case 'fork-left':
            return '⋔';
        case 'fork-right':
            return '⋓';
        case 'roundabout-left':
            return '⟲';
        case 'roundabout-right':
            return '⟳';
        default:
            return '→';
    }
};

interface MultiRoutePolylineProps {
    routes: GoogleRoute[];
    activeRouteIndex?: number;
    routeColors?: string[];
}

export const MultiRoutePolyline: React.FC<MultiRoutePolylineProps> = ({
    routes,
    activeRouteIndex = 0,
    routeColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
}) => {
    return (
        <>
            {routes.map((route, index) => (
                <RoutePolyline
                    key={index}
                    route={route}
                    color={routeColors[index % routeColors.length]}
                    weight={index === activeRouteIndex ? 6 : 3}
                    opacity={index === activeRouteIndex ? 0.9 : 0.5}
                    animated={index === activeRouteIndex}
                />
            ))}
        </>
    );
};
