import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { DailyStats } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from 'react-i18next';


type Props = {
    daily_stats: DailyStats[];
};

const WorkTimeChart = ({ daily_stats }: Props) => {
    const data = daily_stats;

    const { t } = useTranslation();

    const { appearance } = useAppearance();

    const resolvedTheme = appearance === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : appearance;

    const series = [
        {
            name: t('worked'),
            data: data.map(item => parseFloat(item.worked_hours))
        },
        {
            name: t('break'),
            data: data.map(item => parseFloat(item.break_hours))
        },
        {
            name: t('late'),
            data: data.map(item => parseFloat(item.late_hours))
        }
    ];

    const labelColor = resolvedTheme === 'dark' ? '#ffffff' : '#333333';

    const options: ApexOptions = {
        chart: {
            type: 'bar' as const,
            foreColor: labelColor,
            height: 350
        },
        xaxis: {
            categories: data.map(item => item.worked_date),
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
                formatter: (val: number) => val.toFixed(1) // ✅ One decimal place
            }
        },
        tooltip: {
            y: {
                formatter: (val: number) => val.toFixed(1) // ✅ One decimal place in hover tooltip
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
                borderRadius: 5, // 👈 Replaces 'endingShape'
                distributed: false
            }
        },
        theme: {
            mode: resolvedTheme as 'dark' | 'light'
        },
        colors: ['#e6746c', '#5373e0', '#60be92'] // 🎨 Custom color per series
    };

    return (
        <div>
            <Chart options={options} series={series} type="bar" height={350} />
        </div>
    );
};

export default WorkTimeChart;
