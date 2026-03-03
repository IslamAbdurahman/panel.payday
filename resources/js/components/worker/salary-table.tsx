import React, { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Worker, Salary } from '@/types';
import DeleteItemModal from '@/components/delete-item-modal';
import { toast } from 'sonner';
// import CreateSalaryModal from '@/components/worker/create-salary-payment-modal';


type SalaryTableProps = {
    worker: Worker;
};

const SalaryTable = ({ worker }: SalaryTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);


    const handleDeleteClick = (salary: Salary) => {
        setSelectedSalary(salary);
        setOpenDelete(true);
    };
    const { delete: deleteSalary, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {

        deleteSalary(`/salary/${id}`, {
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
            }
        });
    };

    return (
        <div>

            <h3 className={'capitalize text-center py-2'}>{t('salary')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('user')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('amount')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('minute')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('hour_price')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('from')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('to')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {/*<CreateSalaryModal worker={worker} />*/}
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {worker.salaries?.map((item, index) => {
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.user?.name}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.amount}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.worked_minute}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.hour_price}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.from}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.to}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">

                                    <div className="inline-flex shadow-sm">
                                        <button
                                            onClick={() => handleDeleteClick(item)}
                                            className="bg-red-500 px-3 py-2 text-sm font-medium text-white-700 border border-gray-400 hover:text-black hover:bg-gray-100 focus:z-10 rounded"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                </td>
                            </tr>
                        );
                    })}
                    </tbody>

                    {/* Pass selected worker to the DeleteWorkerModal */}
                    {selectedSalary && openDelete && (
                        <DeleteItemModal
                            item={selectedSalary}
                            open={openDelete}  // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete}  // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}

                </table>

            </div>
        </div>
    );
};

export default SalaryTable;
