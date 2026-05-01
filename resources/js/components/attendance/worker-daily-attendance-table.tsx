import React from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ExcelJS from 'exceljs';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { SearchData, WorkerPaginate } from '@/types';
import { DownloadIcon } from 'lucide-react';
import { saveAs } from 'file-saver';

type WorkerTableProps = {
    worker: WorkerPaginate;
    branch_id?: number;
    searchData: SearchData;
};

const WorkerDailyAttendanceTable = ({ worker, searchData }: WorkerTableProps) => {
    const { t } = useTranslation();

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance');

        // Header row
        worksheet.addRow([
            t('n'),
            t('name'),
            t('phone'),
            t('date'),
            t('checkIn'),
            t('checkOut'),
            t('late'),
            t('worked'),
        ]);

        // Data rows
        worker.data.forEach((item, rowIndex) => {
            const globalIndex = (worker.current_page - 1) * worker.per_page + rowIndex + 1;

            const workAttendances = item.attendances?.filter(a => a.type === 'work') || [];

            const checkInTimes = workAttendances.length
                ? workAttendances.map(a => a.from_datetime ? format(new Date(a.from_datetime), 'yyyy-MM-dd HH:mm:ss') : '-').join(', ')
                : '-';

            const checkOutTimes = workAttendances.length
                ? workAttendances.map(a => a.to_datetime ? format(new Date(a.to_datetime), 'yyyy-MM-dd HH:mm:ss') : '-').join(', ')
                : '-';

            // Late time calculation (using late_minutes from DB if possible, or maintaining minutes logic)
            const lateTime = workAttendances[0]?.late_minutes ? `${workAttendances[0].late_minutes} min` : '-';

            // Worked time calculation
            const workedTimes = workAttendances.length
                ? workAttendances.map(a => a.worked_minutes ? `${Math.floor(a.worked_minutes / 60)}h ${a.worked_minutes % 60}m` : '-').join(', ')
                : '-';

            worksheet.addRow([
                globalIndex,
                item.name,
                item.phone,
                workAttendances[0]?.work_date || '-',
                checkInTimes,
                checkOutTimes,
                lateTime,
                workedTimes,
            ]);
        });

        // Generate buffer and save as file
        const buffer = await workbook.xlsx.writeBuffer();

        // Create blob and trigger download
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        saveAs(blob, `Attendance_${searchData.date}.xlsx`);
    };

    return (
        <div>
            {/*<h3 className="capitalize text-center py-2">{t('worker')}</h3>*/}

            <button
                onClick={exportToExcel}
                className="mb-4 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
                {t('excel')} <DownloadIcon className={'inline'} />
            </button>

            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700 font-bold">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('name')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('phone')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('date')}</td>
                        <td className="border border-gray-300 bg-green-700 dark:border-gray-600 px-4 py-2">{t('checkIn')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('checkOut')}</td>
                        <td className="border border-gray-300 bg-red-500 dark:border-gray-600 px-4 py-2">{t('late')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('worked')}</td>
                    </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800">
                    {worker.data?.map((item, rowIndex) => {
                        const globalIndex = (worker.current_page - 1) * worker.per_page + rowIndex + 1;
                        const workAttendances = item.attendances?.filter(a => a.type === 'work') || [];

                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <Link href={`/worker/${item.id}`}>
                                        {item.name}
                                    </Link>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.phone}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {workAttendances[0]?.work_date || '-'}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {workAttendances.length > 0 ? (
                                        workAttendances.map((a, i) => (
                                            <div key={i}>
                                                {a.from_datetime ? format(new Date(a.from_datetime), 'yyyy-MM-dd HH:mm:ss') : '-'}
                                            </div>
                                        ))
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {workAttendances.length > 0 ? (
                                        workAttendances.map((a, i) => (
                                            <div key={i}>
                                                {a.to_datetime ? format(new Date(a.to_datetime), 'yyyy-MM-dd HH:mm:ss') : '-'}
                                            </div>
                                        ))
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {workAttendances.length > 0 ? (
                                        workAttendances.map((a, i) => (
                                            <div key={i}>
                                                {a.late_minutes ? `${a.late_minutes} min` : '-'}
                                            </div>
                                        ))
                                    ) : (
                                        <div>-</div>
                                    )}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {workAttendances.length > 0 ? (
                                        workAttendances.map((a, i) => (
                                            <div key={i}>
                                                {a.worked_minutes ? `${Math.floor(a.worked_minutes / 60)}h ${a.worked_minutes % 60}m` : '-'}
                                            </div>
                                        ))
                                    ) : (
                                        <div>-</div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
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

export default WorkerDailyAttendanceTable;
