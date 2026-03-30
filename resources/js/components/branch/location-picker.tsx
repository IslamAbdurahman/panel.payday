import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LucideTarget, LucideLoader2 } from 'lucide-react';
import { toast } from 'sonner';

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

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    const prevPos = useRef({ lat, lng });

    useEffect(() => {
        if (lat && lng && (lat !== prevPos.current.lat || lng !== prevPos.current.lng)) {
            map.flyTo([lat, lng], map.getZoom() < 15 ? 15 : map.getZoom(), {
                duration: 1.5
            });
            prevPos.current = { lat, lng };
        }
    }, [lat, lng, map]);

    return null;
}

function LocationEvents({ onChange }: { onChange: (lat: string, lng: string) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat.toString(), e.latlng.lng.toString());
        },
    });
    return null;
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
    const [isLocating, setIsLocating] = useState(false);
    const hasAutoLocated = useRef(false);

    // Initial center if nothing is set
    const initialLat = parseFloat(latitude) || 41.2995;
    const initialLng = parseFloat(longitude) || 69.2401;

    const handleLocateMe = (isAuto = false) => {
        if (!navigator.geolocation) {
            if (!isAuto) toast.error("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
            return;
        }

        setIsLocating(true);
        if (!isAuto) toast.info("Joylashuv aniqlanmoqda...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                onChange(lat.toString(), lng.toString());
                setIsLocating(false);
                if (!isAuto) toast.success("Joylashuv muvaffaqiyatli aniqlandi");
            },
            (error) => {
                setIsLocating(false);
                if (!isAuto) {
                    console.error("Error getting location", error);
                    toast.error("Joylashuvni aniqlab bo'lmadi. Iltimos, xaritadan o'zingiz tanlang.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    // Auto-locate on first mount if coordinates are empty
    useEffect(() => {
        if (!latitude && !longitude && !hasAutoLocated.current) {
            hasAutoLocated.current = true;
            handleLocateMe(true);
        }
    }, []);

    const latNum = parseFloat(latitude) || initialLat;
    const lngNum = parseFloat(longitude) || initialLng;

    return (
        <div className="relative h-[400px] w-full overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 z-[1000] bg-white/90 shadow-md hover:bg-white dark:bg-gray-800/90"
                onClick={() => handleLocateMe(false)}
                disabled={isLocating}
            >
                {isLocating ? (
                    <LucideLoader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                    <LucideTarget className="mr-1 h-4 w-4" />
                )}
                {isLocating ? "Aniqlanmoqda..." : "GPS"}
            </Button>
            
            <MapContainer
                center={[latNum, lngNum]}
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapUpdater lat={latNum} lng={lngNum} />
                <LocationEvents onChange={onChange} />
                
                {latitude && longitude && (
                    <Marker position={[latNum, lngNum]} />
                )}
            </MapContainer>
        </div>
    );
}
