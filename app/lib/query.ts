import {Adult, Asset, CashFlows, LifeEvent, Year} from "@/app/lib/type";
import {last} from "@/app/lib/helper";

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

export const createPensionCashFlows = (startYear: Year, endYear: Year, age: number, retireAge: number, income: number): CashFlows => {
  const cashFlows: CashFlows = {};
  const pension = 14 * 12 + income * 0.001;
  const retireYear = startYear + (retireAge - age)
  for (let i = retireYear; i < endYear; i++) {
    cashFlows[i] = pension;
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

export const createInitialAsset = (year: Year, balance: number): Asset => {
  return {
    type: 'bank',
    year,
    balance,
    interest: 1,
  }
}
