import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, CheckCircle2, XCircle, Camera } from 'lucide-react';
import * as faceapi from 'face-api.js';

// Extend window for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
        }
    }
}

type LivenessAction = 'togri_qarang' | 'yonroqqa_qarang';
const ACTION_LABELS: Record<LivenessAction, string> = {
    togri_qarang: "Qulfni ochish uchun: Dastlab kameraga TO'G'RI qarang 📸",
    yonroqqa_qarang: "Endi boshingizni salgina YONBOSHGA (o'ngga yoki chapga) buring ↔️"
};

export default function MiniApp() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [worker, setWorker] = useState<any>(null);
    const [status, setStatus] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [pendingAction, setPendingAction] = useState<'checkIn' | 'checkOut' | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [aiStatusMessage, setAiStatusMessage] = useState<string>("Yuklanmoqda...");

    // Camera & Liveness state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [livenessQueue, setLivenessQueue] = useState<LivenessAction[]>([]);
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    const [cameraFeedback, setCameraFeedback] = useState<string>("Kamera ishga tushmoqda...");
    const [livenessPassed, setLivenessPassed] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loopRef = useRef<number | null>(null);

    // Initialize Telegram WebApp and Auth
    useEffect(() => {
        let isMounted = true;
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
                if (isMounted) setTimeout(initTelegram, 500);
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
                setAiStatusMessage("Modellar qidirilmoqda...");
                const MODEL_URL = window.location.origin + '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                setAiStatusMessage("Detector yuklandi...");
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                setAiStatusMessage("Landmark yuklandi...");
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                setAiStatusMessage("Tayyor!");
                if (isMounted) setModelsLoaded(true);
            } catch (err: any) {
                if (isMounted) {
                    setAiStatusMessage("Xatolik: " + err.message);
                    console.error("Modellarni yuklashda xatolik:", err);
                    if (window.Telegram?.WebApp?.showAlert) {
                        window.Telegram.WebApp.showAlert("AI Modellarini yuklashda xatolik: " + (err.message || String(err)));
                    } else alert("AI modellarni yuklashda xatolik yuz berdi");
                    setError("AI Modellarni yuklashda xato: " + (err.message || String(err)));
                    setLoading(false);
                }
            }
        };

        loadModels();
        
        return () => {
            isMounted = false;
            if (loopRef.current) cancelAnimationFrame(loopRef.current);
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
        if (loopRef.current) {
            cancelAnimationFrame(loopRef.current);
            loopRef.current = null;
        }
    };

    const triggerAction = async (type: 'checkIn' | 'checkOut') => {
        if (!location) {
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("Iltimos, avvalo qurilmangizdan joylashuv (GPS) aniqlanishiga ruxsat bering! Busiz davomat olinmaydi.");
            } else alert("Joylashuv (GPS) aniqlanmadi.");
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => console.error("Geolocation error", err),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            }
            return;
        }

        if (!modelsLoaded) {
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("AI Yuzni tekshirish tizimi ishga tushmoqda, iltimos ozgina kutib, qayta urinib ko'ring.");
            } else alert("Tizim ishga tushmoqda, biroz kuting.");
            return;
        }

        if (!worker?.avatar) {
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("Tizimda profil rasmingiz kiritilmagan. Davomat yuz aniqlash funksiyasisiz olinadi. Biroq kameraga qarab turing.");
            }
            // Proceed even without avatar, but liveness must still pass.
            // If they don't have avatar, we can skip liveness? User requirement implies liveness for ALL, but let's check liveness regardless.
        }

        setPendingAction(type);
        setLivenessPassed(false);
        setCameraFeedback("Kameraga qarab turing...");
        
        // State Transition Liveness Protocol
        // 1. Must see a straight frontal face (to prevent side-photo spoofing)
        // 2. Must see a turned face (to prevent straight-photo spoofing)
        setLivenessQueue(['togri_qarang', 'yonroqqa_qarang']);
        setCurrentActionIndex(0);
        
        setIsCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err: any) {
            console.error(err);
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("Kamerani ochishda xatolik yuz berdi. Ruxsatlarni tekshiring.");
            }
            setIsCameraActive(false);
            setPendingAction(null);
        }
    };

    const processLiveness = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || livenessPassed) return;

        try {
            const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            
            if (detection) {
                const landmarks = detection.landmarks.positions;
                const nose = landmarks[30];
                const leftJaw = landmarks[0];
                const rightJaw = landmarks[16];
                const chin = landmarks[8];
                const leftEye = landmarks[36];
                const rightEye = landmarks[45];

                // Use Euclidean distance (hypot) instead of raw X coordinates! 
                // This makes the measurement rotation-invariant (immune to head tilting / phone tilting).
                const leftSideDist = Math.hypot(nose.x - leftJaw.x, nose.y - leftJaw.y);
                const rightSideDist = Math.hypot(rightJaw.x - nose.x, rightJaw.y - nose.y);

                const eyeMidY = (leftEye.y + rightEye.y) / 2;
                const eyeMidX = (leftEye.x + rightEye.x) / 2;
                const topNoseDist = Math.hypot(nose.x - eyeMidX, nose.y - eyeMidY);
                const bottomNoseDist = Math.hypot(chin.x - nose.x, chin.y - nose.y);

                const currentAct = livenessQueue[currentActionIndex];

                setCameraFeedback(ACTION_LABELS[currentAct]);

                let actionPassed = false;

                if (currentAct === 'togri_qarang') {
                    // Face must be straight (distances nearly equal). 
                    // Set to 1.3 to easily pass even with mild asymmetry.
                    const maxDist = Math.max(leftSideDist, rightSideDist);
                    const minDist = Math.min(leftSideDist, rightSideDist);
                    if (maxDist < minDist * 1.3) {
                        actionPassed = true;
                    }
                } else if (currentAct === 'yonroqqa_qarang') {
                    // Face must be turned slightly left or right (diff > 1.45).
                    if (leftSideDist > rightSideDist * 1.45 || rightSideDist > leftSideDist * 1.45) {
                        actionPassed = true;
                    }
                }

                if (actionPassed) {
                    if (currentActionIndex + 1 < livenessQueue.length) {
                        // Play a little success tone if possible, then switch action
                        setCurrentActionIndex(curr => curr + 1);
                    } else {
                        // All actions complete!
                        setLivenessPassed(true);
                        setCameraFeedback("Ajoyib! Yuz mosligi tekshirilmoqda...");
                        await captureAndVerify();
                        return; // Stop the loop entirely
                    }
                }
            } else {
                setCameraFeedback("Yuzingizni kameraga to'g'rilang kadrda to'liq ko'rinsin!");
            }
        } catch (e) {
            console.error("Liveness exception", e);
        }

        if (isCameraActive && !livenessPassed) {
            // Processing delay to avoid heavy CPU block on mobile
            setTimeout(() => {
                loopRef.current = requestAnimationFrame(processLiveness);
            }, 200);
        }
    };

    // Trigger processLiveness when video actually starts playing
    const handleVideoPlay = () => {
        loopRef.current = requestAnimationFrame(processLiveness);
    };

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        // Draw to canvas
        const videoEl = videoRef.current;
        const canvasEl = canvasRef.current;
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        const ctx = canvasEl.getContext('2d');
        if (ctx) {
            // We DONT explicitly flip the canvas, we just draw the raw frame.
            ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        }
        
        // Convert to blob
        const blob = await new Promise<Blob | null>(resolve => canvasEl.toBlob(resolve, 'image/jpeg', 0.9));
        if (!blob) {
            alert("Rasm olishda xatolik yuz berdi.");
            stopCamera();
            setPendingAction(null);
            return;
        }
        const file = new File([blob], "snapshot.jpg", { type: "image/jpeg" });

        // Optionally Stop video visually early to show it's "frozen"
        videoEl.pause();

        // Face recognition verify
        if (worker?.avatar) {
            const isMatch = await verifyFace(file, worker.avatar);
            if (!isMatch) {
                stopCamera();
                setPendingAction(null);
                return;
            }
        }
        
        // Force unmount camera and Upload
        stopCamera();
        await submitAttendance(file);
    };

    const verifyFace = async (file: File, avatarUrl: string): Promise<boolean> => {
        try {
            const snapshotImg = await faceapi.bufferToImage(file);
            const snapshotDetection = await faceapi.detectSingleFace(snapshotImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            
            if (!snapshotDetection) {
                if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert("Olingan kadrda yuzingizni aniqlab bo'lmadi! Iltimos qayta urinib ko'ring.");
                } else alert("Yuz aniqlanmadi.");
                return false;
            }

            const avatarImg = await faceapi.fetchImage(`/storage/${avatarUrl}`);
            const avatarDetection = await faceapi.detectSingleFace(avatarImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

            if (!avatarDetection) {
                if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert("Tizimdagi profilingizdagi rasmdan yuz aniqlanmadi! Adminstratorga o'z ishingiz rasmizni sifatli qilib o'zgartirishni so'rang.");
                } else alert("Bazadagi rasm yaroqsiz.");
                return false;
            }

            const distance = faceapi.euclideanDistance(snapshotDetection.descriptor, avatarDetection.descriptor);
            console.log("Face distance", distance);
            
            if (distance < 0.6) {
                return true;
            } else {
                if (window.Telegram?.WebApp?.showAlert) {
                    window.Telegram.WebApp.showAlert("Kechirasiz, yuzingiz tizimdagi reytingizdagi rasmga (avatar) mos kelmadi!");
                } else alert("Yuzingiz mos kelmadi.");
                return false;
            }
        } catch (error) {
            console.error(error);
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert("Yuzni solishtirishda tizimli xatolik yuz berdi.");
            }
            return false;
        }
    };

    const submitAttendance = async (file: File) => {
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('telegram_id', worker.telegram_id.toString());
            if (pendingAction) formData.append('type', pendingAction);
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
        <div className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 font-sans relative">
            <Head>
                <script src="https://telegram.org/js/telegram-web-app.js"></script>
                <title>Davomat | Mini App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </Head>

            {/* Camera Overlay */}
            {isCameraActive && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-zinc-800">
                        
                        <div className="py-3 bg-zinc-900 border-b border-zinc-800 px-4 flex justify-between items-center text-white">
                            <span className="font-semibold text-sm flex items-center gap-2">
                                <Camera className="w-4 h-4 text-blue-400" /> 
                                Tiriklikni Tekshirish
                            </span>
                            <button onClick={stopCamera} className="text-zinc-400 p-1 bg-zinc-800 rounded-full hover:bg-zinc-700 hover:text-white transition-colors">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="relative w-full bg-black flex items-center justify-center object-cover overflow-hidden" style={{ aspectRatio: '3/4' }}>
                            <video 
                                ref={videoRef}
                                onPlay={handleVideoPlay}
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover transform -scale-x-100" 
                            />
                            
                            {/* Overlay UI */}
                            <div className="absolute top-4 left-0 right-0 px-4 flex justify-center">
                                <div className="bg-black/70 rounded-full py-2 px-6 backdrop-blur-md border border-white/10 text-center flex flex-col items-center shadow-lg">
                                    <h3 className="text-white font-bold text-lg">
                                        {cameraFeedback}
                                    </h3>
                                    {livenessQueue.length > 0 && !livenessPassed && (
                                        <p className="text-blue-300 font-medium text-xs mt-1 bg-blue-500/20 px-2 py-0.5 rounded-full">
                                            {currentActionIndex + 1}/{livenessQueue.length} topshiriq bajarilmoqda
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        
                    </div>
                </div>
            )}

            <div className={`mx-auto max-w-md space-y-6 pt-4 transition-opacity duration-300 ${isCameraActive ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                {/* Header Information */}
                <Card className="border-none shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                                {worker?.name?.charAt(0) || 'X'}
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl">{worker?.name}</CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <MapPin className="mr-1 h-3 w-3" /> 
                                    {worker?.branch?.name || 'Bosh ofis'}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="mt-3 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-md p-2 text-center text-zinc-600 dark:text-zinc-300">
                            🤖 AI Yuz Tekshiruvi: <span className={`font-semibold ${modelsLoaded ? 'text-green-600' : 'text-orange-500'}`}>{aiStatusMessage}</span>
                        </div>
                    </CardHeader>
                </Card>

                {/* Actions */}
                <div className="grid gap-4">
                    <Card className={`border-2 transition-all ${status?.has_checked_in ? 'border-green-100 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10' : 'shadow-sm'}`}>
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
                                    className="w-full h-16 text-lg rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-all transform active:scale-95"
                                    disabled={actionLoading}
                                    onClick={() => triggerAction('checkIn')}
                                >
                                    {actionLoading && pendingAction === 'checkIn' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ishga Keldim"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={`border-2 transition-all ${status?.has_checked_out ? 'border-orange-100 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-900/10' : 'shadow-sm'}`}>
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
                                    className="w-full h-16 text-lg rounded-xl shadow-sm border-zinc-200 transition-all transform active:scale-95"
                                    disabled={actionLoading || !status?.has_checked_in}
                                    onClick={() => triggerAction('checkOut')}
                                >
                                    {actionLoading && pendingAction === 'checkOut' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ishdan Ketdim"}
                                </Button>
                            )}
                            
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
