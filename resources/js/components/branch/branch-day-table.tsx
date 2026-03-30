import React, { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Branch, BranchDay, Day } from '@/types';
import DeleteItemModal from '@/components/delete-item-modal';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import CreateBranchDayModal from '@/components/branch/create-branch-day-modal';


type BranchDayTableProps = {
    branch: Branch;
    days: Day[]
};

const BranchDayTable = ({ branch, days }: BranchDayTableProps) => {

    const { i18n, t } = useTranslation();  // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedBranchDay, setSelectedBranchDay] = useState<BranchDay | null>(null);

    const handleDeleteClick = (branch_day: BranchDay) => {
        setSelectedBranchDay(branch_day);
        setOpenDelete(true);
    };
    const { delete: deleteBranchDay, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {

        deleteBranchDay(`/branch_day/${id}`, {
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

            <h3 className={'capitalize text-center py-2'}>{t('branch_day')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('day')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            <CreateBranchDayModal branch={branch} days={days} />
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {branch.branch_days?.map((item, index) => {
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {i18n.language === 'uz' ? item.day?.name :
                                        i18n.language === 'ru' ? item.day?.name_ru :
                                            item.day?.name_en}
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

                    {/* Pass selected branch to the DeleteBranchModal */}
                    {selectedBranchDay && openDelete && (
                        <DeleteItemModal
                            item={selectedBranchDay}
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

export default BranchDayTable;
