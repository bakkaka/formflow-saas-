'use client';

import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export function SatisfactionChart({ data }: { data: any }) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6B7280'],
      },
    ],
  };

  return <Doughnut data={chartData} />;
}