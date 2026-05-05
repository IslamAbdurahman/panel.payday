import React, { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import DeleteItemModal from '@/components/delete-item-modal';
import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Salary, type SalaryPaginate, SearchData } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface SalaryTableProps extends SalaryPaginate {
    searchData: SearchData;
}

const SalaryTable = ({ searchData, ...salary }: SalaryTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);


    const handleDeleteClick = (salaryData: Salary) => {
        setSelectedSalary(salaryData); // Set the selected salary for deletion
        setOpenDelete(true); // Open the delete modal
    };


    const { delete: deleteSalary, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(id);  // Log to see if errors are populated

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
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('user')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('worker')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('firm')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('amount')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('worked_minutes')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('break_minutes')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('hour_price')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('from')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('to')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('date')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('action')}</td>

                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {salary.data.map((item, index) => {
                        const globalIndex = (salary.current_page - 1) * salary.per_page + index + 1;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.user?.name}
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <Link href={`/worker/${item.worker?.id}`}>
                                        {item.worker?.name}
                                    </Link>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.worker?.branch?.firm?.name} ( {item.worker?.branch?.name} )
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.amount}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.worked_minute} ({~~(item.worked_minute! / 60)} : {item.worked_minute! % 60})
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.break_minute} ({~~(item.break_minute! / 60)} : {item.break_minute! % 60})
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.hour_price}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.from}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.to}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {format(item.created_at, 'yyyy-MM-dd H:i:s')}
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">

                                    <div className="inline-flex shadow-sm">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteClick(item)}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>


                                </td>
                            </tr>
                        );
                    })}
                    </tbody>

                    {/* Pass selected salary to the DeleteSalaryModal */}
                    {selectedSalary && openDelete && (
                        <DeleteItemModal
                            item={selectedSalary}
                            open={openDelete}  // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete}  // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}

                </table>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <div>
                        {t('showing', {
                            from: salary.from,
                            to: salary.to,
                            total: salary.total
                        })}
                    </div>
                    <div className="flex gap-1">
                        {salary.links.map((link, index) => (
                            <Link
                                key={index}
                                href={`${link.url ?? '?'}&search=${searchData.search}&per_page=${searchData.per_page}`}
                                className={`px-3 py-1 rounded-md text-sm transition ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : !link.url
                                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default SalaryTable;
