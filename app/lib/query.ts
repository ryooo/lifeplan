import {Adult, Asset, CashFlows, LifeEvent, Year} from "@/app/lib/type";

export const createSalaryCashFlows = (currentYear: Year, age: number, retireAge: number, income: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const upTimes = 52 - age;
  for (let i = 0; i < retireAge - age; i++) {
    if (i <= upTimes) {
      // 52歳まで2%ずつ昇給
      cashFlows[currentYear + i] = income * Math.pow(1.02, i);
    } else {
      const maxIncome = income * Math.pow(1.02, upTimes)
      cashFlows[currentYear + i] = maxIncome * Math.pow(0.92, i - upTimes);
    }
  }
  return cashFlows
}

export const createPensionCashFlows = (startYear: Year, endYear: Year, age: number, retireAge: number, pension: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const retireYear = startYear + (retireAge - age)
  for (let i = retireYear; i < endYear; i++) {
    cashFlows[i] = pension * 12
  }
  return cashFlows
}

export const createLifeCostCashFlows = (startYear: Year, endYear: Year, age: number, retireAge: number | null, baseExpence: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const expence = baseExpence * 12;
  const retireYear = retireAge ? startYear + (retireAge - age) : -1
  for (let i = startYear; i < endYear; i++) {
    if (i <= retireYear) {
      cashFlows[i] = -1 * (expence * 1.2);
    } else {
      cashFlows[i] = -1 * expence;
    }
  }
  return cashFlows
}

export const createFlatCostCashFlows = (currentYear: Year, age: number, startAge: number, endAge: number | null, expence: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const startYear = currentYear + (startAge - age)
  const endYear = endAge ? currentYear + (endAge - age) : -1
  for (let i = startYear; i < endYear; i++) {
    cashFlows[i] = -1 * expence * 12
  }
  return cashFlows
}

export const createBankAsset = (years: Year[], incomes: {year: number, val: number}[]): Asset => {
  const cashFlows: CashFlows = {}
  for (const year of years) {
    cashFlows[year] = 0
  }
  for (const income of incomes) {
    cashFlows[income.year] = income.val
  }
  return {
    name: '銀行入出金',
    cashFlows
  }
}

export const createStockAsset = (years: Year[], interest: number, incomes: {year: number, val: number}[]): Asset => {
  const cashFlows: CashFlows = {}
  for (const year of years) {
    cashFlows[year] = 0
  }
  for (const income of incomes) {
    cashFlows[income.year] = income.val
  }
  return {
    name: '運用資金',
    interest,
    cashFlows
  }
}
