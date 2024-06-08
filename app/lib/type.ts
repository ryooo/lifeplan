import {YEARS} from "@/app/lib/helper";
import {getAllMembers} from "@/app/_components/family";
import {AdultParams, ChildParams} from "@/app/lib/query";

export type Age = number;
export type Year = number;
export type MYen = number;

export type CashFlows = {
  [key in Year]: MYen;
}

export type Balances = {
  [key in Year]: MYen;
}

export type LifeEvent = {
  name: string;
  cashFlows: CashFlows;
}

export type Family = {
  adults: Adult[];
  children: Child[];
  assets: Asset[];
}

export type Person = Adult | Child;
export type Sex = 'man' | 'woman';

export type Adult = {
  type: 'adult';
  id: string;
  name: string | null;
  sex: Sex | null;
  age: Age;
  lifeEvents: LifeEvent[];
  retireAge?: Age;
  params: AdultParams;
}

export type Child = {
  type: 'child';
  id: string;
  name: string | null;
  sex: Sex | null;
  age: Age;
  lifeEvents: LifeEvent[];
  params: ChildParams;
};

export type Asset = {
  name: string;
  interest?: number;
  cashFlows: CashFlows;
  migratedCashFlows?: CashFlows;
  balances?: Balances;
}

export const ASSET_COLOR = '#6b78b4'
export const ASSET_COLOR_BG = '#6b78b433'
export const ASSET_MINUS_COLOR = '#fa8888'
export const INCOME_COLOR = '#ffca00'
export const INCOME_COLOR_BG = '#ffca0033'
export const OUTCOME_COLOR = '#cccccc'
export const OUTCOME_COLOR_BG = '#cccccc33'

export const getPerson = (family: Family, personId: string): Person | undefined => {
  return getAllMembers(family).find(p => p.id === personId)
}


export const calcAssetMigratedCashFlow = (assets: Asset[], familyCashFlow: FamilyCashFlow): void => {
  for (const asset of assets) {
    asset.migratedCashFlows = {}
    for (const year of YEARS) {
      const val = asset.cashFlows[year] || 0
      if (asset.name === '預金') {
        // キャッシュフローの結果はまず銀行残高に形状される
        asset.migratedCashFlows[year] = val + (familyCashFlow.income[year] - familyCashFlow.outcome[year])
      } else {
        asset.migratedCashFlows[year] = val
      }
    }

    let lastYearVal = 0;
    asset.balances = {}
    for (const year of YEARS) {
      const val = (lastYearVal * (asset.interest || 1)) + (asset.migratedCashFlows![year] || 0)
      asset.balances[year] = val
      lastYearVal = val
    }
  }
}

type FamilyCashFlow = {
  income: number[],
  outcome: number[],
}

export const calcFamilyCashFlow = (family: Family): FamilyCashFlow => {
  const data: FamilyCashFlow = {
    income: [],
    outcome: [],
  };
  const members = getAllMembers(family)
  for (const year of YEARS) {
    for (const person of members) {
      const income = totalIncome(year, person)
      const outcome = totalOutcome(year, person)
      data.income[year] ||= 0
      data.outcome[year] ||= 0
      data.income[year] += income
      data.outcome[year] += outcome
    }
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
    if (cashFlow < 0) total += -1 * cashFlow
  }
  return total
}


export const totalAssets = (year: Year, family: Family): number => {
  let total = 0;
  for (const asset of family.assets ?? []) {
    total += (asset.balances?.[year] || 0)
  }
  return total
}
