import DeleteItemModal from '@/components/delete-item-modal';
import CreateWorkerDayModal from '@/components/worker/create-worker-day-modal';
import { Day, Worker, WorkerDay } from '@/types';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type WorkerDayTableProps = {
    worker: Worker;
    days: Day[];
};

const WorkerDayTable = ({ worker, days }: WorkerDayTableProps) => {
    const { i18n, t } = useTranslation(); // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedWorkerDay, setSelectedWorkerDay] = useState<WorkerDay | null>(null);

    const handleDeleteClick = (worker_day: WorkerDay) => {
        setSelectedWorkerDay(worker_day);
        setOpenDelete(true);
    };
    const { delete: deleteWorkerDay, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        deleteWorkerDay(`/worker_day/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpenDelete(false); // 🔒 CLOSE MODAL HERE
                toast.success(t('deleted_successfully')); // Success message
            },
            onError: (err) => {
                // Display a friendly error message if available
                const errorMessage = err?.error || t('delete_failed'); // Use fallback error message
                toast.error(errorMessage); // Display error message
            },
        });
    };

    return (
        <div>
            <h3 className={'py-2 text-center capitalize'}>{t('worker_day')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('day')}</td>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                <CreateWorkerDayModal worker={worker} days={days} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {worker.worker_days?.map((item, index) => {
                            return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {i18n.language === 'uz' ? item.day?.name : i18n.language === 'ru' ? item.day?.name_ru : item.day?.name_en}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        <div className="inline-flex shadow-sm">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteClick(item)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Pass selected worker to the DeleteWorkerModal */}
                    {selectedWorkerDay && openDelete && (
                        <DeleteItemModal
                            item={selectedWorkerDay}
                            open={openDelete} // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete} // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}
                </table>
            </div>
        </div>
    );
};

export default WorkerDayTable;
