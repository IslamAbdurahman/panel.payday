import React, { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Branch, BranchDevice } from '@/types';
import DeleteItemModal from '@/components/delete-item-modal';
import { toast } from 'sonner';
import CreateBranchDeviceModal from '@/components/branch/create-branch-device-modal';


type BranchDeviceTableProps = {
    branch: Branch;
};

const BranchDeviceTable = ({ branch }: BranchDeviceTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedBranchDevice, setSelectedBranchDevice] = useState<BranchDevice | null>(null);

    const handleDeleteClick = (branch_device: BranchDevice) => {
        setSelectedBranchDevice(branch_device);
        setOpenDelete(true);
    };
    const { delete: deleteBranchDevice, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {

        deleteBranchDevice(`/branch_device/${id}`, {
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

            <h3 className={'capitalize text-center py-2'}>{t('branch_device')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('mac_address')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            <CreateBranchDeviceModal branch={branch} />
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {branch.branch_devices?.map((item, index) => {
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.mac_address}</td>
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

                    {/* Pass selected branch to the DeleteBranchModal */}
                    {selectedBranchDevice && openDelete && (
                        <DeleteItemModal
                            item={selectedBranchDevice}
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

export default BranchDeviceTable;
