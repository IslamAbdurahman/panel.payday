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
            <DialogContent className="dark:border-gray-400">
                <DialogDescription>
                    <DialogTitle>{t('modal.update_title')}</DialogTitle>
                    <DialogDescription>{t('modal.update_description')}</DialogDescription>
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
                        <Label htmlFor="work_time">{t('work_time')}</Label>
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
                        <Label htmlFor="end_time">{t('end_time')}</Label>
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
