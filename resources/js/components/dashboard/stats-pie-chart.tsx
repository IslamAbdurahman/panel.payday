import React, { useMemo, useEffect } from 'react';
import * as echarts from 'echarts';
import { Stats } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from 'react-i18next';

type Props = {
    stats: Stats;
};

const StatsPieChart = ({ stats }: Props) => {
    const { appearance } = useAppearance();

    const { t } = useTranslation();

    const resolvedTheme =
        appearance === 'system'
            ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light')
            : appearance;

    const values = useMemo(() => [
        { value: stats.absent, name: t('absent') },
        { value: stats.on_time, name: t('on_time') },
        { value: stats.late, name: t('late') }
    ], [stats.absent, stats.on_time, stats.late]);

    useEffect(() => {
        const chartDom = document.getElementById('stats-pie-chart');
        if (!chartDom) return;

        const chart = echarts.init(chartDom, resolvedTheme === 'dark' ? 'dark' : undefined);

        chart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'horizontal',     // Horizontal layout
                bottom: 0,                // Position it at the bottom
                textStyle: {
                    color: resolvedTheme === 'dark' ? '#fff' : '#000'
                }
            },
            series: [
                {
                    name: t('attendance'),
                    type: 'pie',
                    radius: '60%',
                    data: values,
                    label: {
                        formatter: '{b}: {d}%'
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        });

        window.addEventListener('resize', () => chart.resize());
        return () => {
            window.removeEventListener('resize', () => chart.resize());
            chart.dispose();
        };
    }, [values, resolvedTheme]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <div id="stats-pie-chart" className="w-full h-[340px]" />
        </div>
    );
};

export default StatsPieChart;
