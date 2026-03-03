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
import { Branch } from '@/types';
import { Input } from '@/components/ui/input';

interface createBranch {
    branch: Branch;
}

type FormData = {
    branch_id: number;
    mac_address: string;
};

export default function CreateBranchDeviceModal({ branch }: createBranch) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<FormData>({
        branch_id: branch.id,
        mac_address: ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/branch_device', {
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
                    <div>
                        <Label htmlFor="mac_address">{t('mac_address')}</Label>
                        <Input
                            id="mac_address"
                            ref={nameInput}
                            value={data.mac_address}
                            onChange={(e) => setData('mac_address', e.target.value)}
                        />
                        <InputError message={errors.mac_address} />
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
