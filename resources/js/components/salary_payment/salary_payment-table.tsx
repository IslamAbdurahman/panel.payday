import React, { useState } from 'react';
import CreateSalaryPaymentModal from '@/components/salary_payment/create-salary_payment-modal';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UpdateSalaryPaymentModal from '@/components/salary_payment/update-salary_payment-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { SalaryPayment, type SalaryPaymentPaginate, SearchData, Worker } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SalaryPaymentTableProps extends SalaryPaymentPaginate {
    searchData: SearchData;
    workers: Worker[];
}

const Salary_paymentTable = ({ searchData, workers, ...salary_payment }: SalaryPaymentTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedSalaryPayment, setSelectedSalaryPayment] = useState<SalaryPayment | null>(null);

    const handleUpdateClick = (salary_paymentData: SalaryPayment) => {
        setSelectedSalaryPayment(salary_paymentData); // Set the selected salary_payment data
        setOpen(true); // Open the modal
    };

    const handleDeleteClick = (salary_paymentData: SalaryPayment) => {
        setSelectedSalaryPayment(salary_paymentData); // Set the selected salary_payment for deletion
        setOpenDelete(true); // Open the delete modal
    };

    const { delete: deleteSalaryPayment, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteSalaryPayment(`/salary_payment/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // 🔒 CLOSE MODAL HERE
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
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('comment')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('date')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            <CreateSalaryPaymentModal
                                workers={workers}
                            />
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {salary_payment.data.map((item, index) => {
                        const globalIndex = (salary_payment.current_page - 1) * salary_payment.per_page + index + 1;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.user?.name}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <Link href={`/worker/${item.worker?.id}`}>
                                        {item.worker?.name}
                                    </Link>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.worker?.branch?.firm?.name} ( {item.worker?.branch?.name} )
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.amount}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.comment}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {format(item.created_at, 'yyyy-MM-dd H:i:s')}
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">

                                    <div className="inline-flex shadow-sm">
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleUpdateClick(item)}
                                            className="rounded-none rounded-l-md"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteClick(item)}
                                            className="rounded-none rounded-r-md border-l-0"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>


                                </td>
                            </tr>
                        );
                    })}
                    </tbody>

                    {/* Place the UpdateSalaryPaymentModal here */}
                    {selectedSalaryPayment && open && (
                        <UpdateSalaryPaymentModal
                            salary_payment={selectedSalaryPayment}
                            open={open}
                            setOpen={setOpen}
                        />
                    )}

                    {/* Pass selected salary_payment to the DeleteSalaryPaymentModal */}
                    {selectedSalaryPayment && openDelete && (
                        <DeleteItemModal
                            item={selectedSalaryPayment}
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
                            from: salary_payment.from,
                            to: salary_payment.to,
                            total: salary_payment.total
                        })}
                    </div>
                    <div className="flex gap-1">
                        {salary_payment.links.map((link, index) => (
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

export default Salary_paymentTable;
