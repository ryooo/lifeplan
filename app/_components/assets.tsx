"use client"
import {
  Asset,
  ASSET_COLOR,
  ASSET_COLOR_BG,
  CashFlows, getPerson,
  INCOME_COLOR,
  INCOME_COLOR_BG, LifeEvent,
  OUTCOME_COLOR,
  OUTCOME_COLOR_BG, Person,
  Year
} from "@/app/lib/type";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {ChartData, ChartDataset, ChartOptions} from "chart.js";
import {Line} from "react-chartjs-2";
import {useYears, yearsContext} from "@/app/privoders/years";
import {familyContext} from "@/app/privoders/family";
import {BalanceSheet, calcBalanceSheet} from "@/app/_components/timeline";


type Props = {
  personId: string;
}

export const AssetsComponent = ({personId}: Props) => {
  const { years } = useContext(yearsContext);
  const {family, setFamily} = useContext(familyContext);
  const [data, setData] = useState<ChartData<'line'> | null>(null);

  const onDragEnd = useCallback((datasetIndex: number, index: number, val: number): void => {
    const newFamily = { ...family }
    const person = getPerson(newFamily, personId)!
    const asset = person.assets[datasetIndex]
    const year = years[index];
    asset.cashFlows[year] = val
    setFamily(newFamily)
  }, [])

  useEffect(() => {
    const person = getPerson(family, personId)!
    setData(createData(years, person))
  }, [family])

  return (
    <>
      <div>資産推移</div>
      <div className="h-52">
        {data && <Line data={data} options={createOptions(data, onDragEnd)} height="200" width="100%"/> }
      </div>
    </>
  )
}

const createOptions = (
  data: ChartData<"line">,
  onDragEnd: (datasetIndex: number, index: number, val: number) => void,
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
          onDragEnd(datasetIndex, index, value);
        },
      },
    }
  }
}

const createData = (years: Year[], person: Person): ChartData<'line'> => {
  const bs = calcBalanceSheet(years, person)
  const assetsData = assetsToData(years, person.assets);
  const total = totalAssetToData(years, bs)
  const datasets: ChartDataset<'line'>[] = assetsData.map(c => {
    return {
      type: 'line' as const,
      yAxisID: 'yAxisL',
      label: c.name,
      borderWidth: 1,
      fill: true,
      stepped: true,
      data: c.data,
      pointHitRadius: 25,
      borderColor: INCOME_COLOR,
      backgroundColor: INCOME_COLOR_BG,
    }
  })
  datasets.push({
      type: 'line' as const,
      yAxisID: 'yAxisR',
      label: total.name,
      borderWidth: 1,
      stepped: false,
      data: total.data,
      pointStyle: false,
      fill: false,
      borderColor: ASSET_COLOR,
      backgroundColor: ASSET_COLOR_BG,
    })
  return {
    labels: years,
    datasets: datasets,
  }
}

type AssetsData = {
    name: string;
    data: number[]
  }

const assetsToData = (years: Year[], assets: Asset[]): AssetsData[] => {
  const datum: AssetsData[] = []
  for (const asset of assets) {
    const data: number[] = []
    for (const year of years) {
      data.push(asset.cashFlows[year] || 0)
    }
    datum.push({
      name: asset.name,
      data,
    })
  }
  return datum
}

const totalAssetToData = (years: Year[], bs: BalanceSheet): AssetsData => {
  const total: AssetsData = {
    name: 'total',
    data: [],
  }
  for (const year of years) {
    total.data.push((bs.asset[year] || 0))
  }
  return total
}