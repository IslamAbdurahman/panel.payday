import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
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
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { IoCreate } from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

export default function CreateFirmModal() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        name: '',
        address: '',
        comment: '',
        branch_limit: '',
        branch_price: '',
        valid_date: ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/firm', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // 🔒 CLOSE MODAL HERE
                toast.success(t('created_successfully'));
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
                <Button variant="info" size="sm" className="px-1 py-1 font-medium">
                    <IoCreate />
                    {t('create')}
                </Button>
            </DialogTrigger>

            <DialogContent className={'dark:border-gray-400'}>
                <DialogTitle>{t('modal.create_title')}</DialogTitle>
                <DialogDescription>{t('modal.create_description')}</DialogDescription>

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
