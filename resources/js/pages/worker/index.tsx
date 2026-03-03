import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { Branch, type BreadcrumbItem, Firm, SearchData, WorkerPaginate } from '@/types';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import SearchForm from '@/components/search-form';
import WorkerTable from '@/components/branch/worker-table';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';


export default function WorkerAll() {
    const {
        worker,
        firms,
        branches
    } = usePage<{
        worker: WorkerPaginate,
        firms: Firm[],
        branches: Branch[]
    }>().props;
    const { t } = useTranslation();  // Using the translation hook


    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${t('worker')}`,
            href: '/dashboard'
        }
    ];
    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: '',
        per_page: worker.per_page,
        page: worker.current_page,
        total: worker.total,
        firm_id: 0,
        branch_id: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/worker`, data); // ✅ Correct for search queries
    };


    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || ''; // Get 'search' query from the URL
        setData('search', searchQuery); // Set it to the form state

        const firmIdStr = urlParams.get('firm_id') ?? '0';
        const firm_id = parseInt(firmIdStr);
        setData('firm_id', firm_id);

        const branchIdStr = urlParams.get('branch_id') ?? '0';
        const branch_id = parseInt(branchIdStr);
        setData('branch_id', branch_id);

    }, [location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('worker')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex justify-end items-center">
                    <MobileSearchModal
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                        firms={firms}
                        branches={branches}
                    />
                    <div className={'hidden lg:block'}>
                        <SearchForm
                            handleSubmit={handleSubmit}
                            setData={setData}
                            data={data}
                            firms={firms}
                            branches={branches}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {worker &&
                        <WorkerTable
                            worker={worker}
                            searchData={data}
                        />
                    }
                </div>
            </div>
        </AppLayout>
    );
}
