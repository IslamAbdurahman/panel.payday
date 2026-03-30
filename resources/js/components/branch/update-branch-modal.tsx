import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import TimePicker from 'react-time-picker';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle
} from '@/components/ui/dialog';
import { Branch } from '@/types';
import LocationPicker from '@/components/branch/location-picker';

interface UpdateBranchModalProps {
    branch: Branch;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function UpdateBranchModal({ branch, open, setOpen }: UpdateBranchModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        name: branch.name,
        address: branch.address,
        comment: branch.comment,
        work_time: branch.work_time,
        end_time: branch.end_time,
        hour_price: branch.hour_price,
        fine_price: branch.fine_price,
        telegram_group_id: branch.telegram_group_id ?? '',
        latitude: branch.latitude ?? '',
        longitude: branch.longitude ?? '',
        status: branch.status,
    });

    useEffect(() => {
        setData({
            name: branch.name,
            address: branch.address,
            comment: branch.comment,
            work_time: branch.work_time,
            end_time: branch.end_time,
            hour_price: branch.hour_price,
            fine_price: branch.fine_price,
            telegram_group_id: branch.telegram_group_id ?? '',
            latitude: branch.latitude ?? '',
            longitude: branch.longitude ?? '',
            status: branch.status,
        });
    }, [branch, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/branch/${branch.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // 🔒 CLOSE MODAL HERE
                toast.success(t('updated_successfully'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                // Display a friendly error message if available
                const errorMessage = err?.error || t('create_failed'); // Use fallback error message
                toast.error(errorMessage); // Display error message
            }
        });

    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="!max-w-[95%] !w-[95vw] lg:!max-w-[85vw] lg:!w-[85vw] xl:!max-w-[75vw] xl:!w-[75vw] dark:border-gray-400">
                <DialogDescription>
                    <DialogTitle>{t('modal.update_title')}</DialogTitle>
                    <DialogDescription>{t('modal.update_description')}</DialogDescription>
                </DialogDescription>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* LEFT COLUMN: INPUTS */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name">{t('name')}</Label>
                                    <Input id="name" ref={nameInput} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="address">{t('address')}</Label>
                                    <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                    <InputError message={errors.address} />
                                </div>

                                <div>
                                    <Label htmlFor="work_time">{t('work_time')}</Label>
                                    <TimePicker
                                        id="work_time"
                                        value={data.work_time}
                                        onChange={(time) => setData('work_time', time ?? '')}
                                        format="HH:mm"
                                        locale="sv-sv"
                                        disableClock={true}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                    />
                                    <InputError message={errors.work_time} />
                                </div>

                                <div>
                                    <Label htmlFor="end_time">{t('end_time')}</Label>
                                    <TimePicker
                                        id="end_time"
                                        value={data.end_time}
                                        onChange={(time) => setData('end_time', time ?? '')}
                                        format="HH:mm"
                                        locale="sv-sv"
                                        disableClock={true}
                                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                    />
                                    <InputError message={errors.end_time} />
                                </div>

                                <div>
                                    <Label htmlFor="hour_price">{t('hour_price')}</Label>
                                    <Input
                                        id="hour_price"
                                        type="number"
                                        value={data.hour_price}
                                        onChange={(e) => setData('hour_price', parseFloat(e.target.value))}
                                    />
                                    <InputError message={errors.hour_price} />
                                </div>

                                <div>
                                    <Label htmlFor="fine_price">{t('fine_price')}</Label>
                                    <Input
                                        id="fine_price"
                                        type="number"
                                        value={data.fine_price}
                                        onChange={(e) => setData('fine_price', parseFloat(e.target.value))}
                                    />
                                    <InputError message={errors.fine_price} />
                                </div>

                                <div>
                                    <Label htmlFor="telegram_group_id">{t('telegram_group_id')}</Label>
                                    <Input
                                        id="telegram_group_id"
                                        value={data.telegram_group_id}
                                        onChange={(e) => setData('telegram_group_id', e.target.value)}
                                    />
                                    <InputError message={errors.telegram_group_id} />
                                </div>

                                <div>
                                    <Label htmlFor="comment">{t('comment')}</Label>
                                    <Input id="comment" value={data.comment} onChange={(e) => setData('comment', e.target.value)} />
                                    <InputError message={errors.comment} />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="status" className="mb-2 block">{t('status')}</Label>
                                    <label className="inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            id="status"
                                            className="peer sr-only"
                                            checked={data.status === 1}
                                            onChange={(e) => setData('status', e.target.checked ? 1 : 0)}
                                        />
                                        <div className="peer relative h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"></div>
                                    </label>
                                    <InputError message={errors.status} />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: MAP */}
                        <div className="flex flex-col gap-4">
                            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
                                <Label className="mb-3 block text-base font-semibold">{t('location')}</Label>
                                <div className="mb-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="latitude" className="text-xs">{t('latitude')}</Label>
                                        <Input id="latitude" size={1} className="h-8 text-xs" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="longitude" className="text-xs">{t('longitude')}</Label>
                                        <Input id="longitude" size={1} className="h-8 text-xs" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} />
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-md border shadow-sm">
                                    <LocationPicker
                                        latitude={data.latitude}
                                        longitude={data.longitude}
                                        onChange={(lat, lng) => {
                                            setData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-2 border-t pt-4 gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                    setOpen(false);
                                }}
                            >
                                {t('cancel')}
                            </Button>
                        </DialogClose>

                        <Button type="submit" disabled={processing}>
                            {t('save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
