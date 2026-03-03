import AppLayout from '@/layouts/app-layout';
import { Auth, Branch, type BreadcrumbItem, DailyStats, Firm, SearchData, Stats } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import WorkTimeChart from '@/components/dashboard/work-time-chart';
import { UsersIcon, UserIcon } from 'lucide-react';
import StatsPieChart from '@/components/dashboard/stats-pie-chart';
import DashboardFilterForm from '@/components/dashboard/dashboard-filter-form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


interface PageProps {
    stats: Stats;
    daily_stats: DailyStats[];
    firms: Firm[];
    branches: Branch[];

    [key: string]: unknown; // ✅ Add this line
}

export default function Dashboard() {

    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('sidebar.dashboard'),
            href: '/dashboard'
        }
    ];

    const { auth } = usePage().props as unknown as { auth?: Auth };

    const {
        stats,
        daily_stats,
        firms,
        branches
    } = usePage<PageProps>().props;

    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: '',
        firm_id: 0,
        branch_id: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard', data); // ✅ Correct for search queries
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
            <Head title={t('sidebar.dashboard')} />
            <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div
                        className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border dark:bg-gray-800">
                        <div className="p-4">
                            <div className="flex items-center mb-4">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                    <UserIcon />
                                </div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 ml-3">
                                    {auth?.user.name}</h5>
                            </div>

                            <div>
                                <DashboardFilterForm
                                    handleSubmit={handleSubmit}
                                    setData={setData}
                                    data={data}
                                    firms={firms}
                                    branches={branches}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                            <div className="flex items-center mb-4">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                    <UsersIcon />
                                </div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 ml-3">{t('active_workers')}
                                    ({stats.all_worker})</h5>
                            </div>

                            <div className={'flex justify-between'}>
                                <div className="mt-4 text-gray-600 dark:text-gray-300 text-center">
                                    <h4 className="text-xl font-bold">
                                        {stats.on_time + stats.late - stats.gone} <i
                                        className="mdi mdi-chevron-up text-green-500 ml-1" />
                                    </h4>
                                    <div className="flex items-center mt-2">
                                        <span className="ml-2 text-sm truncate">{t('at_work')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-gray-600 dark:text-gray-300 text-center">
                                    <h4 className="text-xl font-bold">
                                        {stats.on_time} <i className="mdi mdi-chevron-up text-green-500 ml-1" />
                                    </h4>
                                    <div className="flex items-center mt-2">
                                        <span className="ml-2 text-sm truncate">{t('on_time')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-gray-600 dark:text-gray-300 text-center">
                                    <h4 className="text-xl font-bold">
                                        {stats.late} <i className="mdi mdi-chevron-up text-green-500 ml-1" />
                                    </h4>
                                    <div className="flex items-center mt-2">
                                        <span className="ml-2 text-sm truncate">{t('late')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                            <div className="flex items-center mb-4">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                    <UsersIcon />
                                </div>
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 ml-3">{t('passive_workers')}</h5>
                            </div>

                            <div className={'flex justify-between'}>
                                <div className="mt-4 text-gray-600 dark:text-gray-300 text-center">
                                    <h4 className="text-xl font-bold">
                                        {stats.gone} <i className="mdi mdi-chevron-up text-green-500 ml-1" />
                                    </h4>
                                    <div className="flex items-center mt-2">
                                        <span className="ml-2 text-sm truncate">{t('gone')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-gray-600 dark:text-gray-300 text-center">
                                    <h4 className="text-xl font-bold">
                                        {stats.absent} <i className="mdi mdi-chevron-up text-green-500 ml-1" />
                                    </h4>
                                    <div className="flex items-center mt-2">
                                        <span className="ml-2 text-sm truncate">{t('absent')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-gray-600 dark:text-gray-300 text-center">
                                    <h4 className="text-xl font-bold">
                                        {stats.on_holiday} <i className="mdi mdi-chevron-up text-green-500 ml-1" />
                                    </h4>
                                    <div className="flex items-center mt-2">
                                        <span className="ml-2 text-sm truncate">{t('on_holiday')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">

                    <WorkTimeChart daily_stats={daily_stats} />

                </div>
                <div
                    className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">

                    <StatsPieChart stats={stats} />

                </div>
                {/*<div*/}
                {/*    className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">*/}
                {/*    <PlaceholderPattern*/}
                {/*        className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />*/}
                {/*</div>*/}
            </div>
        </AppLayout>
    );
}
