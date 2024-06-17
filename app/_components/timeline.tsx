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
  BarController, ChartData, ChartOptions, Filler, registerables,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {faker} from "@faker-js/faker";
import {
  ASSET_COLOR,
  ASSET_COLOR_BG, ASSET_MINUS_COLOR,
  CashFlows,
  Family,
  INCOME_COLOR,
  OUTCOME_COLOR,
  Person,
  Year
} from "@/app/lib/type";
// @ts-ignore
import * as DragDataPlugin from 'chartjs-plugin-dragdata';
import gradient from 'chartjs-plugin-gradient'
import {familyContext} from "@/app/privoders/family";
import {
  calcFamilyCashFlow,
  totalAssets,
} from "@/app/lib/type";
import {YEARS} from "@/app/lib/helper";

ChartJS.register(
  ...registerables,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Filler,
  DragDataPlugin,
  gradient,
);

export const Timeline = () => {
  const familyCtx = useContext(familyContext);
  const familyCashFlow = calcFamilyCashFlow(familyCtx.family)

  const data: ChartData<'line'|'bar'> = {
    labels: YEARS,
    datasets: [
      {
        type: 'line' as const,
        yAxisID: 'yAxisR',
        label: '資産残高',
        backgroundColor: ASSET_COLOR_BG,
        borderWidth: 3,
        pointStyle: false,
        fill: false,
        tension: 0.3,
        data: YEARS.map(y => totalAssets(y, familyCtx.family)),
        gradient: {
          borderColor: {
            axis: 'y',
            colors: {
              '-100': ASSET_MINUS_COLOR,
              '-1': ASSET_MINUS_COLOR,
              0: ASSET_COLOR,
              100: ASSET_COLOR,
            }
          }
        },
      },
      {
        type: 'bar' as const,
        yAxisID: 'yAxisL',
        label: '収入',
        backgroundColor: INCOME_COLOR,
        data: YEARS.map(y => familyCashFlow.income[y]),
      },
      {
        type: 'bar' as const,
        yAxisID: 'yAxisL',
        label: '支出',
        backgroundColor: OUTCOME_COLOR,
        data: YEARS.map(y => familyCashFlow.outcome[y]),
      },
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      yAxisR: {
        position: 'right',
        title: {
          display: true,
          text: "資産残高（万円）",
        },
      },
      yAxisL: {
        title: {
          display: true,
          text: "収入/支出（万円）",
        },
      },
    },
  }
  return <>
    <h1 className="text-xl font-semibold">家族の合計</h1>
    <Chart type='bar' data={data} options={options} height="100%" width="100%" />
  </>;
}
