"use client"
import {
  ASSET_COLOR,
  ASSET_COLOR_BG,
  CashFlows,
  INCOME_COLOR,
  INCOME_COLOR_BG,
  LifeEvent, OUTCOME_COLOR,
  OUTCOME_COLOR_BG,
  Year
} from "@/app/lib/type";
import React, {Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState} from "react";
import {GlobalStateContext} from "@/app/privoders/global-state";
import {ChartData, ChartOptions, TooltipItem} from "chart.js";
import {Line} from "react-chartjs-2";
import {TypedChartComponent} from "react-chartjs-2/dist/types";


const sampleEvent = {
  name: 'サラリー',
  cashFlows: {
    2025: 900,
    2026: 900,
    2027: 800,
    2028: 600,
    2029: 1000,
    2030: 1000,
    2031: 1000,
    2032: -300,
    2033: -400,
    2034: 200,
    2035: -300,
  }
}
type Props = {}

export const LifeEventRow = (props: Props) => {
  const years = useContext(GlobalStateContext).years;
  const chart = useRef< TypedChartComponent<"line">>();
  const [cashFlows, setCashFlows] = useState<CashFlows | null>(null);
  const [data, setData] = useState<ChartData<'line'> | null>(null);
  const [options, setOptions] = useState<ChartOptions<'line'> | null>(null)

  const [year, setYear] = useState<number>(0)
  const [value, setValue] = useState<string>("0")

  const titleCallback = useCallback((items: TooltipItem<any>[]): string => {
    const y = Number(items![0].label)
    setYear(y)
    if (cashFlows) {
      setValue((cashFlows[y] || 0).toString())
    }
    return `${items[0].label}年`
  }, [cashFlows])

  useEffect(() => {
    setOptions(createOption(titleCallback))
    setCashFlows(sampleEvent.cashFlows)
    setData(createData(years, sampleEvent.cashFlows))
  }, [titleCallback])

  const onChange = useCallback((event: any) => {
    if (!cashFlows) return;
    setValue(event.target.value)
    const val = Number(event.target.value)
    if (!isNaN(val)) {
      cashFlows[year] = val;
      setData(createData(years, cashFlows))
      chart.current?.update()
    }
  }, [year, cashFlows, chart.current])

  return (
    <>
      <div className="col-span-1">
        {sampleEvent.name}
      </div>
      <div className="col-span-9">
        {data && options && <Line ref={chart} data={data} options={options} height="200" width="100%"/> }
      </div>
        <div>
          {year}年
          <input type="text" value={value} onChange={onChange}/>
        </div>
    </>
  )
}

const cashFlowsToData = (years: Year[], cf: CashFlows): {
  income: number[],
  outcome: number[]
} => {
  const income: number[] = []
  const outcome: number[] = []

  for (const year of years) {
    const val = cf[year] || 0
    income.push(Math.max(val, 0))
    outcome.push(Math.min(val, 0))
  }
  return {income, outcome}
}

const createOption = (titleCallback: any): ChartOptions<'line'> => {
  return {
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      yAxis: {
        type: 'linear',
        suggestedMin: -1000,
        suggestedMax: 1000,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: titleCallback,
        }
      }
    }
  }
}

const createData = (years: Year[], cashFlows: CashFlows): ChartData<'line'> => {
  const {income, outcome} = cashFlowsToData(years, cashFlows);
  return {
    labels: years,
    datasets: [
      {
        type: 'line' as const,
        yAxisID: 'yAxis',
        label: '収入',
        backgroundColor: INCOME_COLOR_BG,
        borderColor: INCOME_COLOR,
        borderWidth: 1,
        pointStyle: false,
        fill: true,
        stepped: true,
        data: income,
      },
      {
        type: 'line' as const,
        yAxisID: 'yAxis',
        label: '支出',
        backgroundColor: OUTCOME_COLOR_BG,
        borderColor: OUTCOME_COLOR,
        borderWidth: 1,
        pointStyle: false,
        fill: true,
        stepped: true,
        data: outcome,
      },
    ],
  }
}
