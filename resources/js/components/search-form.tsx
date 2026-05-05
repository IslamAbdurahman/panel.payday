import { Branch, Firm, SearchData, Worker } from '@/types';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/ui/searchable-select';

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
    const [filteredWorkers, setWorkers] = React.useState<Worker[] | undefined>(workers);

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
        let newBranches = branches;
        if (data.firm_id) {
            newBranches = branches?.filter((branch) => branch.firm_id === data.firm_id);
        }
        setBranches(newBranches);

        let newWorkers = workers;
        if (data.branch_id) {
            newWorkers = workers?.filter((worker) => worker.branch_id === data.branch_id);
        } else if (data.firm_id) {
            // If firm is selected but not branch, filter workers by firm (if possible via branches)
            const firmBranchIds = newBranches?.map(b => b.id) || [];
            newWorkers = workers?.filter((worker) => firmBranchIds.includes(worker.branch_id));
        }
        setWorkers(newWorkers);
    }, [data.firm_id, data.branch_id, branches, workers]);

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

                <div className={'flex items-center justify-between'}>
                    <div>
                        {typeof data.from === 'string' && (
                            <DatePicker
                                id="from-date"
                                placeholderText={t('from')}
                                selected={data.from ? new Date(data.from) : null}
                                onChange={(from) => {
                                    setData('from', from ? format(from, 'yyyy-MM-dd HH:mm:ss') : '');
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
                            />
                        )}
                    </div>

                    <div>
                        {typeof data.to === 'string' && (
                            <DatePicker
                                id="to-date"
                                placeholderText={t('to')}
                                selected={data.to ? new Date(data.to) : null}
                                onChange={(to) => {
                                    setData('to', to ? format(to, 'yyyy-MM-dd HH:mm:ss') : '');
                                }}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
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
                    <div className="min-w-[200px]">
                        <SearchableSelect
                            value={data.firm_id || 0}
                            onChange={(val) => {
                                const id = Number(val);
                                setData('firm_id', id);
                                if (id) {
                                    setBranches(branches?.filter((b) => b.firm_id === id));
                                } else {
                                    setBranches(branches);
                                }
                            }}
                            options={[
                                { value: 0, label: t('firm') },
                                ...firms.map((f) => ({ value: f.id, label: f.name }))
                            ]}
                            placeholder={t('firm')}
                        />
                    </div>
                )}

                {filteredBranches && (
                    <div className="min-w-[200px]">
                        <SearchableSelect
                            value={data.branch_id || 0}
                            onChange={(val) => setData('branch_id', Number(val))}
                            options={[
                                { value: 0, label: t('branch') },
                                ...filteredBranches.map((b) => ({ value: b.id, label: b.name }))
                            ]}
                            placeholder={t('branch')}
                        />
                    </div>
                )}

                {filteredWorkers && (
                    <div className="min-w-[200px]">
                        <SearchableSelect
                            value={data.worker_id || 0}
                            onChange={(val) => setData('worker_id', Number(val))}
                            options={[
                                { value: 0, label: t('worker') },
                                ...filteredWorkers.map((w) => ({ value: w.id, label: w.name }))
                            ]}
                            placeholder={t('worker')}
                        />
                    </div>
                )}

                <Button
                    type="submit"
                    variant="info"
                    className="flex items-center justify-center gap-2"
                >
                    <Search className="h-5 w-5 text-white" />
                    <span className="lg:hidden">{t('search')}</span>
                </Button>
            </div>
        </form>
    );
};

export default SearchForm;
