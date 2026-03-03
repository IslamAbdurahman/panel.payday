import { type AttendancePaginate, SearchData } from '@/types';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import React from 'react';

interface AttendanceTableProps extends AttendancePaginate {
    searchData: SearchData;
}

const AttendanceTable = ({ searchData, ...attendance }: AttendanceTableProps) => {
    const { t } = useTranslation(); // Using the translation hook

    return (
        <div>
            <h3 className={'capitalize text-center py-2'}>{t('attendance')}</h3>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700 font-bold">
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worker')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('firm')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('work_time')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('from')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('to')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worked_minutes')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('break_minutes')}</td>
                            <td className="border border-gray-300 px-4 py-2 bg-red-500 dark:border-gray-600">{t('late_minutes')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('status')}</td>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        {attendance.data.map((item, index) => {
                            const globalIndex = (attendance.current_page - 1) * attendance.per_page + index + 1;
                            return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.worker}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {item.firm} ( {item.branch} )
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.work_time}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.from}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.to}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.worked_minutes}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.break_minutes}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.late_minutes}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.status}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <div>
                        {t('showing', {
                            from: attendance.from,
                            to: attendance.to,
                            total: attendance.total
                        })}
                    </div>
                    <div className="flex gap-1">
                        {attendance.links.map((link, index) => (
                            <Link
                                key={index}
                                href={`${link.url ?? '?'}&search=${searchData.search}
                                &firm_id=${searchData.firm_id}
                                &branch_id=${searchData.branch_id}
                                &worker_id=${searchData.worker_id}
                                &from=${searchData.from ?? ''}
                                &to=${searchData.to ?? ''}
                                &per_page=${searchData.search ?? ''}`}
                                className={`rounded-md px-3 py-1 text-sm transition ${link.active
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

export default AttendanceTable;
