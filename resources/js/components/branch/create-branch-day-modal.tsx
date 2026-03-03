import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import 'react-time-picker/dist/TimePicker.css';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { IoCreate } from 'react-icons/io5';
import { Branch, Day } from '@/types';

interface createBranch {
    branch: Branch;
    days: Day[];
}

type FormData = {
    branch_id: number;
    day_ids: number[];
};

export default function CreateBranchDayModal({ branch, days }: createBranch) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<FormData>({
        branch_id: branch.id,
        day_ids: []
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/branch_day', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('created_successfully'));
                reset();
                clearErrors();
                setOpen(false);
            },
            onError: (err) => {
                // Display a friendly error message if available
                const errorMessage = err?.error || t('create_failed'); // Use fallback error message
                toast.error(errorMessage); // Display error message
            }

        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={'px-1 py-1 text-sm font-medium bg-blue-600 text-white dark:bg-blue-600 '}>
                    <IoCreate />
                </Button>
            </DialogTrigger>

            <DialogContent className="dark:border-gray-400">
                <DialogDescription>
                    <DialogTitle>{t('modal.create_title')}</DialogTitle>
                    <DialogDescription>{t('modal.create_description')}</DialogDescription>
                </DialogDescription>

                <form onSubmit={submit} className="space-y-4">
                    {/*<div>*/}
                    {/*    <Label htmlFor="name">{t('name')}</Label>*/}
                    {/*    <Input*/}
                    {/*        id="name"*/}
                    {/*        ref={nameInput}*/}
                    {/*        value={data.name}*/}
                    {/*        onChange={(e) => setData('name', e.target.value)}*/}
                    {/*    />*/}
                    {/*    <InputError message={errors.name} />*/}
                    {/*</div>*/}

                    <div>
                        <Label className={'py-5'}>{t('weekdays')}</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {days.map((day) => (
                                <label key={day.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={day.id}
                                        checked={data.day_ids.includes(day.id)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            if (checked) {
                                                setData('day_ids', [...data.day_ids, day.id]);
                                            } else {
                                                setData('day_ids', data.day_ids.filter(id => id !== day.id));
                                            }
                                        }}
                                    />
                                    <span>{day.name}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.day_ids} />
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
