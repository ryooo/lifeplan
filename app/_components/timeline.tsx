"use client"
import React, {useContext} from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController, ChartData, ChartOptions, Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {faker} from "@faker-js/faker";
import {rangeArray} from "@/app/lib/helper";
import {GlobalState, GlobalStateContext} from "@/app/privoders/global-state";
import {ASSET_COLOR, ASSET_COLOR_BG, INCOME_COLOR, OUTCOME_COLOR} from "@/app/lib/type";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Filler
);

export const Timeline = () => {
  const labels = useContext(GlobalStateContext).years;

  const data: ChartData<'line'|'bar'> = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: '資産残高',
        backgroundColor: ASSET_COLOR_BG,
        borderColor: ASSET_COLOR,
        borderWidth: 3,
        pointStyle: false,
        fill: false,
        tension: 0.3,
        data: labels.map(() => faker.datatype.number({ min: -30, max: 1000 })),
      },
      {
        type: 'bar' as const,
        label: '収入',
        backgroundColor: INCOME_COLOR,
        data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
        // borderColor: 'white',
        // borderWidth: 2,
      },
      {
        type: 'bar' as const,
        label: '支出',
        backgroundColor: OUTCOME_COLOR,
        data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      },
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
  }
  return <Chart type='bar' data={data} options={options} height="100%" width="100%" />;
}

