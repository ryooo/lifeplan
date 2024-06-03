"use client"
import {
  ASSET_COLOR,
  ASSET_COLOR_BG,
  CashFlows,
  INCOME_COLOR,
  INCOME_COLOR_BG, LifeEvent,
  OUTCOME_COLOR,
  OUTCOME_COLOR_BG,
  Year
} from "@/app/lib/type";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {ChartData, ChartOptions} from "chart.js";
import {Line} from "react-chartjs-2";
import {useYears, yearsContext} from "@/app/privoders/years";
import {familyContext} from "@/app/privoders/family";


type Props = {
  event: LifeEvent;
}

export const LifeEventComponent = ({event}: Props) => {
  const { years } = useContext(yearsContext);
  const {family, setFamily} = useContext(familyContext);
  const [data, setData] = useState<ChartData<'line'> | null>(null);

  const onDragEnd = useCallback((index: number, val: number): void => {
    const newFamily = { ...family }
    newFamily.user!.lifeEvents[0].cashFlows[index] = val;
    setFamily(newFamily)
  }, [])

  useEffect(() => {
    setData(createData(years, event.cashFlows))
  }, [event])

  return (
    <>
      <div className="col-span-1">
        {event.name}
      </div>
      <div className="col-span-9">
        {data && <Line data={data} options={createOptions(data, onDragEnd)} height="200" width="100%"/> }
      </div>
    </>
  )
}

const cashFlowsToData = (years: Year[], cf: CashFlows): number[] => {
  const income: number[] = []

  for (const year of years) {
    const val = cf[year] || 0
    income.push(val)
  }
  return income
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
      yAxis: {
        type: 'linear',
        suggestedMin: min * 1.5,
        suggestedMax: max * 1.5,
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

const createData = (years: Year[], cashFlows: CashFlows): ChartData<'line'> => {
  const data = cashFlowsToData(years, cashFlows);
  return {
    labels: years,
    datasets: [
      {
        type: 'line' as const,
        yAxisID: 'yAxis',
        label: '収支',
        borderWidth: 1,
        fill: true,
        stepped: true,
        data: data,
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
    ],
  }
}
