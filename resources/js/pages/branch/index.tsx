import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { type BreadcrumbItem, Firm, SearchData } from '@/types';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import BranchTable from '@/components/branch/branch-table';
import SearchForm from '@/components/search-form';
import FirmHolidayTable from '@/components/firm/firm-holiday-table';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';


export default function Branch() {
    const { firm } = usePage<{ firm: Firm }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${t('branch')} ( ${firm.name} )`,
            href: '/dashboard'
        }
    ];
    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/firm/${firm.id}`, data); // ✅ Correct for search queries
    };


    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || ''; // Get 'search' query from the URL
        setData('search', searchQuery); // Set it to the form state
    }, [location.search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('branch')} ${firm.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex items-center justify-between">
                    <div className={''}>
                        <Link href={'/firm'} className={'underline'}>
                            {t('firm')} /
                        </Link>
                        {firm.name}
                    </div>
                    <MobileSearchModal
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                    />
                    <div className={'hidden lg:block'}>

                        <SearchForm handleSubmit={handleSubmit} setData={setData} data={data} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <div className={'grid grid-cols-12 gap-4'}>
                        <div className={'col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-8'}>
                            <BranchTable firm={firm} />
                        </div>
                        <div className={'col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-4'}>
                            <FirmHolidayTable firm={firm} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
