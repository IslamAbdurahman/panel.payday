import React, { useState, useEffect } from 'react';
import { TrashIcon } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Worker, HikvisionAccessEvent, HikvisionAccessEventPaginate, SearchData } from '@/types';
import DeleteItemModal from '@/components/delete-item-modal';
import { toast } from 'sonner';
// import CreateHikvisionAccessEventModal from '@/components/worker/create-hikvisionAccessEvent-payment-modal';


type HikvisionAccessEventTableProps = {
    worker: Worker;
    searchData: SearchData,
    hikvision_access_events: HikvisionAccessEventPaginate
};

const HikvisionAccessEventTable = ({ searchData, hikvision_access_events }: HikvisionAccessEventTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedHikvisionAccessEvent, setSelectedHikvisionAccessEvent] = useState<HikvisionAccessEvent | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);


    const handleDeleteClick = (hikvisionAccessEvent: HikvisionAccessEvent) => {
        setSelectedHikvisionAccessEvent(hikvisionAccessEvent);
        setOpenDelete(true);
    };
    const { delete: deleteHikvisionAccessEvent, reset, clearErrors } = useForm();

    // Suppose you have an array like:
    const images = hikvision_access_events.data.map(item => ({
        src: item.picture && item.picture.includes('/') 
             ? `/storage/${item.picture}` 
             : `/storage/hikvision/${item.hikvision_access?.shortSerialNumber}/${item.picture}`
    }));

    const handleDelete = (id: number) => {

        deleteHikvisionAccessEvent(`/hikvision_access_event/${id}`, {
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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!showModal || currentIndex === null) return;

            if (event.key === 'ArrowRight') {
                setCurrentIndex(prev => {
                    if (prev === null) return 0;
                    return prev < images.length - 1 ? prev + 1 : 0;
                });
            }

            if (event.key === 'ArrowLeft') {
                setCurrentIndex(prev => {
                    if (prev === null) return 0;
                    return prev > 0 ? prev - 1 : images.length - 1;
                });
            }

            if (event.key === 'Escape') {
                setShowModal(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showModal, currentIndex, images.length]);

    return (
        <div>

            <h3 className={'capitalize text-center py-2'}>{t('hikvisionAccessEvent')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('datetime')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('shortSerialNumber')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('mac_address')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('attendanceStatus')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('label')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('image')}</td>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {/*<CreateHikvisionAccessEventModal worker={worker} />*/}
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {hikvision_access_events.data.map((item, index) => {
                        const globalIndex = (hikvision_access_events.current_page - 1) * hikvision_access_events.per_page + index + 1;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.hikvision_access?.dateTime}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.hikvision_access?.shortSerialNumber}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.hikvision_access?.macAddress}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.attendanceStatus}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.label}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <div className="overflow-hidden cursor-pointer">
                                        <img
                                            onClick={() => {
                                                setCurrentIndex(index); // pass index in .map loop
                                                setShowModal(true);
                                            }}
                                            className="transition-transform duration-300 ease-in-out transform hover:scale-125 cursor-pointer max-h-12 rounded object-cover"
                                            src={item.picture && item.picture.includes('/') ? `/storage/${item.picture}` : `/storage/hikvision/${item.hikvision_access?.shortSerialNumber}/${item.picture}`}
                                            alt="Olingan Rasm"
                                        />
                                    </div>
                                </td>

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
                    {selectedHikvisionAccessEvent && openDelete && (
                        <DeleteItemModal
                            item={selectedHikvisionAccessEvent}
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
                            from: hikvision_access_events.from,
                            to: hikvision_access_events.to,
                            total: hikvision_access_events.total
                        })}
                    </div>
                    <div className="flex gap-1">
                        {hikvision_access_events.links.map((link, index) => (
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

            {showModal && currentIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="relative">
                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                        >
                            ✕
                        </button>

                        {/* Previous button */}
                        <button
                            onClick={() =>
                                setCurrentIndex(prev => {
                                    if (prev === null) return 0;
                                    return prev > 0 ? prev - 1 : images.length - 1;
                                })
                            }
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-80"
                        >
                            ‹
                        </button>

                        {/* Image */}
                        <img
                            src={images[currentIndex].src}
                            alt="Full"
                            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                        />

                        {/* Next button */}
                        <button
                            onClick={() =>
                                setCurrentIndex(prev => {
                                    if (prev === null) return 0;
                                    return prev < images.length - 1 ? prev + 1 : 0;
                                })
                            }
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-80"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}


        </div>


    );
};

export default HikvisionAccessEventTable;
