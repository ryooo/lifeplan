"use client"
import {
  CashFlows, getPerson,
  INCOME_COLOR,
  INCOME_COLOR_BG, LifeEvent,
  OUTCOME_COLOR,
  OUTCOME_COLOR_BG,
  Year
} from "@/app/lib/type";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {ChartData, ChartOptions} from "chart.js";
import {Line} from "react-chartjs-2";
import {familyContext} from "@/app/privoders/family";
import {YEARS} from "@/app/lib/helper";


type Props = {
  eventIndex: number;
  personId: string;
}

export const LifeEventComponent = ({eventIndex, personId}: Props) => {
  const {family, setFamily} = useContext(familyContext);
  const [data, setData] = useState<ChartData<'line'> | null>(null);

  const person = getPerson(family, personId)!
  const event = person.lifeEvents[eventIndex];
  const onDragEnd = useCallback((index: number, val: number): void => {
    const newFamily = { ...family }
    const person = getPerson(newFamily, personId)!
    const year = YEARS[index];
    person.lifeEvents[eventIndex].cashFlows[year] = val;
    setFamily(newFamily)
  }, [])

  useEffect(() => {
    setData(createData(event.cashFlows))
  }, [event])

  return (
    <>
      <div>
        {event.name}
      </div>
      <div className="h-52">
        {data && <Line data={data} options={createOptions(data, onDragEnd)} height="200" width="100%"/> }
      </div>
    </>
  )
}

const cashFlowsToData = (cf: CashFlows): number[] => {
  const income: number[] = []

  for (const year of YEARS) {
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
        suggestedMin: Math.min(min * 1.5, -200),
        suggestedMax: Math.max(max * 1.5, 200),
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

const createData = (cashFlows: CashFlows): ChartData<'line'> => {
  const data = cashFlowsToData(cashFlows);
  return {
    labels: YEARS,
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

