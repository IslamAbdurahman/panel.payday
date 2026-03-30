import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    latitude: string;
    longitude: string;
    onChange: (lat: string, lng: string) => void;
}

function LocationMarker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: string, lng: string) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat.toString(), e.latlng.lng.toString());
        },
    });

    return <Marker position={[lat, lng]} />;
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
    const defaultLat = parseFloat(latitude) || 41.2995; // Tashkent default
    const defaultLng = parseFloat(longitude) || 69.2401;

    return (
        <div className="h-[300px] w-full overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
            <MapContainer
                center={[defaultLat, defaultLng]}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    lat={parseFloat(latitude) || defaultLat} 
                    lng={parseFloat(longitude) || defaultLng} 
                    onChange={onChange} 
                />
            </MapContainer>
        </div>
    );
}
