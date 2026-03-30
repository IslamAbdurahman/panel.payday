import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
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

function LocationMarker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: string, lng: string) => void }) {
    const map = useMap();
    
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat.toString(), e.latlng.lng.toString());
        },
    });

    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);

    return <Marker position={[lat, lng]} />;
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
    const [isLocating, setIsLocating] = useState(false);
    const defaultLat = parseFloat(latitude) || 41.2995; // Tashkent default
    const defaultLng = parseFloat(longitude) || 69.2401;

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi");
            return;
        }

        setIsLocating(true);
        toast.info("Joylashuv aniqlanmoqda...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                onChange(lat.toString(), lng.toString());
                setIsLocating(false);
                toast.success("Joylashuv muvaffaqiyatli aniqlandi");
            },
            (error) => {
                setIsLocating(false);
                console.error("Error getting location", error);
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error("Geolokatsiyadan foydalanishga ruxsat berilmadi");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error("Joylashuv ma'lumotlarini olib bo'lmadi");
                        break;
                    case error.TIMEOUT:
                        toast.error("Joylashuvni aniqlash vaqti tugadi");
                        break;
                    default:
                        toast.error("Joylashuvni aniqlashda xatolik yuz berdi");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <div className="relative h-[350px] w-full overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 z-[1000] bg-white/90 shadow-md hover:bg-white dark:bg-gray-800/90"
                onClick={handleLocateMe}
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
                center={[defaultLat, defaultLng]}
                zoom={15}
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
