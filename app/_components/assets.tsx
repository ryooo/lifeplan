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
import {useYears, yearsContext} from "@/app/privoders/years";
import {familyContext} from "@/app/privoders/family";


type Props = {
  personId: string;
  assetIndex: number;
}

export const AssetComponent = ({personId, assetIndex}: Props) => {
  const {years} = useContext(yearsContext);
  const {family, setFamily} = useContext(familyContext);
  const [data, setData] = useState<ChartData<'line'> | null>(null);

  const onDragEnd = useCallback((index: number, val: number): void => {
    const newFamily = {...family}
    const person = getPerson(newFamily, personId)!
    const asset = person.assets[assetIndex]
    const year = years[index];
    asset.cashFlows[year] = val
    setFamily(newFamily)
  }, [])

  useEffect(() => {
    const person = getPerson(family, personId)!
    setData(createData(years, person, assetIndex))
  }, [family])

  return (
    <>
      <div>資産推移</div>
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

const createData = (years: Year[], person: Person, assetIndex: number): ChartData<'line'> => {
  calcAssetBalances(years, person.assets[assetIndex]);
  const datasets: ChartDataset<'line'>[] = [{
      type: 'line' as const,
      yAxisID: 'yAxisL',
      label: person.assets[assetIndex].name,
      borderWidth: 1,
      fill: true,
      stepped: true,
      data: assetCashFlowsToData(years, person.assets[assetIndex]),
      pointHitRadius: 25,
      borderColor: INCOME_COLOR,
      backgroundColor: INCOME_COLOR_BG,
  },
  {
    type: 'line' as const,
    yAxisID: 'yAxisR',
    label: `${person.assets[assetIndex].name}(残高)`,
    borderWidth: 1,
    stepped: false,
    data: assetBalancesToData(years, person.assets[assetIndex]),
    pointStyle: false,
    fill: false,
    borderColor: ASSET_COLOR,
    backgroundColor: ASSET_COLOR_BG,
  }]
  return {
    labels: years,
    datasets: datasets,
  }
}

const assetCashFlowsToData = (years: Year[], asset: Asset): number[] => {
  return years.map(y => asset.cashFlows[y] || 0)
}
const assetBalancesToData = (years: Year[], stockData: Asset): number[] => {
  return years.map(y => stockData.balances?.[y] || 0)
}

export const calcAssetMigratedCashFlow = (years: Year[], assets: Asset[], totalCashFlow: TotalCashFlow): void => {
  for (const asset of assets) {
    asset.migratedCashFlows = {}
    for (const year of years) {
      const val = asset.cashFlows[year] || 0
      if (asset.name === '銀行入出金') {
        // キャッシュフローの結果はまず銀行残高に形状される
        asset.migratedCashFlows[year] = val + (totalCashFlow.income[year] - totalCashFlow.outcome[year])
      } else {
        asset.migratedCashFlows[year] = val
      }
    }
  }
}

export const calcAssetBalances = (years: Year[], asset: Asset): void => {
  let lastYearVal = 0;
  asset.balances = {}
  for (const year of years) {
    const val = (lastYearVal * (asset.interest || 1)) + (asset.migratedCashFlows![year] || 0)
    asset.balances[year] = val
    lastYearVal = val
  }
}

type TotalCashFlow = {
    income: number[],
    outcome: number[],
  }

export const calcTotalCashFlow = (years: Year[], person: Person): TotalCashFlow => {
  const data: TotalCashFlow = {
    income: [],
    outcome: [],
  };
  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    const income = totalIncome(year, person)
    const outcome = totalOutcome(year, person)
    data.income[year] = income
    data.outcome[year] = outcome
  }
  return data
}

export const totalIncome = (year: Year, person: Person): number => {
  let total = 0;
  for (const lifeEvent of person.lifeEvents ?? []) {
    const cashFlow = (lifeEvent.cashFlows[year] || 0)
    if (cashFlow > 0) total += cashFlow
  }
  return total
}

export const totalOutcome = (year: Year, person: Person): number => {
  let total = 0;
  for (const lifeEvent of person.lifeEvents ?? []) {
    const cashFlow = (lifeEvent.cashFlows[year] || 0)
    if (cashFlow < 0) total +=  -1 * cashFlow
  }
  return total
}


export type BalanceSheet = {
  income: CashFlows,
  outcome: CashFlows,
  asset: CashFlows,
}
type PersonBalanceSheet = BalanceSheet;
type FamilyBalanceSheet = BalanceSheet;

type FamilyData = {
  income: number[],
  outcome: number[],
  asset: number[],
}

export const calcBalanceSheet = (years: Year[], person: Person): PersonBalanceSheet => {
  const data: PersonBalanceSheet = {
    income: [],
    outcome: [],
    asset: [],
  };
  let lastTotalAsset = 0;
  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    const income = totalIncome(year, person)
    const outcome = totalOutcome(year, person)
    data.income[year] = income
    data.outcome[year] = outcome
    data.asset[year] = lastTotalAsset + 1 + income - outcome
    lastTotalAsset = data.asset[year]
  }
  return data
}

export const calcFamilyBalanceSheet = (years: Year[], family: Family): FamilyBalanceSheet => {
  const data: PersonBalanceSheet = {
    income: [],
    outcome: [],
    asset: [],
  };
  const balanceSheets: PersonBalanceSheet[] = []
  if (family.user) {
    balanceSheets.push(calcBalanceSheet(years, family.user))
  }
  if (family.partner) {
    balanceSheets.push(calcBalanceSheet(years, family.partner))
  }
  for (const child of family.children) {
    balanceSheets.push(calcBalanceSheet(years, child))
  }
  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    data.income[year] ??= 0
    data.outcome[year] ??= 0
    data.asset[year] ??= 0
    for (const balanceSheet of balanceSheets) {
      data.income[year] += balanceSheet.income[year]
      data.outcome[year] += balanceSheet.outcome[year]
      data.asset[year] += balanceSheet.asset[year]
    }
  }
  return data
}

export const familyBsToData = (years: Year[], familyBs: FamilyBalanceSheet): FamilyData => {
  return {
    income: years.map(y => familyBs.income[y] || 0),
    outcome: years.map(y => familyBs.outcome[y] || 0),
    asset: years.map(y => familyBs.asset[y] || 0),
  };
}
