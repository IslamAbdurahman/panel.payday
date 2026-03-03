import React from 'react';
import { Branch, Firm, SearchData, Worker } from '@/types';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

interface ReportFilterFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    setData: <K extends keyof SearchData>(key: K, value: SearchData[K]) => void;
    data: SearchData;
    firms: Firm[];
    branches: Branch[];
    workers: Worker[];
}

const ReportFilterForm = ({
                               handleSubmit, setData, data, firms,
                               branches,
                               workers
                           }: ReportFilterFormProps) => {

    const { t } = useTranslation(); // Hook to access translations
    // Update search or per_page
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('search', e.target.value);
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('per_page', parseInt(e.target.value, 10));  // parse as number
    };

    const handleFirmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('firm_id', e.target.value ? parseInt(e.target.value, 10) : undefined);
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('branch_id', e.target.value ? parseInt(e.target.value, 10) : undefined);
    };

    const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('worker_id', e.target.value ? parseInt(e.target.value, 10) : undefined);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="inline-flex rounded shadow-xs flex-wrap" role="group">
                {/* Search Bar */}
                <input
                    type="text"
                    value={data.search}
                    onChange={handleSearch}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                    placeholder={t('search')}
                />

                {typeof data.total === 'number' &&
                    <select
                        value={data.per_page}
                        onChange={handlePerPageChange}
                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">

                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={data.total}>{t('pagination_optionAll')}</option>
                    </select>
                }

                <DatePicker
                    id="from-date"
                    placeholderText={t('from')}
                    value={data.from}
                    onChange={(from) => {
                        setData('from', from ? format(from, 'yyyy-MM-dd') : '');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-s border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                />
                <DatePicker
                    id="to-date"
                    placeholderText={t('to')}
                    value={data.to}
                    onChange={(to) => {
                        setData('to', to ? format(to, 'yyyy-MM-dd') : '');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-s border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                />

                {/* Firm Select */}
                <select
                    value={data.firm_id || ''}
                    onChange={handleFirmChange}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-s border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                >
                    <option value="">{t('select_firm')}</option>
                    {firms.map((firm) => (
                        <option key={firm.id} value={firm.id}>
                            {firm.name}
                        </option>
                    ))}
                </select>

                {/* Branch Select */}
                <select
                    value={data.branch_id || ''}
                    onChange={handleBranchChange}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-s border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                >
                    <option value="">{t('select_branch')}</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>

                {/* Worker Select */}
                <select
                    value={data.worker_id || ''}
                    onChange={handleWorkerChange}
                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-s border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                >
                    <option value="">{t('select_worker')}</option>
                    {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                            {worker.name}
                        </option>
                    ))}
                </select>


                {/* Submit button to apply filter */}
                <button type="submit"
                        className="inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:outline-none text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 px-4 py-2 text-sm font-medium text-gray-900 border  border-gray-200 rounded-e-lg hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-700 dark:text-white dark:hover:text-white dark:focus:text-white">
                    <Search className={'text-sm text-white-500 dark:text-white-400'} size={20} />
                </button>
            </div>
        </form>

    );
};

export default ReportFilterForm;
