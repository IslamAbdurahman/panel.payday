import React from 'react';
import { Branch, Firm, SearchData, Worker } from '@/types';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import SearchableSelect from '@/components/ui/searchable-select';

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

    const [filteredBranches, setBranches] = React.useState<Branch[]>(branches);
    const [filteredWorkers, setWorkers] = React.useState<Worker[]>(workers);

    React.useEffect(() => {
        let newBranches = branches;
        if (data.firm_id) {
            newBranches = branches.filter((b) => b.firm_id === data.firm_id);
        }
        setBranches(newBranches);

        let newWorkers = workers;
        if (data.branch_id) {
            newWorkers = workers.filter((w) => w.branch_id === data.branch_id);
        } else if (data.firm_id) {
            const firmBranchIds = newBranches.map((b) => b.id);
            newWorkers = workers.filter((w) => firmBranchIds.includes(w.branch_id));
        }
        setWorkers(newWorkers);
    }, [data.firm_id, data.branch_id, branches, workers]);

    // Update search or per_page
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('search', e.target.value);
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

                {typeof data.total === 'number' && (
                    <div className="min-w-[80px]">
                        <SearchableSelect
                            value={data.per_page}
                            onChange={(val) => setData('per_page', Number(val))}
                            options={[
                                { value: 10, label: '10' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' },
                                { value: data.total, label: t('pagination_optionAll') }
                            ]}
                            isSearchable={false}
                        />
                    </div>
                )}

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
                <div className="min-w-[150px]">
                    <SearchableSelect
                        value={data.firm_id || 0}
                        onChange={(val) => setData('firm_id', val ? Number(val) : undefined)}
                        options={[
                            { value: 0, label: t('select_firm') },
                            ...firms.map((f) => ({ value: f.id, label: f.name }))
                        ]}
                        placeholder={t('select_firm')}
                    />
                </div>

                {/* Branch Select */}
                <div className="min-w-[150px]">
                    <SearchableSelect
                        value={data.branch_id || 0}
                        onChange={(val) => setData('branch_id', val ? Number(val) : undefined)}
                        options={[
                            { value: 0, label: t('select_branch') },
                            ...filteredBranches.map((b) => ({ value: b.id, label: b.name }))
                        ]}
                        placeholder={t('select_branch')}
                    />
                </div>

                {/* Worker Select */}
                <div className="min-w-[200px]">
                    <SearchableSelect
                        value={data.worker_id || 0}
                        onChange={(val) => setData('worker_id', val ? Number(val) : undefined)}
                        options={[
                            { value: 0, label: t('select_worker') },
                            ...filteredWorkers.map((w) => ({ value: w.id, label: w.name }))
                        ]}
                        placeholder={t('select_worker')}
                    />
                </div>


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
