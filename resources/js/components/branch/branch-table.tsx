import React, { useState } from 'react';
import UpdateBranchModal from '@/components/branch/update-branch-modal';
import { CalendarIcon, CheckCircle, MinusCircle, PencilIcon, TrashIcon } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Branch, Firm } from '@/types';
import DeleteItemModal from '@/components/delete-item-modal';
import { toast } from 'sonner';
import CreateBranchModal from '@/components/branch/create-branch-modal';


type BranchTableProps = {
    firm: Firm;
};

const BranchTable = ({ firm }: BranchTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    const handleUpdateClick = (branch: Branch) => {
        setSelectedBranch(branch);
        setOpen(true);
    };

    const handleDeleteClick = (branch: Branch) => {
        setSelectedBranch(branch);
        setOpenDelete(true);
    };
    const { delete: deleteFirm, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteFirm(`/branch/${id}`, {
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

            <h3 className={'capitalize text-center py-2'}>{t('branch')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('name')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('address')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('telegram_group_id')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('comment')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('work_time')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('end_time')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('hour_price')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('fine_price')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('worker')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('status')}</td>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                <CreateBranchModal firm={firm} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {firm.branches?.map((item, index) => {
                            return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{index + 1}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                        <Link href={`/branch/${item.id}`}>
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.address}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.telegram_group_id}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.comment}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.work_time}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.end_time}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.hour_price}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.fine_price}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item?.workers_count}</td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                        {item.status == 1 ?
                                            <CheckCircle />
                                            : <MinusCircle />
                                        }
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">

                                        <div className="inline-flex shadow-sm">
                                            <Link href={`/daily_attendance/${item.id}`}
                                                className="bg-gray-700 px-4 py-2 text-sm font-medium text-white-700 border border-gray-400 hover:text-black hover:bg-gray-100 focus:z-10 rounded-l-md"
                                            >
                                                <CalendarIcon className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleUpdateClick(item)}
                                                className="bg-green-600 px-4 py-2 text-sm font-medium text-white-700 border border-gray-400 hover:text-black hover:bg-gray-100 focus:z-10 "
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="bg-red-500 px-4 py-2 text-sm font-medium text-white-700 border-t border-b border-gray-400 hover:text-black hover:bg-gray-100 focus:z-10 rounded-r-md"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>


                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Place the UpdateBranchModal here */}
                    {selectedBranch && open && (
                        <UpdateBranchModal
                            branch={selectedBranch}
                            open={open}
                            setOpen={setOpen}
                        />
                    )}

                    {/* Pass selected firm to the DeleteFirmModal */}
                    {selectedBranch && openDelete && (
                        <DeleteItemModal
                            item={selectedBranch}
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

export default BranchTable;
