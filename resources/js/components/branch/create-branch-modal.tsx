import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import 'react-time-picker/dist/TimePicker.css';
import TimePicker from 'react-time-picker';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { IoCreate } from 'react-icons/io5';
import { Firm } from '@/types';

interface createBranch {
    firm: Firm;
}

export default function CreateBranchModal({ firm }: createBranch) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        firm_id: firm.id,
        name: '',
        address: '',
        comment: '',
        work_time: '',
        end_time: '',
        hour_price: '',
        fine_price: '',
        telegram_group_id: '',
        latitude: '',
        longitude: '',
        status: 1,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/branch', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('created_successfully'));
                reset();
                clearErrors();
                setOpen(false);
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
            <DialogTrigger asChild>
                <Button className={'bg-blue-600 px-1 py-1 text-sm font-medium text-white dark:bg-blue-600'}>
                    <IoCreate />
                    {t('create')}
                </Button>
            </DialogTrigger>

            <DialogContent className="dark:border-gray-400">
                <DialogDescription>
                    <DialogTitle>{t('modal.create_title')}</DialogTitle>
                    <DialogDescription>{t('modal.create_description')}</DialogDescription>
                </DialogDescription>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input id="name" ref={nameInput} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="address">{t('address')}</Label>
                        <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        <InputError message={errors.address} />
                    </div>

                    <div>
                        <Label htmlFor="comment">{t('comment')}</Label>
                        <Input id="comment" value={data.comment} onChange={(e) => setData('comment', e.target.value)} />
                        <InputError message={errors.comment} />
                    </div>

                    <div>
                        <Label htmlFor="work_time" className="mb-2 block">
                            {t('work_time')}
                        </Label>
                        <div>
                            <TimePicker
                                id="work_time"
                                value={data.work_time}
                                onChange={(time) => setData('work_time', time ?? '')}
                                format="HH:mm"
                                locale="sv-sv"
                                disableClock={true}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                            />
                        </div>
                        <InputError message={errors.work_time} />
                    </div>

                    <div>
                        <Label htmlFor="end_time" className="mb-2 block">
                            {t('end_time')}
                        </Label>
                        <div>
                            <TimePicker
                                id="end_time"
                                value={data.end_time}
                                onChange={(time) => setData('end_time', time ?? '')}
                                format="HH:mm"
                                locale="sv-sv"
                                disableClock={true}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                            />
                        </div>
                        <InputError message={errors.end_time} />
                    </div>

                    <div>
                        <Label htmlFor="hour_price">{t('hour_price')}</Label>
                        <Input id="hour_price" type="number" value={data.hour_price} onChange={(e) => setData('hour_price', e.target.value)} />
                        <InputError message={errors.hour_price} />
                    </div>

                    <div>
                        <Label htmlFor="fine_price">{t('fine_price')}</Label>
                        <Input id="fine_price" type="number" value={data.fine_price} onChange={(e) => setData('fine_price', e.target.value)} />
                        <InputError message={errors.fine_price} />
                    </div>

                    <div>
                        <Label htmlFor="telegram_group_id">{t('telegram_group_id')}</Label>
                        <Input id="telegram_group_id" value={data.telegram_group_id} onChange={(e) => setData('telegram_group_id', e.target.value)} />
                        <InputError message={errors.telegram_group_id} />
                    </div>

                    <div className="flex w-full gap-4">
                        <div className="w-1/2">
                            <Label htmlFor="latitude">{t('latitude')}</Label>
                            <Input id="latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} placeholder="41.2995" />
                            <InputError message={errors.latitude as string} />
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="longitude">{t('longitude')}</Label>
                            <Input id="longitude" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} placeholder="69.2401" />
                            <InputError message={errors.longitude as string} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
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
