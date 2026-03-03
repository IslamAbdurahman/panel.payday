import { SearchData, WorkerPaginate } from '@/types';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DownloadIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type WorkerTableProps = {
    worker: WorkerPaginate;
    branch_id?: number;
    searchData: SearchData;
};

const WorkerMonthlyAttendanceTable = ({ worker, searchData }: WorkerTableProps) => {
    const { t } = useTranslation();

    // Converts HH:mm:ss string to minutes
    const timeToMinutes = (time?: string | null): number => {
        if (!time) return 0;
        const [h, m, s] = time.split(':').map(Number);
        return h * 60 + m + s / 60;
    };

    // Converts minutes to "HH:mm" format
    const minutesToHHMM = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${String(mins).padStart(2, '0')}`;
    };

    // Calculates worked time based on work_time, end_time, and number of days
    const calculateWorkedTime = (startTime?: string | null, endTime?: string | null, days: number = 1): string => {
        if (timeToMinutes(endTime) < timeToMinutes(startTime)) {
            return '0:00';
        }

        let diff = timeToMinutes(endTime) - timeToMinutes(startTime);

        // Overnight shift support
        if (diff < 0) diff += 24 * 60;

        diff *= days;

        return minutesToHHMM(Math.round(diff));
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance');

        const headers = [
            t('n'),
            t('name'),
            t('firm'),
            t('phone'),
            t('late_hours'),
            t('break_hours'),
            t('worked_hours'),
            t('common_worked_hours'),
            t('late_days'),
            t('worked_days'),
            t('work_days'),
            t('work_hours'),
        ];

        // Add header row
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell, colNumber) => {
            const headerText = headers[colNumber - 1];

            // Set font & fill as before
            if (headerText === t('late_hours') || headerText === t('late_days')) {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' },
                };
            } else {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'D9E1F2' },
                };
            }

            cell.alignment = { vertical: 'middle', horizontal: 'center' };

            // Set column width based on header text length + some padding (e.g., +2)
            worksheet.getColumn(colNumber).width = headerText.length + 4;
        });

        // Add data rows
        worker.data.forEach((item, rowIndex) => {
            const row = worksheet.addRow([
                (worker.current_page - 1) * worker.per_page + rowIndex + 1,
                item.name,
                `${item.branch?.firm?.name} ( ${item.branch?.name} )`,
                item.phone,
                `${~~(item.late_minutes! / 60)}:${item.late_minutes! % 60}`,
                `${~~(item.break_minutes! / 60)}:${item.break_minutes! % 60}`,
                `${~~(item.worked_minutes! / 60)}:${item.worked_minutes! % 60}`,
                `${~~((item.worked_minutes! - item.break_minutes!) / 60)}:${(item.worked_minutes! - item.break_minutes!) % 60}`,
                item.late_days,
                item.worked_days,
                item.work_days,

                calculateWorkedTime(item.work_time, item.end_time, item.work_days ?? 0),
            ]);

            // 🎯 Color "Late Hours" (column 4) in red
            row.getCell(4).font = { color: { argb: 'FFFF0000' } };

            // 🎯 Color "Late Days" (column 8) in red
            row.getCell(8).font = { color: { argb: 'FFFF0000' } };
        });

        // Generate and save the Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${searchData.month}_${t('attendance')}_${format(new Date(), 'yyyy-MM-dd_HH:mm:ss')}.xlsx`);
    };

    return (
        <div>
            {/*<h3 className="capitalize text-center py-2">*/}
            {/*    {t('worker')}*/}
            {/*</h3>*/}

            <button onClick={exportToExcel} className="mb-4 rounded bg-green-600 px-2 py-1 text-white transition hover:bg-green-700">
                {t('excel')} <DownloadIcon className={'inline'} />
            </button>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 font-bold dark:bg-gray-700">
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('name')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('firm')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('phone')}</td>
                            <td className="border border-gray-300 bg-red-500 px-4 py-2 dark:border-gray-600">{t('late_hours')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('break_hours')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worked_hours')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('common_worked_hours')}</td>
                            <td className="border border-gray-300 bg-red-500 px-4 py-2 dark:border-gray-600">{t('late_days')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worked_days')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('work_days')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('work_hours')}</td>
                        </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800">
                        {worker.data?.map((item, rowIndex) => {
                            const globalIndex = (worker.current_page - 1) * worker.per_page + rowIndex + 1;

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
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {~~(item.late_minutes! / 60)} : {item.late_minutes! % 60}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {~~(item.break_minutes! / 60)} : {item.break_minutes! % 60}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {~~(item.worked_minutes! / 60)} : {item.worked_minutes! % 60}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {~~((item.worked_minutes! - item.break_minutes!) / 60)} : {(item.worked_minutes! - item.break_minutes!) % 60}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.late_days}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.worked_days}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.work_days}</td>

                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {calculateWorkedTime(item.work_time, item.end_time, item.work_days ?? 0)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
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
                                href={`${link.url ?? '?'}&search=${searchData.search}&per_page=${searchData.per_page}&firm_id=${searchData.firm_id}&branch_id=${searchData.branch_id}&month=${searchData.month}`}
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

export default WorkerMonthlyAttendanceTable;
