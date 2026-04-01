import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { IoPencil } from 'react-icons/io5';
import { Input } from '@/components/ui/input';
import { Worker } from '@/types';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

interface Props {
    worker: Worker;
    open: boolean,
    setOpen: (open: boolean) => void;
}

export default function UpdateWorkerModal({ worker, open, setOpen }: Props) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        _method: 'put',
        name: worker.name || '',
        work_time: worker.work_time,
        end_time: worker.end_time,
        hour_price: worker.hour_price,
        fine_price: worker.fine_price,
        phone: worker.phone || '',
        address: worker.address || '',
        comment: worker.comment || '',
        status: worker.status,
        avatar: null as File | null,
    });

    useEffect(() => {
        if (open) {
            setData({
                _method: 'put',
                name: worker.name || '',
                work_time: worker.work_time,
                end_time: worker.end_time,
                hour_price: worker.hour_price,
                fine_price: worker.fine_price,
                phone: worker.phone || '',
                address: worker.address || '',
                comment: worker.comment || '',
                status: worker.status,
                avatar: null,
            });
        }
    }, [open, worker]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(`/worker/${worker.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('updated_successfully'));
                clearErrors();
                setOpen(false);
            },
            onError: (err) => {
                nameInput.current?.focus();
                const errorMessage = err?.error || t('create_failed');
                toast.error(errorMessage);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl dark:border-gray-400">
                <DialogHeader>
                    <DialogTitle>{t('modal.update_title')}</DialogTitle>
                    <DialogDescription>{t('modal.update_description')}</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit}>
                    <div className="max-h-[65vh] overflow-y-auto px-1 pr-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('name')}</Label>
                                <Input id="name" ref={nameInput} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('phone')}</Label>
                                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">{t('address')}</Label>
                                <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                <InputError message={errors.address} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">{t('comment')}</Label>
                                <Input id="comment" value={data.comment} onChange={(e) => setData('comment', e.target.value)} />
                                <InputError message={errors.comment} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="avatar">{t('avatar')}</Label>
                                <Input id="avatar" type="file" accept="image/*" onChange={(e) => setData('avatar', e.target.files?.[0] || null)} />
                                <InputError message={errors.avatar as string} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="work_time" className="block text-sm font-medium">
                                    {t('work_time')}
                                </Label>
                                <TimePicker
                                    id="work_time"
                                    value={data.work_time}
                                    onChange={(time) => setData('work_time', time ?? '')}
                                    format="HH:mm"
                                    locale="sv-sv"
                                    disableClock={true}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                />
                                <InputError message={errors.work_time} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_time" className="block text-sm font-medium">
                                    {t('end_time')}
                                </Label>
                                <TimePicker
                                    id="end_time"
                                    value={data.end_time}
                                    onChange={(time) => setData('end_time', time ?? '')}
                                    format="HH:mm"
                                    locale="sv-sv"
                                    disableClock={true}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-white"
                                />
                                <InputError message={errors.end_time} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hour_price">{t('hour_price')}</Label>
                                <Input
                                    id="hour_price"
                                    type="number"
                                    value={data.hour_price}
                                    onChange={(e) => setData('hour_price', parseFloat(e.target.value))}
                                />
                                <InputError message={errors.hour_price} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fine_price">{t('fine_price')}</Label>
                                <Input
                                    id="fine_price"
                                    type="number"
                                    value={data.fine_price}
                                    onChange={(e) => setData('fine_price', parseFloat(e.target.value))}
                                />
                                <InputError message={errors.fine_price} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="status" className="mb-3 block">
                                    {t('status')}
                                </Label>
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

                    <DialogFooter className="mt-6 gap-2 border-t pt-4">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    clearErrors();
                                    setOpen(false);
                                }}
                            >
                                {t('cancel')}
                            </Button>
                        </DialogClose>

                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 font-medium text-white transition-colors">
                            {t('update')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
