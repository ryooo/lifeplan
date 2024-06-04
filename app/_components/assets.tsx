"use client"
import {
  Asset,
  ASSET_COLOR,
  ASSET_COLOR_BG, Balances,
  CashFlows, Family, getPerson,
  INCOME_COLOR,
  INCOME_COLOR_BG, LifeEvent,
  OUTCOME_COLOR,
  OUTCOME_COLOR_BG, Person,
  Year
} from "@/app/lib/type";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {ChartData, ChartDataset, ChartOptions} from "chart.js";
import {Line} from "react-chartjs-2";
import {familyContext} from "@/app/privoders/family";
import {YEARS} from "@/app/lib/helper";


type Props = {
  assetIndex: number;
  asset: Asset;
}

export const AssetComponent = ({assetIndex, asset}: Props) => {
  const {family, setFamily} = useContext(familyContext);
  const [data, setData] = useState<ChartData<'line'> | null>(null);

  const onDragEnd = useCallback((index: number, val: number): void => {
    const newFamily = {...family}
    const asset = newFamily.assets[assetIndex]
    const year = YEARS[index];
    asset.cashFlows[year] = val
    setFamily(newFamily)
  }, [])

  useEffect(() => {
    setData(createData(asset))
  }, [family, asset])

  return (
    <>
      <div>{asset.name} シミュレーション</div>
      <div className="h-52">
        {data && <Line data={data} options={createOptions(data, onDragEnd)} height="200" width="100%"/>}
      </div>
    </>
  )
}

const createOptions = (
  data: ChartData<"line">,
  onDragEnd: (index: number, val: number) => void,
): ChartOptions<'line'> => {
  const max = Math.max(...(data.datasets[0].data as number[]), 0)
  const min = Math.min(...(data.datasets[0].data as number[]), 0)
  return {
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      yAxisL: {
        type: 'linear',
        suggestedMin: Math.min(min * 1.5, -200),
        suggestedMax: Math.max(max * 1.5, 200),
      },
      yAxisR: {
        type: 'linear',
        position: 'right',
        suggestedMin: 0,
      },
    },
    responsive: true,
    plugins: {
      // @ts-ignore
      dragData: {
        round: -1,
        showTooltip: true,
        onDragEnd: (e: any, datasetIndex: any, index: any, value: any) => {
          onDragEnd(index, value);
        },
      },
    }
  }
}

const createData = (asset: Asset): ChartData<'line'> => {
  console.log(asset.cashFlows?.[2024], asset.cashFlows?.[2025], asset.balances?.[2024], asset.balances?.[2025], asset.migratedCashFlows?.[2024], asset.migratedCashFlows?.[2025],)
  const datasets: ChartDataset<'line'>[] = [{
    type: 'line' as const,
    yAxisID: 'yAxisL',
    label: `${asset.name}(増減)`,
    borderWidth: 1,
    fill: true,
    stepped: true,
    data: YEARS.map((y) => asset.cashFlows[y] || 0),
    pointHitRadius: 25,
    gradient: {
      backgroundColor: {
        axis: 'y',
        colors: {
          '-1': OUTCOME_COLOR_BG,
          0: INCOME_COLOR_BG,
        }
      },
      borderColor: {
        axis: 'y',
        colors: {
          '-1': OUTCOME_COLOR,
          0: INCOME_COLOR,
        }
      }
    },
  },
    {
      type: 'line' as const,
      yAxisID: 'yAxisR',
      label: `${asset.name}(残高)`,
      borderWidth: 1,
      stepped: false,
      data: YEARS.map((y) => asset.balances?.[y] || 0),
      pointStyle: false,
      fill: false,
      borderColor: ASSET_COLOR,
      backgroundColor: ASSET_COLOR_BG,
    }]
  return {
    labels: YEARS,
    datasets: datasets,
  }
}

