import React from 'react';
import { Branch, Firm, SearchData } from '@/types';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/ui/searchable-select';

interface SearchFormProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    setData: <K extends keyof SearchData>(key: K, value: SearchData[K]) => void;
    data: SearchData;
    firms?: Firm[];
    branches?: Branch[];
}

const DashboardFilterForm = ({ handleSubmit, setData, data, firms, branches }: SearchFormProps) => {

    const { t } = useTranslation(); // Hook to access translations

    const [filteredBranches, setBranches] = React.useState<Branch[]>(branches || []);

    React.useEffect(() => {
        if (data.firm_id) {
            setBranches(branches?.filter((b) => b.firm_id === data.firm_id) || []);
        } else {
            setBranches(branches || []);
        }
    }, [data.firm_id, branches]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="inline-flex rounded shadow-xs" role="group">
                {firms && (
                    <div className="min-w-[150px]">
                        <SearchableSelect
                            value={data.firm_id || 0}
                            onChange={(val) => setData('firm_id', Number(val))}
                            options={[
                                { value: 0, label: t('firm') },
                                ...firms.map((f) => ({ value: f.id, label: f.name }))
                            ]}
                            placeholder={t('firm')}
                        />
                    </div>
                )}
                {filteredBranches && (
                    <div className="min-w-[150px]">
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

                <Button
                    type="submit"
                    variant="info"
                    className="rounded-s-none rounded-e-lg border-l-0"
                >
                    <Search className="h-5 w-5 text-white" />
                </Button>
            </div>
        </form>

    );
};

export default DashboardFilterForm;
