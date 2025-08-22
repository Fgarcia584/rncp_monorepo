import { decode } from '@googlemaps/polyline-codec';
import { LatLngExpression } from 'leaflet';

/**
 * Décode une polyline Google Maps en tableau de coordonnées Leaflet
 */
export function decodeGooglePolyline(encodedPolyline: string): LatLngExpression[] {
    if (!encodedPolyline || typeof encodedPolyline !== 'string') {
        console.warn('⚠️ Polyline encodée invalide:', encodedPolyline);
        return [];
    }
    
    try {
        const decodedCoordinates = decode(encodedPolyline);
        
        if (!Array.isArray(decodedCoordinates)) {
            console.warn('⚠️ Résultat de décodage invalide');
            return [];
        }
        
        // Convertir les coordonnées [lat, lng] en format compatible Leaflet
        return decodedCoordinates.map(([lat, lng]) => [lat, lng] as LatLngExpression);
    } catch (error) {
        console.error('❌ Erreur lors du décodage de la polyline:', error);
        return [];
    }
}

/**
 * Extrait les coordonnées du trajet depuis une réponse Google Directions
 */
export function extractRouteCoordinates(directionsResult: google.maps.DirectionsResult): LatLngExpression[] {
    console.log('🔍 Extraction des coordonnées de route - Début');
    
    const route = directionsResult.routes[0];
    if (!route) {
        console.warn('⚠️ Aucune route trouvée dans directionsResult');
        return [];
    }
    
    console.log('📍 Route trouvée:', {
        hasOverviewPolyline: !!route.overview_polyline,
        hasPoints: !!(route.overview_polyline as any)?.points,
        pointsLength: (route.overview_polyline as any)?.points?.length || 0,
        legsCount: route.legs?.length || 0
    });
    
    if (!route.overview_polyline || !(route.overview_polyline as any).points) {
        console.warn('⚠️ Pas de overview_polyline, tentative avec les polylines individuelles des legs');
        return extractRouteCoordinatesFromLegs(directionsResult);
    }
    
    console.log('🔗 Polyline overview trouvée:', (route.overview_polyline as any).points.substring(0, 100) + '...');
    
    try {
        const coordinates = decodeGooglePolyline((route.overview_polyline as any).points);
        console.log('✅ Coordonnées extraites de overview_polyline:', coordinates.length, 'points');
        return coordinates;
    } catch (error) {
        console.error('❌ Erreur lors du décodage de la overview_polyline:', error);
        console.log('🔄 Fallback vers les polylines des legs');
        return extractRouteCoordinatesFromLegs(directionsResult);
    }
}

/**
 * Extrait les coordonnées du trajet à partir des polylines individuelles des legs
 */
function extractRouteCoordinatesFromLegs(directionsResult: google.maps.DirectionsResult): LatLngExpression[] {
    console.log('🦵 Extraction depuis les legs individuels');
    
    const route = directionsResult.routes[0];
    if (!route || !route.legs) {
        console.warn('⚠️ Pas de legs trouvés');
        return [];
    }
    
    const allCoordinates: LatLngExpression[] = [];
    
    route.legs.forEach((leg, legIndex) => {
        console.log(`🦵 Traitement du leg ${legIndex + 1}/${route.legs.length}:`, {
            hasSteps: !!leg.steps,
            stepsCount: leg.steps?.length || 0
        });
        
        if (!leg.steps) {
            console.warn(`⚠️ Pas de steps dans le leg ${legIndex + 1}`);
            return;
        }
        
        leg.steps.forEach((step, stepIndex) => {
            if (step.polyline && step.polyline.points) {
                try {
                    const stepCoordinates = decodeGooglePolyline(step.polyline.points);
                    console.log(`📍 Step ${stepIndex + 1}: ${stepCoordinates.length} coordonnées`);
                    allCoordinates.push(...stepCoordinates);
                } catch (error) {
                    console.error(`❌ Erreur lors du décodage du step ${stepIndex + 1}:`, error);
                }
            } else {
                console.warn(`⚠️ Pas de polyline dans le step ${stepIndex + 1}`);
            }
        });
    });
    
    console.log(`✅ Total des coordonnées extraites des legs: ${allCoordinates.length} points`);
    return allCoordinates;
}

/**
 * Extrait les points de waypoints depuis une réponse Google Directions
 */
export function extractWaypoints(directionsResult: google.maps.DirectionsResult): {
    lat: number;
    lng: number;
    address: string;
    optimizedIndex: number;
}[] {
    const route = directionsResult.routes[0];
    if (!route || !route.legs) {
        return [];
    }
    
    const waypoints: {
        lat: number;
        lng: number;
        address: string;
        optimizedIndex: number;
    }[] = [];
    
    // Point de départ
    const firstLeg = route.legs[0];
    if (firstLeg.start_location) {
        waypoints.push({
            lat: firstLeg.start_location.lat(),
            lng: firstLeg.start_location.lng(),
            address: firstLeg.start_address,
            optimizedIndex: -1 // Point de départ
        });
    }
    
    // Points intermédiaires (livraisons)
    route.legs.forEach((leg, index) => {
        if (leg.end_location) {
            waypoints.push({
                lat: leg.end_location.lat(),
                lng: leg.end_location.lng(),
                address: leg.end_address,
                optimizedIndex: index
            });
        }
    });
    
    return waypoints;
}

/**
 * Calcule les bounds pour centrer la carte sur le trajet
 */
export function calculateRouteBounds(coordinates: LatLngExpression[]): {
    northEast: [number, number];
    southWest: [number, number];
} {
    if (coordinates.length === 0) {
        // Bounds par défaut (Paris)
        return {
            northEast: [48.9, 2.4],
            southWest: [48.8, 2.3]
        };
    }
    
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    
    coordinates.forEach(coord => {
        const [lat, lng] = Array.isArray(coord) ? coord : [coord.lat, coord.lng];
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
    });
    
    return {
        northEast: [maxLat, maxLng],
        southWest: [minLat, minLng]
    };
}