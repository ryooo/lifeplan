import {Adult, Asset, CashFlows, LifeEvent, Year} from "@/app/lib/type";
import {END_YEAR, START_YEAR, YEARS} from "@/app/lib/helper";

export const createSalaryCashFlows = (age: number, retireAge: number, income: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const upTimes = 52 - age;
  for (let i = 0; i < retireAge - age; i++) {
    if (i <= upTimes) {
      // 52歳まで2%ずつ昇給
      cashFlows[START_YEAR + i] = income * Math.pow(1.02, i);
    } else {
      const maxIncome = income * Math.pow(1.02, upTimes)
      cashFlows[START_YEAR + i] = maxIncome * Math.pow(0.92, i - upTimes);
    }
  }
  return cashFlows
}

export const createPensionCashFlows = (age: number, retireAge: number, pension: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const retireYear = START_YEAR + (retireAge - age)
  for (let i = retireYear; i < END_YEAR; i++) {
    cashFlows[i] = pension * 12
  }
  return cashFlows
}

export const createLifeCostCashFlows = (age: number, retireAge: number | null, baseExpence: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const expence = baseExpence * 12;
  const retireYear = retireAge ? START_YEAR + (retireAge - age) : -1
  for (let i = START_YEAR; i < END_YEAR; i++) {
    if (i <= retireYear) {
      cashFlows[i] = -1 * (expence * 1.2);
    } else {
      cashFlows[i] = -1 * expence;
    }
  }
  return cashFlows
}

export const createFlatCostCashFlows = (age: number, startAge: number, endAge: number | null, expence: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const startYear = START_YEAR + (startAge - age)
  const endYear = endAge ? START_YEAR + (endAge - age) : -1
  for (let i = startYear; i < endYear; i++) {
    cashFlows[i] = -1 * expence * 12
  }
  return cashFlows
}

export const createBankAsset = (incomes: {year: number, val: number}[]): Asset => {
  const cashFlows: CashFlows = {}
  for (const year of YEARS) {
    cashFlows[year] = 0
  }
  for (const income of incomes) {
    cashFlows[income.year] = income.val
  }
  return {
    name: '預金',
    cashFlows
  }
}

export const createStockAsset = (interest: number, incomes: {year: number, val: number}[]): Asset => {
  const cashFlows: CashFlows = {}
  for (const year of YEARS) {
    cashFlows[year] = 0
  }
  for (const income of incomes) {
    cashFlows[income.year] = income.val
  }
  return {
    name: '運用資産',
    interest,
    cashFlows
  }
}
