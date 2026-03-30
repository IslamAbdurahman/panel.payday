import React, { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Firm, FirmHoliday } from '@/types';
import DeleteItemModal from '@/components/delete-item-modal';
import { toast } from 'sonner';
import CreateFirmHolidayModal from '@/components/firm/create-firm-holiday-modal';


type FirmHolidayTableProps = {
    firm: Firm;
};

const FirmHolidayTable = ({ firm }: FirmHolidayTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedFirmHoliday, setSelectedFirmHoliday] = useState<FirmHoliday | null>(null);


    const handleDeleteClick = (branch: FirmHoliday) => {
        setSelectedFirmHoliday(branch);
        setOpenDelete(true);
    };
    const { delete: deleteFirmHoliday, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteFirmHoliday(`/firm_holiday/${id}`, {
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

            <h3 className={'capitalize text-center py-2'}>{t('firm_holiday')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('name')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('date')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('comment')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            <CreateFirmHolidayModal firm={firm} />
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {firm.firm_holidays?.map((item, index) => {
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.name}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.date}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.comment}</td>
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

                    {/* Pass selected firm to the DeleteFirmModal */}
                    {selectedFirmHoliday && openDelete && (
                        <DeleteItemModal
                            item={selectedFirmHoliday}
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

export default FirmHolidayTable;
