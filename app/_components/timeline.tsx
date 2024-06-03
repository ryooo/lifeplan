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
  ASSET_COLOR_BG,
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
  const familyData = createFamilyData(yearsCtx.years, familyCtx.family);

  const data: ChartData<'line'|'bar'> = {
    labels: yearsCtx.years,
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
        data: familyData.asset,
      },
      {
        type: 'bar' as const,
        label: '収入',
        backgroundColor: INCOME_COLOR,
        data: familyData.income,
        // borderColor: 'white',
        // borderWidth: 2,
      },
      {
        type: 'bar' as const,
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
  }
  return <Chart type='bar' data={data} options={options} height="100%" width="100%" />;
}

type BalanceSheet = {
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

const calcBalanceSheet = (years: Year[], person: Person): PersonBalanceSheet => {
  const data: PersonBalanceSheet = {
    income: [],
    outcome: [],
    asset: [],
  };
  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    data.income[year] = totalIncome(year, person)
    data.outcome[year] = totalOutcome(year, person)
    data.asset[year] = totalAsset(year, person)
  }
  return data
}

const calcFamilyBalanceSheet = (years: Year[], family: Family): FamilyBalanceSheet => {
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

const createFamilyData = (years: Year[], family: Family): FamilyData => {
  const familyBalanceSheet = calcFamilyBalanceSheet(years, family)
  const data: FamilyData = {
    income: [],
    outcome: [],
    asset: [],
  };
  for (let i = 0; i < years.length; i++) {
    const year = years[i]
    data.income[i] = familyBalanceSheet.income[year]
    data.outcome[i] = familyBalanceSheet.outcome[year]
    data.asset[i] = familyBalanceSheet.asset[year]
  }
  return data
}

const totalIncome = (year: Year, person: Person): number => {
  let total = 0;
  for (const lifeEvent of person.lifeEvents ?? []) {
    const cashFlow = (lifeEvent.cashFlows[year] || 0)
    if (cashFlow > 0) total += cashFlow
  }
  return total
}

const totalOutcome = (year: Year, person: Person): number => {
  let total = 0;
  for (const lifeEvent of person.lifeEvents ?? []) {
    const cashFlow = (lifeEvent.cashFlows[year] || 0)
    if (cashFlow < 0) total +=  -1 * cashFlow
  }
  return total
}

const totalAsset = (year: Year, person: Person): number => {
  let total = 0;
  for (const asset of person.assets ?? []) {
    total +=  asset.balance
  }
  return total
}
