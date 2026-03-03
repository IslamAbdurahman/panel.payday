import MobileSearchModal from '@/components/MobileSearchModal';
import SearchForm from '@/components/search-form';
import HikvisionAccessEventTable from '@/components/worker/HikvisionAccessEvent-table';
import SalaryPaymentTable from '@/components/worker/salary-payment-table';
import SalaryTable from '@/components/worker/salary-table';
import WorkerDayTable from '@/components/worker/worker-day-table';
import WorkerHolidayTable from '@/components/worker/worker-holiday-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Worker, Day, HikvisionAccessEventPaginate, SearchData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


export default function WorkerShow() {
    const { worker, hikvision_access_events, days } = usePage<{
        worker: Worker;
        hikvision_access_events: HikvisionAccessEventPaginate;
        days: Day[];
    }>().props;
    const { t } = useTranslation(); // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${t('worker')} ( ${worker.name} )`,
            href: '/dashboard',
        },
    ];
    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: '',
        per_page: hikvision_access_events.per_page,
        page: hikvision_access_events.current_page,
        total: hikvision_access_events.total,
        from: '',
        to: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/worker/${worker.id}`, data); // ✅ Correct for search queries
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);

        const searchQuery = urlParams.get('search') || ''; // Get 'search' query from the URL
        const from = !String(urlParams.get('from')) || String(urlParams.get('from')) === 'null' ? '' : String(urlParams.get('from'));
        const to = !String(urlParams.get('to')) || String(urlParams.get('to')) === 'null' ? '' : String(urlParams.get('to'));

        setData('search', searchQuery); // Set it to the form state
        setData('from', from);
        setData('to', to);
    }, [location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Worker ${worker.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex items-center justify-between">
                    <div className={''}>
                        <Link href={'/firm'} className={'underline'}>
                            {t('firm')} /
                        </Link>
                        <Link href={`/firm/${worker?.branch?.firm_id}`} className={'underline'}>
                            {worker?.branch?.firm?.name} /
                        </Link>
                        <Link href={`/branch/${worker?.branch?.id}`} className={'underline'}>
                            {worker?.branch?.name} /
                        </Link>
                        {worker?.name}
                    </div>
                    <MobileSearchModal data={data} setData={setData} handleSubmit={handleSubmit} />
                    <div className={'hidden lg:block'}>
                        <SearchForm handleSubmit={handleSubmit} setData={setData} data={data} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <div className={'grid grid-cols-12 gap-4'}>
                        <div className={'col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-8'}>
                            <HikvisionAccessEventTable worker={worker} hikvision_access_events={hikvision_access_events} searchData={data} />
                            <SalaryTable worker={worker} />
                        </div>
                        <div className={'col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4'}>
                            <WorkerDayTable worker={worker} days={days} />

                            <WorkerHolidayTable worker={worker} />
                            <SalaryPaymentTable worker={worker} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
