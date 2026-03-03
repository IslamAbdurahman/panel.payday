import React from 'react';
import { Branch, Firm, SearchData } from '@/types';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    setData: <K extends keyof SearchData>(key: K, value: SearchData[K]) => void;
    data: SearchData;
    firms?: Firm[];
    branches?: Branch[];
}

const DashboardFilterForm = ({ handleSubmit, setData, data, firms, branches }: SearchFormProps) => {

    const { t } = useTranslation(); // Hook to access translations

    const handleFirmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('firm_id', parseInt(e.target.value, 10));  // parse as number
    };

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData('branch_id', parseInt(e.target.value, 10));  // parse as number
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="inline-flex rounded shadow-xs" role="group">
                {firms &&
                    <select
                        value={data.firm_id || ''}
                        onChange={handleFirmChange}
                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                    >
                        <option value="0">{t('firm')}</option>
                        {firms.map((firm) => (
                            <option key={firm.id} value={firm.id}>
                                {firm.name}
                            </option>
                        ))}
                    </select>
                }

                {branches &&
                    <select
                        value={data.branch_id || ''}
                        onChange={handleBranchChange}
                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-s border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                    >
                        <option value="0">{t('branch')}</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                }

                {/* Submit button to apply filter */}
                <button type="submit"
                        className="inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:outline-none text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 px-4 py-2 text-sm font-medium text-gray-900 border  border-gray-200 rounded-e-lg hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-700 dark:text-white dark:hover:text-white dark:focus:text-white">
                    <Search className={'text-sm text-white-500 dark:text-white-400'} size={20} />
                </button>
            </div>
        </form>

    );
};

export default DashboardFilterForm;
