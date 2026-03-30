import BranchDayTable from '@/components/branch/branch-day-table';
import BranchDeviceTable from '@/components/branch/branch-device-table';
import BranchHolidayTable from '@/components/branch/branch-holiday-table';
import WorkerTable from '@/components/branch/worker-table';
import MobileSearchModal from '@/components/MobileSearchModal';
import SearchForm from '@/components/search-form';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Branch, type BreadcrumbItem, Day, SearchData, WorkerPaginate } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Branch() {
    const { branch, days, worker } = usePage<{
        branch: Branch;
        days: Day[];
        worker: WorkerPaginate;
    }>().props;
    const { t } = useTranslation(); // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${t('branch')} (${branch.name})`,
            href: '/dashboard',
        },
    ];
    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: '',
        per_page: worker.per_page,
        page: worker.current_page,
        total: worker.total,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/branch/${branch.id}`, data); // ✅ Correct for search queries
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || ''; // Get 'search' query from the URL
        setData('search', searchQuery); // Set it to the form state
    }, [location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Branch ${branch.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex items-center justify-between">
                    <div className={''}>
                        <Link href={'/firm'} className={'underline'}>
                            {t('firm')} /
                        </Link>
                        <Link href={`/firm/${branch.firm_id}`} className={'underline'}>
                            {branch.firm?.name} /
                        </Link>
                        {branch.name}
                    </div>
                    <MobileSearchModal data={data} setData={setData} handleSubmit={handleSubmit} />
                    <div className={'hidden lg:block'}>
                        <SearchForm handleSubmit={handleSubmit} setData={setData} data={data} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto pt-3">
                    <Button variant="success" asChild className="mb-4">
                        <Link href={`/daily_attendance/${branch.id}`}>
                            {t('daily_attendance')}
                        </Link>
                    </Button>
                    <div className={'grid grid-cols-12 gap-4'}>
                        <div className={'col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-8'}>
                            {branch.workers && <WorkerTable worker={worker} branch={branch} searchData={data} />}
                        </div>
                        <div className={'col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4'}>
                            <BranchDayTable branch={branch} days={days} />
                            <BranchDeviceTable branch={branch} />
                            <BranchHolidayTable branch={branch} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
