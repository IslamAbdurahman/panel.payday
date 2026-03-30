import { SearchData, WorkerPaginate } from '@/types';
import { Link } from '@inertiajs/react';
import { CheckCircle, CheckIcon, DownloadIcon, MinusIcon, MoonStar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

type WorkerTableProps = {
    worker: WorkerPaginate;
    branch_id?: number;
    searchData: SearchData;
};

const WorkerAttendanceTable = ({ worker, searchData }: WorkerTableProps) => {
    const { t } = useTranslation();

    // Global totals
    let allCheckCount = 0;
    let allLateCount = 0;
    let allAbsentCount = 0;

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(t('attendance'));

        const daysInMonth = searchData.daysInMonth ?? 30;
        // Header row
        const headerRow = [t('n'), t('name'), t('firm')];
        for (let i = 1; i <= daysInMonth; i++) {
            headerRow.push(String(i));
        }
        headerRow.push(t('on_time'), t('late'), t('absent'));

        worksheet.addRow(headerRow);

        // Set header styling
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { horizontal: 'center' };

        // Global totals
        let allCheckCount = 0;
        let allLateCount = 0;
        let allAbsentCount = 0;

        // Data rows
        worker.data?.forEach((item, rowIndex) => {
            let checkCount = 0;
            let lateCount = 0;
            let absentCount = 0;

            const row = [];
            const globalIndex = (worker.current_page - 1) * worker.per_page + rowIndex + 1;
            row.push(globalIndex);
            row.push(item.name);
            row.push(`${item.branch?.firm?.name} (${item.branch?.name})`);

            for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
                const day = String(dayIndex + 1).padStart(2, '0');
                const dateToCompare = `${searchData.month}-${day}`; // "YYYY-MM-DD"

                const event = item.hikvision_access_events?.find((event) => event.created_at.startsWith(dateToCompare));

                const isOffDay = item.holidays?.includes(Number(day));

                if (event) {
                    const eventTime = new Date(event.created_at).toLocaleTimeString('en-US', { hour12: false });
                    const workTime = event.work_time;

                    if (eventTime <= workTime) {
                        checkCount++;
                        row.push(t('on_time'));
                    } else {
                        lateCount++;
                        row.push(t('late'));
                    }
                } else {
                    absentCount++;
                    if (isOffDay) {
                        row.push(t('off_day'));
                    } else {
                        row.push(t('absent'));
                    }
                }
            }

            row.push(checkCount, lateCount, absentCount);
            const addedRow = worksheet.addRow(row);

            for (let colIndex = 3; colIndex < 3 + daysInMonth; colIndex++) {
                const cell = addedRow.getCell(colIndex);
                const cellValue = cell.value?.toString().toLowerCase();

                if (cellValue === t('absent').toLowerCase()) {
                    cell.font = { color: { argb: 'FFFF0000' } }; // Red
                } else if (cellValue === t('late').toLowerCase()) {
                    cell.font = { color: { argb: '008000' } }; // Yellow
                }
            }

            allCheckCount += checkCount;
            allLateCount += lateCount;
            allAbsentCount += absentCount;
        });

        // Totals row
        const totalsRow = [t('n'), t('all'), ''];
        for (let i = 0; i < daysInMonth; i++) totalsRow.push('');
        totalsRow.push(allCheckCount.toString(), allLateCount.toString(), allAbsentCount.toString());

        const lastRow = worksheet.addRow(totalsRow.map((cell) => cell.toString()));
        lastRow.font = { bold: true };

        // Auto width for columns
        worksheet.columns?.forEach((column) => {
            let maxLength = 10;
            column.eachCell?.({ includeEmpty: true }, (cell) => {
                const cellValue = cell.value ? cell.value.toString() : '';
                if (cellValue.length > maxLength) maxLength = cellValue.length;
            });
            column.width = maxLength + 2;
        });

        // Generate buffer and save file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `Attendance_${searchData.month}.xlsx`);
    };

    return (
        <div>
            {/*<h3 className="capitalize text-center py-2">{t('attendance')}</h3>*/}

            <Button
                variant="success"
                size="sm"
                onClick={exportToExcel}
                className="mb-4"
            >
                {t('excel')} <DownloadIcon className="ml-2 h-4 w-4" />
            </Button>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('name')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('firm')}</td>

                            {[...Array(searchData.daysInMonth)].map((_, index) => (
                                <td key={index} className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                    {index + 1}
                                </td>
                            ))}

                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                <CheckIcon className="text-green-400" />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                <CheckCircle className="text-yellow-400" />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                <MinusIcon className="text-red-400" />
                            </td>
                        </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800">
                        {worker.data?.map((item, rowIndex) => {
                            const globalIndex = (worker.current_page - 1) * worker.per_page + rowIndex + 1;

                            let checkCount = 0;
                            let lateCount = 0;
                            let absentCount = 0;

                            const dayCells = [...Array(searchData.daysInMonth)].map((_, dayIndex) => {
                                const day = String(dayIndex + 1).padStart(2, '0');
                                const dateToCompare = `${searchData.month}-${day}`; // "YYYY-MM-DD"

                                const event = item.hikvision_access_events?.find((event) => event.created_at.startsWith(dateToCompare));

                                if (event) {
                                    const eventTime = new Date(event.created_at).toLocaleTimeString('en-US', {
                                        hour12: false,
                                    });
                                    const workTime = event.work_time;

                                    if (eventTime <= workTime) {
                                        checkCount++;
                                    } else {
                                        lateCount++;
                                    }
                                } else {
                                    absentCount++;
                                }

                                const isOffDay = item.holidays?.includes(Number(day));

                                return (
                                    <td key={dayIndex} className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {event ? (
                                            (() => {
                                                const eventTimeStr = new Date(event.created_at).toLocaleTimeString('en-US', {
                                                    hour12: false,
                                                });
                                                const workTimeStr = event.work_time;

                                                return eventTimeStr <= workTimeStr ? (
                                                    <CheckIcon className="text-green-400" />
                                                ) : (
                                                    <CheckCircle className="text-yellow-400" />
                                                );
                                            })()
                                        ) : (
                                            <>
                                                {isOffDay ? (
                                                    <>
                                                        <MoonStar className="text-yellow-200" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <MinusIcon className="text-red-400" />
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </td>
                                );
                            });

                            // Add to global totals AFTER processing the days
                            allCheckCount += checkCount;
                            allLateCount += lateCount;
                            allAbsentCount += absentCount;

                            return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{globalIndex}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        <Link href={`/worker/${item.id}`}>{item.name}</Link>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                        {item.branch?.firm?.name} ( {item.branch?.name} )
                                    </td>
                                    {dayCells}
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{checkCount}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{lateCount}</td>
                                    <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{absentCount}</td>
                                </tr>
                            );
                        })}
                    </tbody>

                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('all')}</td>
                            <td colSpan={(searchData.daysInMonth ?? 0) + 1} className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                <ul className={'flex gap-6'}>
                                    <ol>
                                        <CheckIcon className="inline text-green-400" /> : {t('on_time')}
                                    </ol>
                                    <ol>
                                        <CheckCircle className="inline text-yellow-400" /> : {t('late')}
                                    </ol>
                                    <ol>
                                        <MinusIcon className="inline text-red-400" /> : {t('absent')}
                                    </ol>
                                    <ol>
                                        <MoonStar className="inline text-yellow-200" /> : {t('off_day')}
                                    </ol>
                                </ul>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{allCheckCount}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{allLateCount}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{allAbsentCount}</td>
                        </tr>
                    </thead>
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

export default WorkerAttendanceTable;
