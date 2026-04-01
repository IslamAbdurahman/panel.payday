import { SearchData, WorkerPaginate } from '@/types';
import { Button } from '@/components/ui/button';
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
                `${~~(item.late_minutes! / 60)}:${String(item.late_minutes! % 60).padStart(2, '0')}`,
                `${~~(item.break_minutes! / 60)}:${String(item.break_minutes! % 60).padStart(2, '0')}`,
                `${~~(item.worked_minutes! / 60)}:${String(item.worked_minutes! % 60).padStart(2, '0')}`,
                `${~~((item.worked_minutes! - item.break_minutes!) / 60)}:${String((item.worked_minutes! - item.break_minutes!) % 60).padStart(2, '0')}`,
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

            <Button
                variant="success"
                onClick={exportToExcel}
                className="mb-4"
                size="sm"
            >
                {t('excel')} <DownloadIcon className={'ml-2 h-4 w-4'} />
            </Button>
 
             <div className="overflow-x-auto">
                 <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                     <thead className="bg-gray-100 font-bold dark:bg-gray-700">
                         <tr>
                             <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                             <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('name')}</td>
                             <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('firm')}</td>
                             <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('phone')}</td>
                             <td className="border border-gray-300 bg-red-500 px-4 py-2 text-white dark:border-gray-600">{t('late_hours')}</td>
                             <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('break_hours')}</td>
                             <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worked_hours')}</td>
                             <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('common_worked_hours')}</td>
                             <td className="border border-gray-300 bg-red-500 px-4 py-2 text-white dark:border-gray-600">{t('late_days')}</td>
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
                                         <Link href={`/worker/${item.id}`} className="hover:underline text-blue-600 dark:text-blue-400 font-medium">{item.name}</Link>
                                     </td>
                                     <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                         {item.branch?.firm?.name} ( {item.branch?.name} )
                                     </td>
                                     <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.phone}</td>
                                     <td className="border border-gray-300 px-4 py-2 dark:border-gray-600 text-red-600 font-medium">
                                         {~~(item.late_minutes! / 60)}:{String(item.late_minutes! % 60).padStart(2, '0')}
                                     </td>
                                     <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                         {~~(item.break_minutes! / 60)}:{String(item.break_minutes! % 60).padStart(2, '0')}
                                     </td>
                                     <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                         {~~(item.worked_minutes! / 60)}:{String(item.worked_minutes! % 60).padStart(2, '0')}
                                     </td>
                                     <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                         {~~((item.worked_minutes! - item.break_minutes!) / 60)}:{String((item.worked_minutes! - item.break_minutes!) % 60).padStart(2, '0')}
                                     </td>
                                     <td className="border border-gray-300 px-4 py-2 dark:border-gray-600 text-red-600 font-medium">{item.late_days}</td>
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
                             <Button
                                 key={index}
                                 variant={link.active ? 'default' : 'outline'}
                                 size="sm"
                                 asChild
                                 disabled={!link.url}
                                 className={!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                             >
                                 <Link
                                     href={`${link.url ?? '?'}&search=${searchData.search || ''}&per_page=${searchData.per_page || 10}&firm_id=${searchData.firm_id || 0}&branch_id=${searchData.branch_id || 0}&month=${searchData.month || ''}`}
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

export default WorkerMonthlyAttendanceTable;
