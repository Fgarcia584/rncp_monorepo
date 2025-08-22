import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { Coordinates } from '../../types';
import { renderToString } from 'react-dom/server';

interface MarkerIconProps {
    type: 'delivery-person' | 'pickup' | 'delivery' | 'merchant' | 'current-location';
    className?: string;
}

const MarkerIcon: React.FC<MarkerIconProps> = ({ type, className = '' }) => {
    const getIconContent = () => {
        const baseClasses = `w-6 h-6 rounded-full border-2 flex items-center justify-center ${className}`;

        switch (type) {
            case 'delivery-person':
                return (
                    <div className={`${baseClasses} bg-blue-500 border-blue-700 text-white`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                    </div>
                );
            case 'pickup':
                return (
                    <div className={`${baseClasses} bg-orange-500 border-orange-700 text-white`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                    </div>
                );
            case 'delivery':
                return (
                    <div className={`${baseClasses} bg-green-500 border-green-700 text-white`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </div>
                );
            case 'merchant':
                return (
                    <div className={`${baseClasses} bg-purple-500 border-purple-700 text-white`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                );
            case 'current-location':
                return (
                    <div className={`${baseClasses} bg-red-500 border-red-700 text-white animate-pulse`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className={`${baseClasses} bg-gray-500 border-gray-700 text-white`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                );
        }
    };

    return getIconContent();
};

interface CustomMarkerProps {
    position: Coordinates;
    type: 'delivery-person' | 'pickup' | 'delivery' | 'merchant' | 'current-location';
    title?: string;
    description?: string;
    onClick?: () => void;
    className?: string;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
    position,
    type,
    title,
    description,
    onClick,
    className = '',
}) => {
    const iconHtml = renderToString(<MarkerIcon type={type} className={className} />);

    const customIcon = divIcon({
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
        className: 'custom-marker',
    });

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Marker
            position={[position.latitude, position.longitude]}
            icon={customIcon}
            eventHandlers={{
                click: handleClick,
            }}
        >
            {(title || description) && (
                <Popup>
                    <div className="p-2">
                        {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
                        {description && <p className="text-xs text-gray-600">{description}</p>}
                    </div>
                </Popup>
            )}
        </Marker>
    );
};

interface DeliveryPersonMarkerProps {
    position: Coordinates;
    name?: string;
    estimatedArrival?: string;
    onClick?: () => void;
}

export const DeliveryPersonMarker: React.FC<DeliveryPersonMarkerProps> = ({
    position,
    name,
    estimatedArrival,
    onClick,
}) => {
    return (
        <CustomMarker
            position={position}
            type="delivery-person"
            title={name || 'Livreur'}
            description={`${estimatedArrival ? `Arrivée: ${estimatedArrival}` : 'Livreur actif'}`}
            onClick={onClick}
        />
    );
};

interface OrderMarkerProps {
    position: Coordinates;
    orderId: number;
    customerName?: string;
    address?: string;
    type: 'pickup' | 'delivery';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    onClick?: () => void;
}

export const OrderMarker: React.FC<OrderMarkerProps> = ({
    position,
    orderId,
    customerName,
    address,
    type,
    priority,
    onClick,
}) => {
    return (
        <CustomMarker
            position={position}
            type={type}
            title={`Commande #${orderId}`}
            description={`${customerName ? `Client: ${customerName}` : ''}${address ? ` • ${address}` : ''}${priority ? ` • Priorité: ${priority}` : ''}`}
            onClick={onClick}
        />
    );
};
