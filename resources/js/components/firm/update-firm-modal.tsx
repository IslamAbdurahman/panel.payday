import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle
} from '@/components/ui/dialog';
import { Firm } from '@/types';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

interface UpdateFirmModalProps {
    firm: Firm
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function UpdateFirmModal({ firm, open, setOpen }: UpdateFirmModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        name: firm.name,
        address: firm.address,
        comment: firm.comment,
        branch_limit: firm.branch_limit,
        branch_price: firm.branch_price,
        valid_date: firm.valid_date,
        status: firm.status
    });

    useEffect(() => {
        setData({
            name: firm.name,
            address: firm.address,
            comment: firm.comment,
            branch_limit: firm.branch_limit,
            branch_price: firm.branch_price,
            valid_date: firm.valid_date,
            status: firm.status
        });
    }, [firm, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/firm/${firm.id}`, {
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
                        <Input
                            id="name"
                            ref={nameInput}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="address">{t('address')}</Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div>
                        <Label htmlFor="comment">{t('comment')}</Label>
                        <Input
                            id="comment"
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                        />
                        <InputError message={errors.comment} />
                    </div>

                    <div>
                        <Label htmlFor="branch_limit">{t('branch_limit')}</Label>
                        <Input
                            id="branch_limit"
                            type="number"
                            inputMode="numeric"
                            value={data.branch_limit}
                            onChange={(e) => setData('branch_limit', e.target.value)}
                        />
                        <InputError message={errors.branch_limit} />
                    </div>

                    <div>
                        <Label htmlFor="branch_price">{t('branch_price')}</Label>
                        <Input
                            id="branch_price"
                            type="number"
                            value={data.branch_price}
                            onChange={(e) => setData('branch_price', e.target.value)}
                        />
                        <InputError message={errors.branch_price} />
                    </div>


                    <div>
                        <Label htmlFor="valid_date" className="block mb-2">
                            {t('valid_date')}
                        </Label>
                        <div>
                            <DatePicker
                                id="work_time"
                                value={data.valid_date}
                                onChange={(date) => {
                                    // Format the selected date as 'YYYY-MM-DD' before updating the state
                                    setData('valid_date', date ? format(date, 'yyyy-MM-dd') : '');
                                }}
                                locale="sv-sv"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                        <InputError message={errors.valid_date} />
                    </div>

                    <div>
                        <Label htmlFor="status" className="mb-3 block">
                            {t('status')}
                        </Label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="status"
                                className="sr-only peer"
                                checked={data.status === 1}
                                onChange={(e) => setData('status', e.target.checked ? 1 : 0)}
                            />
                            <div
                                className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        </label>
                        <InputError message={errors.status} />
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={() => {
                                reset();
                                clearErrors();
                                setOpen(false);
                            }}>
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
