import { Branch, Firm, SearchData, Worker } from '@/types';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';

interface SearchFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    setData: <K extends keyof SearchData>(key: K, value: SearchData[K]) => void;
    data: SearchData;
    workers?: Worker[];
    firms?: Firm[];
    branches?: Branch[];
}

const SearchForm = ({ handleSubmit, setData, data, workers, firms, branches }: SearchFormProps) => {
    const { t } = useTranslation(); // Hook to access translations

    const [filteredBranches, setBranches] = React.useState<Branch[] | undefined>(branches);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('search', e.target.value);
    };

    const handleMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('month', e.target.value);
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('per_page', parseInt(e.target.value, 10)); // parse as number
    };

    const handleWorkerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('worker_id', parseInt(e.target.value, 10)); // parse as number
    };

    const handleFirmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const firm_id = parseInt(e.target.value, 10); // parse as number
        setData('firm_id', firm_id); // parse as number

        if (firm_id) {
            setBranches(branches?.filter((branch) => branch.firm_id === firm_id));
        } else {
            setBranches(branches);
        }
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('branch_id', parseInt(e.target.value, 10)); // parse as number
    };

    useEffect(() => {
        if (data.firm_id) {
            setBranches(branches?.filter((branch) => branch.firm_id === data.firm_id));
        } else {
            setBranches(branches);
        }
    }, [data, setBranches, branches]);

    return (
        <form onSubmit={handleSubmit}>
            {/*<div className="inline-flex rounded shadow-xs flex-wrap gap-y-1" role="group">*/}
            <div className="flex flex-col gap-2 rounded shadow-xs sm:gap-2 lg:inline-flex lg:flex-row lg:flex-wrap lg:gap-0 lg:gap-y-1" role="group">
                {/* Search Bar */}
                <input
                    type="text"
                    value={data.search}
                    onChange={handleSearch}
                    className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                    placeholder={t('search')}
                />

                {typeof data.total === 'number' && (
                    <select
                        value={data.per_page}
                        onChange={handlePerPageChange}
                        className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={data.total}>{t('pagination_optionAll')}</option>
                    </select>
                )}

                <div className={'flex items-center justify-between'}>
                    <div>
                        {typeof data.from === 'string' && (
                            <DatePicker
                                id="from-date"
                                placeholderText={t('from')}
                                value={data.from}
                                onChange={(from) => {
                                    setData('from', from ? format(from, 'yyyy-MM-dd') : '');
                                }}
                                className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                            />
                        )}
                    </div>

                    <div>
                        {typeof data.to === 'string' && (
                            <DatePicker
                                id="to-date"
                                placeholderText={t('to')}
                                value={data.to}
                                onChange={(to) => {
                                    setData('to', to ? format(to, 'yyyy-MM-dd') : '');
                                }}
                                className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                            />
                        )}
                    </div>
                </div>

                {typeof data.month === 'string' && (
                    <input
                        type="month"
                        value={data.month}
                        max={format(new Date(), 'yyyy-MM')}
                        onChange={handleMonth}
                        className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                        placeholder={t('month')}
                    />
                )}

                {typeof data.date === 'string' && (
                    <DatePicker
                        id="date"
                        placeholderText={t('date')}
                        value={data.date}
                        onChange={(date) => {
                            setData('date', date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                    />
                )}

                {firms && (
                    <select
                        value={data.firm_id || ''}
                        onChange={handleFirmChange}
                        className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                    >
                        <option value="0">{t('firm')}</option>
                        {firms.map((firm) => (
                            <option key={firm.id} value={firm.id}>
                                {firm.name}
                            </option>
                        ))}
                    </select>
                )}

                {filteredBranches && (
                    <select
                        value={data.branch_id || ''}
                        onChange={handleBranchChange}
                        className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                    >
                        <option value="0">{t('branch')}</option>
                        {filteredBranches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                )}

                {workers && (
                    <select
                        value={data.worker_id || 0}
                        onChange={handleWorkerChange}
                        className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                    >
                        <option value="0">{t('worker')}</option>
                        {workers.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                                {worker.name}
                            </option>
                        ))}
                    </select>
                )}

                {/* Submit button to apply filter */}
                <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded border border-gray-200 bg-blue-700 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-blue-800 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 focus:outline-none dark:border-gray-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-800"
                >
                    <Search className="text-white dark:text-white" size={20} />
                    <span className="lg:hidden">{t('search')}</span>
                </button>
            </div>
        </form>
    );
};

export default SearchForm;
