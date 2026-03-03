import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkerHistory } from '@/types';

type WorkerTableProps = {
    history: WorkerHistory[];
};

const WorkerHistoryTable = ({ history }: WorkerTableProps) => {

    const { t } = useTranslation();  // Using the translation hook=

    return (
        <div>

            <h3 className={'capitalize text-center py-2'}>{t('worker')}</h3>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('amount')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('comment')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('action')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('user_name')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('date')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('balance')}</td>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {history?.map((item, index) => {
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.amount}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.comment}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.salary_id ? t('salary') : t('salary_payment')}

                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.user_name}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.created_at}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.balance}</td>
                            </tr>
                        );
                    })}
                    </tbody>

                </table>

            </div>
        </div>
    );
};

export default WorkerHistoryTable;
