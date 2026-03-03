import React, { useState } from 'react';
import { CheckCircle, MinusCircle, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Branch, SearchData, type Worker, WorkerPaginate } from '@/types';
import DeleteItemModal from '@/components/delete-item-modal';
import { toast } from 'sonner';
import CreateWorkerModal from '@/components/branch/create-worker-modal';
import UpdateWorkerModal from '@/components/branch/update-worker-modal';


type WorkerTableProps = {
    worker: WorkerPaginate;
    branch?: Branch
    searchData: SearchData;
};

const WorkerTable = ({ worker, branch, searchData }: WorkerTableProps) => {

    console.log(worker);

    const { t } = useTranslation();  // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

    const handleUpdateClick = (worker: Worker) => {
        setSelectedWorker(worker);
        setOpen(true);
    };

    const handleDeleteClick = (worker: Worker) => {
        setSelectedWorker(worker);
        setOpenDelete(true);
    };
    const { delete: deleteWorker, reset, clearErrors } = useForm();

    const handleDelete = (id: number) => {

        deleteWorker(`/worker/${id}`, {
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
            <h3 className={'py-2 text-center capitalize'}>{t('worker')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('name')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('firm')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('phone')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('address')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('comment')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('employeeNoString')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('work_time')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('end_time')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('hour_price')}</td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('fine_price')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('status')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('balance')}</td>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {branch && <CreateWorkerModal branch={branch} />}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {worker.data?.map((item, index) => {
                            const globalIndex = (worker.current_page - 1) * worker.per_page + index + 1;
                            return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{globalIndex}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        <Link href={`/worker/${item.id}`}>{item.name}</Link>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {item.branch?.firm?.name} ( {item.branch?.name} )
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.phone}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.address}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.comment}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.employeeNoString}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.work_time}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.end_time}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.hour_price}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.fine_price}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {item.status == 1 ? <CheckCircle /> : <MinusCircle />}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.balance}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        <div className="inline-flex shadow-sm">
                                            <Link
                                                href={`/worker/show_history/${item.id}`}
                                                className="text-white-700 rounded-l-md border border-gray-400 bg-gray-500 px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black focus:z-10"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>

                                            <button
                                                onClick={() => handleUpdateClick(item)}
                                                className="text-white-700 border border-gray-400 bg-green-600 px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black focus:z-10"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="text-white-700 rounded-r-md border-t border-b border-gray-400 bg-red-500 px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black focus:z-10"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Place the UpdateBranchModal here */}
                    {selectedWorker && open && <UpdateWorkerModal worker={selectedWorker} open={open} setOpen={setOpen} />}

                    {/* Pass selected branch to the DeleteBranchModal */}
                    {selectedWorker && openDelete && (
                        <DeleteItemModal
                            item={selectedWorker}
                            open={openDelete} // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete} // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}
                </table>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <div>
                        {t('showing', {
                            from: worker.from,
                            to: worker.to,
                            total: worker.total,
                        })}
                    </div>
                    <div className="flex gap-1">
                        {worker.links.map((link, index) => (
                            <Link
                                key={index}
                                href={`${link.url ?? '?'}&search=${searchData.search}&per_page=${searchData.per_page}&firm_id=${searchData.firm_id}&branch_id=${searchData.branch_id}`}
                                className={`rounded-md px-3 py-1 text-sm transition ${
                                    link.active
                                        ? 'bg-blue-600 text-white'
                                        : !link.url
                                          ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
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

export default WorkerTable;
