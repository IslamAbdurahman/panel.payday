import { Report } from '@/types';
import { useTranslation } from 'react-i18next';

const RightBar = ({ ...report }: Report) => {
    const { t } = useTranslation();

    // Raqamlarni "120 000" formatiga keltirish uchun yordamchi funksiya
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            maximumFractionDigits: 0,
        }).format(value).replace(/,/g, ' '); // Agar vergul bilan ajratsa, bo'shliqqa almashtiradi
    };

    return (
        <div>
            <h3 className={'py-2 text-center capitalize'}>{t('report')}</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('status')}</th>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('count')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                        <tr className="hover:bg-gray-70 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('working_days')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {(() => {
                                    const workingDays = report.working_days ?? 0;

                                    const toMinutes = (time?: string | number) => {
                                        if (!time) return 0;
                                        const [h, m] = String(time).split(':').map(Number);
                                        return h * 60 + (m || 0);
                                    };

                                    const dailyMinutes = toMinutes(report.end_time) - toMinutes(report.work_time);

                                    if (workingDays <= 0 || dailyMinutes <= 0) {
                                        return `${workingDays} ${t('day')}`;
                                    }

                                    const totalMinutes = workingDays * dailyMinutes;
                                    const hours = Math.floor(totalMinutes / 60);
                                    const minutes = totalMinutes % 60;

                                    return `${workingDays} ${t('day')} (${hours} soat ${minutes} min)`;
                                })()}
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worked_days')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {report.worked_days} {t('day')}
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worked_hours')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {~~(report.worked_minutes / 60)} {t('hour')} {report.worked_minutes % 60} {t('minute')}
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('break_hours')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {~~(report.break_minutes / 60)} {t('hour')} {report.break_minutes % 60} {t('minute')}
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('real_hours')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {~~((report.worked_minutes - report.break_minutes) / 60)} {t('hour')}{' '}
                                {(report.worked_minutes - report.break_minutes) % 60} {t('minute')}
                            </td>
                        </tr>

                        {(() => {
                            const hourPrice = report.hour_price ?? 0;
                            const workedMinutes = report.worked_minutes ?? 0;
                            const breakMinutes = report.break_minutes ?? 0;

                            if (hourPrice <= 0) return null;

                            const calculated = ((workedMinutes - breakMinutes) * hourPrice) / 60;

                            return (
                                <>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('hour_price')}</th>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                            {formatCurrency(hourPrice)}
                                        </td>
                                    </tr>

                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('calculated')}</th>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                            {formatCurrency(calculated)}
                                        </td>
                                    </tr>
                                </>
                            );
                        })()}

                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600"></th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600"></td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 bg-red-500 text-white px-4 py-2 dark:border-gray-600">{t('late_hours')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {~~(report.late_minutes / 60)} {t('hour')} {report.late_minutes % 60} {t('minute')}
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 bg-red-500 text-white px-4 py-2 dark:border-gray-600">{t('fine')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {(() => {
                                    const lateMinutes = report.late_minutes ?? 0;
                                    const finePrice = report.fine_price ?? 0;
 
                                    if (lateMinutes <= 0 || finePrice <= 0) return 0;
 
                                    const totalFine = (lateMinutes / 60) * finePrice;
 
                                    return formatCurrency(totalFine);
                                })()}
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <th className="border border-gray-300 bg-red-500 text-white px-4 py-2 dark:border-gray-600">{t('late_days')}</th>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {report.late_days} {t('day')}
                            </td>
                        </tr>
                        {report.last_salary_date && (
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('last_salary_date')}</th>
                                <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{report.last_salary_date}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RightBar;
