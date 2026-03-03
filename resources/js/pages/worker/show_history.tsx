import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, SearchData, Worker, WorkerHistory } from '@/types';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import SearchForm from '@/components/search-form';
import { useTranslation } from 'react-i18next';
import WorkerHistoryTable from '@/components/worker/worker-history-table';

export default function WorkerHistoryShow() {
    const {
        worker,
        history
    } = usePage<{
        worker: Worker,
        history: WorkerHistory[],
    }>().props;
    const { t } = useTranslation();  // Using the translation hook


    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${t('worker_history')} ( ${worker.name} )`,
            href: '/dashboard'
        }
    ];
    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: '',
        firm_id: 0
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
                <div className="flex justify-end items-center mb-4">
                    <SearchForm
                        handleSubmit={handleSubmit}
                        setData={setData}
                        data={data}
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {history &&
                        <WorkerHistoryTable
                            history={history}
                        />
                    }
                </div>
            </div>
        </AppLayout>
    );
}
