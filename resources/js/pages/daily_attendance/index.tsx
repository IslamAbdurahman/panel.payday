import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Branch, type BreadcrumbItem,  SearchData, WorkerPaginate } from '@/types';
import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import SearchForm from '@/components/search-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import WorkerDailyAttendanceTable from '@/components/attendance/worker-daily-attendance-table';


export default function Attendance() {
    const {
        worker,
        branch,
    } = usePage<{
        worker: WorkerPaginate,
        branch: Branch,
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
        date: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/daily_attendance/${branch.id}`, data); // ✅ Correct for search queries
    };


    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || ''; // Get 'search' query from the URL
        setData('search', searchQuery); // Set it to the form state

        const dateStr = urlParams.get('date') ?? format(new Date(), 'yyyy-MM-dd');
        setData('date', dateStr);

    }, [location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('worker')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex flex-col md:flex-row justify-between">
                    <div className={'mb-4'}>
                        <Link href={'/firm'} className={'underline'}>
                            {t('firm')} /
                        </Link>
                        <Link href={`/firm/${branch.firm_id}`} className={'underline'}>
                            {branch.firm?.name} /
                        </Link>
                        <Link href={`/branch/${branch.id}`} className={'underline'}>
                            {branch.name}
                        </Link>
                    </div>
                    <SearchForm handleSubmit={handleSubmit} setData={setData} data={data} />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {worker &&
                        <WorkerDailyAttendanceTable
                            worker={worker}
                            searchData={data}
                        />
                    }
                </div>
            </div>
        </AppLayout>
    );
}
