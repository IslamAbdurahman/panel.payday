import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';

// Extend window for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
        }
    }
}

export default function MiniApp() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [worker, setWorker] = useState<any>(null);
    const [status, setStatus] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [pendingAction, setPendingAction] = useState<'checkIn' | 'checkOut' | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize Telegram WebApp and Auth
    useEffect(() => {
        const initTelegram = () => {
            if (window.Telegram && window.Telegram.WebApp) {
                const WebApp = window.Telegram.WebApp;
                WebApp.ready();
                WebApp.expand();
                
                if (WebApp.platform === "web" || WebApp.platform === "tdesktop") {
                    WebApp.requestFullscreen();
                }

                const user = WebApp.initDataUnsafe?.user;
                // For local dynamic testing without Telegram, you could supply a known telegram_id
                const telegramId = user?.id;

                if (!telegramId) {
                    setError("Avtorizatsiya xatosi: Telegram foydalanuvchi ma'lumotlari topilmadi. Ilovani faqat Telegram bot orqali oching.");
                    setLoading(false);
                    return;
                }

                // Authenticate with Backend
                authenticateWorker(telegramId);
            } else {
                // If not in Telegram, wait for the script to load and try again
                setTimeout(initTelegram, 500);
            }
        };

        initTelegram();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    console.error("Geolocation error", err);
                    if (window.Telegram?.WebApp?.showAlert) {
                        window.Telegram.WebApp.showAlert("Joylashuvni aniqlab bo'lmadi. Telefoningizdan ilovaga GPS ruxsatini bering.");
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
            } catch (err) {
                console.error("Modellarni yuklashda xatolik:", err);
            }
        };

        loadModels();

    }, []);

    const authenticateWorker = async (telegramId: number) => {
        try {
            const res = await axios.post('/api/bot/auth', { telegram_id: telegramId });
            if (res.data.success) {
                setWorker(res.data.worker);
                setStatus(res.data.status);
            } else {
                setError(res.data.message);
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Tizimga kirishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
            }
        } finally {
            setLoading(false);
        }
    };

    const triggerAction = (type: 'checkIn' | 'checkOut') => {
        if (!location) {
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("Iltimos, avvalo qurilmangizdan joylashuv (GPS) aniqlanishiga ruxsat bering! Busiz davomat olinmaydi.");
            } else alert("Joylashuv (GPS) aniqlanmadi.");
            
            // Try fetching again
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => console.error("Geolocation error", err),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
            return;
        }

        setPendingAction(type);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const verifyFace = async (file: File, avatarUrl: string): Promise<boolean> => {
        try {
            // Load the snapshot as an HTML image
            const snapshotImg = await faceapi.bufferToImage(file);
            
            // Generate descriptor for the snapshot
            const snapshotDetection = await faceapi.detectSingleFace(snapshotImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            if (!snapshotDetection) {
                if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert("Rasmdan yuzni aniqlab bo'lmadi! Iltimos, yuzingizni yorug'roq joyda kameraga to'g'irlab qayta urinib ko'ring.");
                } else alert("Yuz aniqlanmadi.");
                return false;
            }

            // Load the avatar image
            const avatarImg = await faceapi.fetchImage(`/storage/${avatarUrl}`);
            const avatarDetection = await faceapi.detectSingleFace(avatarImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

            if (!avatarDetection) {
                if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert("Bazadagi profil rasmingizdan yuz aniqlanmadi. Adminstratorga murojaat qiling.");
                } else alert("Bazadagi rasm yaroqsiz.");
                return false;
            }

            // Compare
            const distance = faceapi.euclideanDistance(snapshotDetection.descriptor, avatarDetection.descriptor);
            console.log("Face distance", distance);
            
            // Standard distance threshold for face recognition is 0.6
            if (distance < 0.6) {
                return true;
            } else {
                if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert("Kechirasiz, yuzingiz tizimdagi profil rasmingizga (avatarga) mos kelmadi!");
                } else alert("Yuzingiz mos kelmadi.");
                return false;
            }

        } catch (error) {
            console.error(error);
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("Yuzni solishtirishda kutilmagan xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
            }
            return false;
        }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !pendingAction || !worker?.telegram_id) {
            setPendingAction(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        
        setActionLoading(true);

        if (worker?.avatar && modelsLoaded) {
            const isMatch = await verifyFace(file, worker.avatar);
            if (!isMatch) {
                setActionLoading(false);
                setPendingAction(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
        } else if (!worker?.avatar) {
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("Tizimda profil rasmingiz kiritilmagan. Davomat yuz aniqlash funksiyasisiz olinadi.");
            }
        } else if (!modelsLoaded) {
            console.warn("Yuzni tanish modellari hali yuklanmagan...");
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("AI Yuzni tekshirish tizimi ishga tushmoqda, iltimos 2-3 soniya kutib, qayta urinib ko'ring.");
            } else alert("Tizim ishga tushmoqda, biroz kuting.");
            setActionLoading(false);
            setPendingAction(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('telegram_id', worker.telegram_id.toString());
            formData.append('type', pendingAction);
            formData.append('picture', file);
            
            if (location) {
                formData.append('latitude', location.lat.toString());
                formData.append('longitude', location.lng.toString());
            }

            const res = await axios.post('/api/bot/attendance', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                setStatus((prev: any) => ({
                    ...prev,
                    [pendingAction === 'checkIn' ? 'has_checked_in' : 'has_checked_out']: true,
                    [pendingAction === 'checkIn' ? 'check_in_time' : 'check_out_time']: res.data.time
                }));
                
                if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert(res.data.message);
                } else {
                    alert(res.data.message);
                }
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || "Davomatni saqlashda tarmoq xatosi yuz berdi.";
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert(msg);
            } else {
                alert(msg);
            }
        } finally {
            setActionLoading(false);
            setPendingAction(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Head>
                    <script src="https://telegram.org/js/telegram-web-app.js"></script>
                </Head>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-zinc-500 font-medium">Tizimga ulanmoqda...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
                <Head>
                    <script src="https://telegram.org/js/telegram-web-app.js"></script>
                </Head>
                <Card className="w-full max-w-sm border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 shadow-sm text-center">
                    <CardContent className="pt-6">
                        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Xatolik</h2>
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 font-sans">
            <Head>
                <script src="https://telegram.org/js/telegram-web-app.js"></script>
                <title>Davomat | Mini App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            <div className="mx-auto max-w-md space-y-6 pt-4">
                {/* Header Information */}
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                                {worker?.name?.charAt(0) || 'X'}
                            </div>
                            <div>
                                <CardTitle className="text-xl">{worker?.name}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <MapPin className="mr-1 h-3 w-3" /> 
                                    {worker?.branch?.name || 'Bosh ofis'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Actions */}
                <div className="grid gap-4">
                    <Card className={`border-2 ${status?.has_checked_in ? 'border-green-100 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10' : 'shadow-sm'}`}>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            {status?.has_checked_in ? (
                                <div className="text-center space-y-2">
                                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                                    <div className="text-lg font-medium text-green-700 dark:text-green-400">Ishga keldingiz</div>
                                    <div className="text-sm text-zinc-500">Vaqt: {status.check_in_time}</div>
                                </div>
                            ) : (
                                <Button 
                                    size="lg" 
                                    className="w-full h-16 text-lg rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={actionLoading}
                                    onClick={() => triggerAction('checkIn')}
                                >
                                    {actionLoading && pendingAction === 'checkIn' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ishga Keldim"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={`border-2 ${status?.has_checked_out ? 'border-orange-100 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-900/10' : 'shadow-sm'}`}>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            {status?.has_checked_out ? (
                                <div className="text-center space-y-2">
                                    <CheckCircle2 className="mx-auto h-12 w-12 text-orange-500" />
                                    <div className="text-lg font-medium text-orange-700 dark:text-orange-400">Ishdan ketdingiz</div>
                                    <div className="text-sm text-zinc-500">Vaqt: {status.check_out_time}</div>
                                </div>
                            ) : (
                                <Button 
                                    size="lg" 
                                    variant="outline"
                                    className="w-full h-16 text-lg rounded-xl shadow-sm border-zinc-200"
                                    disabled={actionLoading || !status?.has_checked_in}
                                    onClick={() => triggerAction('checkOut')}
                                >
                                    {actionLoading && pendingAction === 'checkOut' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ishdan Ketdim"}
                                </Button>
                            )}
                            
                            <input
                                type="file"
                                accept="image/*"
                                capture="user"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            {(!status?.has_checked_in && !status?.has_checked_out) && (
                                <p className="mt-4 text-xs text-center text-zinc-400">
                                    Siz hali ishga kelganingizni belgilamadingiz. Ruxsat yo'q.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
