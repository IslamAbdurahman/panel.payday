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

            const checkIns = item.hikvision_access_events?.filter(e => e.attendanceStatus === 'checkIn') || [];
            const checkOuts = item.hikvision_access_events?.filter(e => e.attendanceStatus === 'checkOut') || [];

            // Prepare strings for multiple checkIns and checkOuts
            const checkInTimes = checkIns.length
                ? checkIns.map(ci => new Date(ci.created_at).toLocaleTimeString('en-US', { hour12: false })).join(', ')
                : '-';

            const checkOutTimes = checkOuts.length
                ? checkOuts.map(co => new Date(co.created_at).toLocaleTimeString('en-US', { hour12: false })).join(', ')
                : '-';

            // Late time calculation (only for first checkIn)
            let lateTime = '-';
            if (checkIns.length > 0) {
                const ci = checkIns[0];
                if (ci.work_time && ci.created_at) {
                    const createdAt = parseISO(ci.created_at);
                    const datePart = format(createdAt, 'yyyy-MM-dd');
                    let workTimeStr = ci.work_time.trim();
                    if (/^\d{2}:\d{2}$/.test(workTimeStr)) workTimeStr += ':00';
                    if (/^\d{2}:\d{2}:\d{2}$/.test(workTimeStr)) {
                        const workTime = new Date(`${datePart}T${workTimeStr}`);
                        if (createdAt > workTime) {
                            const totalSeconds = differenceInSeconds(createdAt, workTime);
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            const seconds = totalSeconds % 60;
                            lateTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                        }
                    }
                }
            }

            // Worked time calculation (pairs of checkIn/out)
            let workedTimes = '-';
            if (checkIns.length > 0 && checkOuts.length > 0) {
                const times = checkIns.map((ci, i) => {
                    const co = checkOuts[i];
                    if (co?.created_at && ci?.created_at) {
                        const inTime = new Date(ci.created_at).getTime();
                        const outTime = new Date(co.created_at).getTime();
                        const diffMs = outTime - inTime;
                        const diffMinutes = Math.floor(diffMs / 60000);
                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        return `${hours} : ${minutes}`;
                    }
                    return '-';
                });
                workedTimes = times.join(', ');
            }

            worksheet.addRow([
                globalIndex,
                item.name,
                item.phone,
                item.hikvision_access_events?.[0]?.created_at
                    ? format(new Date(item.hikvision_access_events[0].created_at), 'yyyy-MM-dd')
                    : '-',
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

                        const checkIns = item.hikvision_access_events?.filter(event => event.attendanceStatus === 'checkIn') || [];
                        const checkOuts = item.hikvision_access_events?.filter(event => event.attendanceStatus === 'checkOut') || [];

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
                                    {item.hikvision_access_events?.[0]?.created_at
                                        ? format(new Date(item.hikvision_access_events[0].created_at), 'yyyy-MM-dd')
                                        : '-'}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {checkIns.length > 0 ? (
                                        checkIns.map((ci, i) => (
                                            <div key={i}>
                                                {new Date(ci.created_at).toLocaleTimeString('en-US', { hour12: false })}
                                            </div>
                                        ))
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {checkOuts.length > 0 ? (
                                        checkOuts.map((co, i) => (
                                            <div key={i}>
                                                {new Date(co.created_at).toLocaleTimeString('en-US', { hour12: false })}
                                            </div>
                                        ))
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {checkIns.length > 0 ? (
                                        checkIns.map((ci, i) => {
                                            if (!ci.work_time || !ci.created_at || i !== 0) return <div key={i}>-</div>;

                                            const createdAt = parseISO(ci.created_at);
                                            const datePart = format(createdAt, 'yyyy-MM-dd');

                                            let workTimeStr = ci.work_time.trim();
                                            if (/^\d{2}:\d{2}$/.test(workTimeStr)) workTimeStr += ':00';
                                            if (!/^\d{2}:\d{2}:\d{2}$/.test(workTimeStr)) return <div key={i}>-</div>;

                                            const workTime = new Date(`${datePart}T${workTimeStr}`);

                                            if (createdAt <= workTime) return <div key={i}>-</div>;

                                            const totalSeconds = differenceInSeconds(createdAt, workTime);
                                            const hours = Math.floor(totalSeconds / 3600);
                                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                                            const seconds = totalSeconds % 60;

                                            return (
                                                <div key={i}>
                                                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div>-</div>
                                    )}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {checkIns.length > 0 && checkOuts.length > 0 ? (
                                        checkIns.map((ci, i) => {
                                            const co = checkOuts[i];

                                            if (co?.created_at && ci?.created_at) {
                                                const inTime = new Date(ci.created_at).getTime();
                                                const outTime = new Date(co.created_at).getTime();
                                                const diffMs = outTime - inTime;

                                                const diffMinutes = Math.floor(diffMs / 60000);
                                                const hours = Math.floor(diffMinutes / 60);
                                                const minutes = diffMinutes % 60;

                                                return (
                                                    <div key={i}>
                                                        {`${hours} : ${minutes}`}
                                                    </div>
                                                );
                                            } else {
                                                return <div key={i}>-</div>;
                                            }
                                        })
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
