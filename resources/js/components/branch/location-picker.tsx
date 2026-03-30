import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LucideTarget, LucideLoader2, LucideSearch, LucideMapPin } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const defaultLat = parseFloat(latitude) || 41.2995; // Tashkent default
    const defaultLng = parseFloat(longitude) || 69.2401;

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error("Search error", error);
            toast.error("Qidiruvda xatolik yuz berdi");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: any) => {
        onChange(result.lat, result.lon);
        setSearchQuery(result.display_name);
        setShowResults(false);
        toast.info("Manzil tanlandi");
    };

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
                console.error("Geolocation error", error);
                toast.error("Joylashuvni aniqlab bo'lmadi. Ruxsat berilganiga ishonch hosil qiling.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <div className="relative h-[450px] w-full overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
            {/* SEARCH OVERLAY */}
            <div ref={searchRef} className="absolute top-2 left-2 z-[1001] w-[300px] sm:w-[400px]">
                <div className="relative">
                    <div className="relative">
                        <LucideSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Manzilni qidiring..."
                            className="bg-white pl-10 pr-10 shadow-lg dark:bg-gray-800"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchQuery.length >= 3 && setShowResults(true)}
                        />
                        {isSearching && (
                            <LucideLoader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                        )}
                    </div>

                    {showResults && searchResults.length > 0 && (
                        <div className="absolute mt-1 w-full overflow-hidden rounded-md border bg-white shadow-xl dark:bg-gray-800">
                            {searchResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="flex w-full items-start gap-2 p-3 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => handleSelectResult(result)}
                                >
                                    <LucideMapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                    <span className="line-clamp-2">{result.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* GPS BUTTON */}
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 z-[1000] bg-white/90 shadow-lg hover:bg-white dark:bg-gray-800/90"
                onClick={handleLocateMe}
                disabled={isLocating}
            >
                {isLocating ? (
                    <LucideLoader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                    <LucideTarget className="mr-1 h-4 w-4 text-blue-600" />
                )}
                {isLocating ? "..." : "GPS"}
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
