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
import {useYears, yearsContext} from "@/app/privoders/years";
import {familyContext} from "@/app/privoders/family";
import {assetToStockData, calcFamilyBalanceSheet, familyBsToData} from "@/app/_components/assets";

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
  const yearsCtx = useContext(yearsContext);
  const familyCtx = useContext(familyContext);
  const familyBalanceSheet = calcFamilyBalanceSheet(yearsCtx.years, familyCtx.family)
  const familyData = familyBsToData(yearsCtx.years, familyBalanceSheet);

  const data: ChartData<'line'|'bar'> = {
    labels: yearsCtx.years,
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
        data: familyData.asset,
        gradient: {
          borderColor: {
            axis: 'y',
            colors: {
              '-1': ASSET_MINUS_COLOR,
              0: ASSET_COLOR,
            }
          }
        },
      },
      {
        type: 'bar' as const,
        yAxisID: 'yAxisL',
        label: '収入',
        backgroundColor: INCOME_COLOR,
        data: familyData.income,
        // borderColor: 'white',
        // borderWidth: 2,
      },
      {
        type: 'bar' as const,
        yAxisID: 'yAxisL',
        label: '支出',
        backgroundColor: OUTCOME_COLOR,
        data: familyData.outcome,
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
      },
      yAxisL: {
      },
    },
  }
  return <Chart type='bar' data={data} options={options} height="100%" width="100%" />;
}
