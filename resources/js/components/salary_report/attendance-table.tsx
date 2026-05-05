import { type AttendancePaginate, SearchData } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';

interface AttendanceTableProps extends AttendancePaginate {
    searchData: SearchData;
}

const AttendanceTable = ({ searchData, ...attendance }: AttendanceTableProps) => {
    const { t } = useTranslation(); // Using the translation hook
    const [editingAttendance, setEditingAttendance] = useState<any>(null);

    const { data, setData, put, processing, reset, errors } = useForm({
        to_datetime: '',
    });

    const openEditModal = (item: any) => {
        setEditingAttendance(item);
        // datetime-local input requires YYYY-MM-DDTHH:MM format
        const formattedDate = item.to ? item.to.replace(' ', 'T').slice(0, 16) : '';
        setData('to_datetime', formattedDate);
    };

    const closeEditModal = () => {
        setEditingAttendance(null);
        reset();
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAttendance) {
            put(route('attendance.update', editingAttendance.id), {
                onSuccess: () => closeEditModal(),
            });
        }
    };

    return (
        <div>
            <h3 className={'capitalize text-center py-2'}>{t('attendance')}</h3>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700 font-bold">
                        <tr>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('n')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worker')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('firm')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('work_time')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('from')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('to')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('worked_minutes')}</td>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('break_minutes')}</td>
                                <td className="border border-gray-300 px-4 py-2 bg-red-500 text-white dark:border-gray-600">{t('late_minutes')}</td>
                                <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{t('status')}</td>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {attendance.data.map((item, index) => {
                                const globalIndex = (attendance.current_page - 1) * attendance.per_page + index + 1;
                                const isAutoClosed = item.comment?.includes('Avtomatik yopildi');
                                return (
                                    <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isAutoClosed ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-200' : ''}`}>
                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.worker}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                            {item.firm} ( {item.branch} )
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.work_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.from?.slice(0, 16)}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.to?.slice(0, 16)}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.worked_minutes}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">{item.break_minutes}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600 text-red-600 font-medium">{item.late_minutes}</td>
                                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                            <div className="flex flex-col items-start gap-1">
                                                <span>{item.status}</span>
                                                {item.comment && <span className="text-xs text-gray-500 italic">{item.comment}</span>}
                                                {isAutoClosed && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 mt-1 px-2 text-xs"
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        <Pencil className="w-3 h-3 mr-1" />
                                                        {t('edit')}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                        <div>
                            {t('showing', {
                                from: attendance.from,
                                to: attendance.to,
                                total: attendance.total
                            })}
                        </div>
                        <div className="flex gap-1">
                            {attendance.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild
                                    disabled={!link.url}
                                    className={!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    <Link
                                        href={`${link.url ?? '?'}&search=${searchData.search || ''}
                                        &firm_id=${searchData.firm_id || 0}
                                        &branch_id=${searchData.branch_id || 0}
                                        &worker_id=${searchData.worker_id || 0}
                                        &from=${searchData.from ?? ''}
                                        &to=${searchData.to ?? ''}
                                        &per_page=${searchData.per_page || 10}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingAttendance} onOpenChange={(open) => !open && closeEditModal()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('edit_attendance') || 'Davomatni tahrirlash'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>{t('worker') || 'Xodim'}</Label>
                                <Input disabled value={editingAttendance?.worker || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('from') || 'Kelgan vaqti'}</Label>
                                <Input disabled value={editingAttendance?.from || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('to') || 'Ketgan vaqti (Tahrirlash)'}</Label>
                                <Input
                                    type="datetime-local"
                                    value={data.to_datetime}
                                    onChange={(e) => setData('to_datetime', e.target.value)}
                                    step="1"
                                />
                                {errors.to_datetime && <p className="text-sm text-red-500">{errors.to_datetime}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEditModal}>
                                {t('cancel') || 'Bekor qilish'}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {t('save') || 'Saqlash'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AttendanceTable;
