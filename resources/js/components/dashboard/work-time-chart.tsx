import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { DailyStats } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from 'react-i18next';


type Props = {
    daily_stats: DailyStats[];
};

const WorkTimeChart = ({ daily_stats = [] }: Props) => {
    const { t } = useTranslation();
    const { appearance } = useAppearance();

    const resolvedTheme = appearance === 'system'
        ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : appearance;

    const labelColor = resolvedTheme === 'dark' ? '#ffffff' : '#333333';

    const series = useMemo(() => [
        {
            name: t('worked'),
            data: daily_stats.map(item => parseFloat(item.worked_hours) || 0)
        },
        {
            name: t('break'),
            data: daily_stats.map(item => parseFloat(item.break_hours) || 0)
        },
        {
            name: t('late'),
            data: daily_stats.map(item => parseFloat(item.late_hours) || 0)
        }
    ], [daily_stats, t]);

    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'bar' as const,
            foreColor: labelColor,
            height: 350,
            toolbar: {
                show: false
            }
        },
        xaxis: {
            type: 'category' as const,
            categories: daily_stats.map(item => item.worked_date),
            labels: {
                style: {
                    colors: labelColor
                }
            }
        },
        yaxis: {
            title: {
                text: t('hours'),
                style: {
                    color: labelColor
                }
            },
            labels: {
                style: {
                    colors: labelColor
                },
                formatter: (val: number) => val.toFixed(1)
            }
        },
        tooltip: {
            theme: resolvedTheme as 'dark' | 'light',
            y: {
                formatter: (val: number) => val.toFixed(1)
            }
        },
        legend: {
            labels: {
                colors: labelColor
            }
        },
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 5,
                distributed: false
            }
        },
        theme: {
            mode: resolvedTheme as 'dark' | 'light'
        },
        colors: ['#e6746c', '#5373e0', '#60be92']
    }), [daily_stats, labelColor, t, resolvedTheme]);

    return (
        <div className="p-4">
            <Chart options={options} series={series} type="bar" height={350} />
        </div>
    );
};

export default WorkTimeChart;
