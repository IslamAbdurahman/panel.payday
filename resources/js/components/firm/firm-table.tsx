import React, { useState } from 'react';
import CreateFirmModal from '@/components/firm/create-firm-modal';
import { CheckCircle, MinusCircle, PencilIcon, Settings, TrashIcon } from 'lucide-react';
import UpdateFirmModal from '@/components/firm/update-firm-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Auth, Firm, type FirmPaginate, SearchData } from '@/types';
import { toast } from 'sonner';
import FirmSettingModal from '@/components/firm/firm-setting-modal';

interface FirmTableProps extends FirmPaginate {
    searchData: SearchData;
}

const FirmTable = ({ searchData, ...firm }: FirmTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openSetting, setOpenSetting] = useState(false);
    const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');

    const handleUpdateClick = (firmData: Firm) => {
        setSelectedFirm(firmData); // Set the selected firm data
        setOpen(true); // Open the modal
    };

    const handleDeleteClick = (firmData: Firm) => {
        setSelectedFirm(firmData); // Set the selected firm for deletion
        setOpenDelete(true); // Open the delete modal
    };

    const handleSeetingClick = (firmData: Firm) => {
        setSelectedFirm(firmData); // Set the selected firm for deletion
        setOpenSetting(true); // Open the delete modal
    };

    const { delete: deleteFirm, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteFirm(`/firm/${id}`, {
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
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('name')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('user')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('address')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('comment')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('worker')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('branch_limit')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('branch_price')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('valid_date')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('status')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {isAdmin &&
                                <CreateFirmModal />
                            }
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {firm.data.map((item, index) => {
                        const globalIndex = (firm.current_page - 1) * firm.per_page + index + 1;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <Link href={`/firm/${item.id}`}>
                                        {item.name}
                                    </Link>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 space-x-1">
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-800 dark:text-gray-200">
                                        {item.user_firms?.map(user_firm => (
                                            <li key={user_firm.id}>
                                                <span className="font-medium">{user_firm.user?.name ?? '—'}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.address}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.comment}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.workers_count}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.branch_limit}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.branch_price}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.valid_date}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.status == 1 ?
                                        <CheckCircle />
                                        : <MinusCircle />
                                    }
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">

                                    <div className="inline-flex shadow-sm">

                                        <button
                                            onClick={() => handleSeetingClick(item)}
                                            className="border-y-gray-400 px-4 py-2 text-sm font-medium text-white-700 border border-gray-400 hover:text-black hover:bg-gray-100 focus:z-10 rounded-l-md"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>

                                        {isAdmin &&
                                            <button
                                                onClick={() => handleUpdateClick(item)}
                                                className="bg-green-600 px-4 py-2 text-sm font-medium text-white-700 border border-gray-400 hover:text-black hover:bg-gray-100 focus:z-10"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        }

                                        {isAdmin &&
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="bg-red-500 px-4 py-2 text-sm font-medium text-white-700 border-t border-b border-gray-400 hover:text-black hover:bg-gray-100 focus:z-10 rounded-r-md"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        }

                                    </div>


                                </td>
                            </tr>
                        );
                    })}
                    </tbody>

                    {/* Place the UpdateFirmModal here */}
                    {selectedFirm && open && (
                        <UpdateFirmModal
                            firm={selectedFirm}
                            open={open}
                            setOpen={setOpen}
                        />
                    )}

                    {/* Pass selected firm to the DeleteFirmModal */}
                    {selectedFirm && openDelete && (
                        <DeleteItemModal
                            item={selectedFirm}
                            open={openDelete}  // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete}  // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}

                    {/* Pass selected firm to the DeleteFirmModal */}
                    {selectedFirm && openSetting && (
                        <FirmSettingModal
                            firm={selectedFirm}
                            open={openSetting}  // Assuming you have a separate state for openSetting
                            setOpen={setOpenSetting}  // Or you can manage this in its own state
                        />
                    )}

                </table>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <div>
                        {t('showing', {
                            from: firm.from,
                            to: firm.to,
                            total: firm.total
                        })}
                    </div>
                    <div className="flex gap-1">
                        {firm.links.map((link, index) => (
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

export default FirmTable;
