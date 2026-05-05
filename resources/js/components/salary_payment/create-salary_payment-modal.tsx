import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
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
import { Worker } from '@/types';

interface PageProps {
    workers: Worker[];
}

export default function CreateSalaryPaymentModal({ workers }: PageProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        worker_id: 0,
        amount: 0,
        comment: ''
    });

    const fetchBalance = async (workerId: number) => {
        setBalanceLoading(true);
        try {
            const response = await fetch(`/salary_payment/worker_balance/${workerId}`);
            const result = await response.json();
            setBalance(result.balance);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            setBalance(null);
        } finally {
            setBalanceLoading(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/salary_payment', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setBalance(null);
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
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                reset();
                setBalance(null);
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="info" size="sm" className="px-2">
                    <IoCreate />
                    {t('create')}
                </Button>
            </DialogTrigger>

            <DialogContent className={'dark:border-gray-400'}>
                <DialogTitle>{t('modal.create_title')}</DialogTitle>
                <DialogDescription>{t('modal.create_description')}</DialogDescription>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="worker_id">{t('worker')}</Label>

                        <Select
                            value={data.worker_id?.toString() ?? 'placeholder'} // 👈 must be a string
                            onValueChange={(val) => {
                                if (val === 'placeholder') return;
                                const id = parseInt(val);
                                setData('worker_id', id); // 👈 keep storing as number
                                fetchBalance(id);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('select')} />
                            </SelectTrigger>
                            <SelectContent>
                                {workers.map((worker) => (
                                    <SelectItem
                                        key={worker.id}
                                        value={worker.id.toString()} // 👈 must be string to match
                                    >
                                        {worker.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {balanceLoading && <p className="text-xs text-gray-500 mt-1">Yuklanmoqda...</p>}
                        {balance !== null && !balanceLoading && (
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">
                                {t('balance')}: {balance.toLocaleString('ru-RU')}
                            </p>
                        )}

                        <InputError message={errors.worker_id} />
                    </div>

                    <div>
                        <Label htmlFor="amount">{t('amount')}</Label>
                        <Input
                            type={'number'}
                            id="amount"
                            ref={nameInput}
                            value={data.amount > 0 ? data.amount : ''}
                            onChange={(e) => setData('amount', parseInt(e.target.value))}
                        />
                        <InputError message={errors.amount} />
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
