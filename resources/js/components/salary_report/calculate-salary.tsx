import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Report, SearchData } from '@/types';
import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface CalculateSalaryProps {
    report: Report;
    search_data: SearchData;
}

const CalculateSalary = ({ report, search_data }: CalculateSalaryProps) => {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    // Summani hisoblash va yaxlitlash (round)
    const initialAmount = Math.round(((report.worked_minutes - report.break_minutes) * (report?.hour_price ?? 0)) / 60);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        worker_id: search_data.worker_id,
        amount: initialAmount,
        worked_minute: report.worked_minutes,
        break_minute: report.break_minutes,
        hour_price: report.hour_price,
        from: report.from,
        to: report.to,
        comment: '',
    });

    // Raqamni "120 000" ko'rinishiga keltirish
    const formatNumber = (num: number | string) => {
        const value = String(num).replace(/\D/g, ''); // Faqat raqamlarni qoldirish
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Har 3 ta raqamdan keyin bo'shliq qo'shish
    };

    // Input o'zgarganda formatni buzmasdan raqamni saqlash
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\s/g, ''); // Bo'shliqlarni olib tashlash
        const numValue = parseInt(rawValue) || 0;
        setData('amount', numValue);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/salary`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setData('amount', 0);
                setData('comment', '');
                toast.success(t('created_successfully'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                const errorMessage = err?.error || t('create_failed');
                toast.error(errorMessage);
            },
        });
    };

    return (
        <div className={'border-white'}>
            <h3 className={'py-2 text-center capitalize'}>{t('salary')}</h3>
            <div className="overflow-x-auto rounded border-2 border-solid border-gray-400 p-4">
                <form className="space-y-4" onSubmit={submit}>
                    <div>
                        <Label htmlFor="amount">{t('amount')}</Label>
                        <Input
                            type={'text'} // Space ishlashi uchun text bo'lishi kerak
                            id="amount"
                            ref={nameInput}
                            value={formatNumber(data.amount)}
                            onChange={handleAmountChange}
                        />
                        <InputError message={errors.amount} />
                    </div>
                    <div>
                        <Label htmlFor="comment">{t('comment')}</Label>
                        <Input type={'text'} id="comment" value={data.comment} onChange={(e) => setData('comment', e.target.value)} />
                        <InputError message={errors.comment} />
                    </div>

                    <div className="flex justify-between">
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                }}
                            >
                                {t('clear')}
                            </Button>
                        </div>
                        <Button type="submit" disabled={processing}>
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalculateSalary;
