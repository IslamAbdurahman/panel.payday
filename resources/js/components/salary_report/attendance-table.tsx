import { type AttendancePaginate, SearchData } from '@/types';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
                                <td className="border border-gray-300 px-4 py-2 bg-red-500 text-white dark:border-gray-600">{t('late_minutes')}</td>
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
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600 text-red-600 font-medium">{item.late_minutes}</td>
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
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                    disabled={!link.url}
                                    className={!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    <Link
                                        href={`${link.url ?? '?'}&search=${searchData.search || ''}
                                        &firm_id=${searchData.firm_id || 0}
                                        &branch_id=${searchData.branch_id || 0}
                                        &worker_id=${searchData.worker_id || 0}
                                        &from=${searchData.from ?? ''}
                                        &to=${searchData.to ?? ''}
                                        &per_page=${searchData.per_page || 10}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>
            </div>

        </div>
    );
};

export default AttendanceTable;
