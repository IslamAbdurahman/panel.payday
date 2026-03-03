import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Branch } from '@/types';
import { IoCreate } from 'react-icons/io5';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import { toast } from 'sonner';

interface createWorker {
    branch: Branch;
}

type FormData = {
    branch_id: number;
    work_time: string;
    end_time: string;
    hour_price: number;
    fine_price: number;
    name: string;
    phone: string;
    address: string;
    comment: string;
};

export default function CreateWorkerModal({ branch }: createWorker) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<FormData>({
        branch_id: branch.id,
        work_time: branch.work_time,
        end_time: branch.end_time,
        hour_price: branch.hour_price,
        fine_price: branch.fine_price,
        name: '',
        phone: '',
        address: '',
        comment: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/worker', {
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
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={'bg-blue-600 px-1 py-1 text-sm font-medium text-white dark:bg-blue-600'}>
                    <IoCreate />
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
                        <Label htmlFor="phone">{t('phone')}</Label>
                        <Input id="phone" ref={nameInput} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        <InputError message={errors.phone} />
                    </div>
                    <div>
                        <Label htmlFor="address">{t('address')}</Label>
                        <Input id="address" ref={nameInput} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        <InputError message={errors.address} />
                    </div>
                    <div>
                        <Label htmlFor="comment">{t('comment')}</Label>
                        <Input id="comment" ref={nameInput} value={data.comment} onChange={(e) => setData('comment', e.target.value)} />
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
                        <Input
                            id="hour_price"
                            type="number"
                            value={data.hour_price}
                            onChange={(e) => setData('hour_price', Number(e.target.value))}
                        />
                        <InputError message={errors.hour_price} />
                    </div>

                    <div>
                        <Label htmlFor="fine_price">{t('fine_price')}</Label>
                        <Input
                            id="fine_price"
                            type="number"
                            value={data.fine_price}
                            onChange={(e) => setData('fine_price', Number(e.target.value))}
                        />
                        <InputError message={errors.fine_price} />
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
