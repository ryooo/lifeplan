import {Adult, Asset, CashFlows, Child, LifeEvent, Sex, Year} from "@/app/lib/type";
import {END_YEAR, START_YEAR, YEARS} from "@/app/lib/helper";

export const createSalaryCashFlows = (
  age: number,
  peekAge: number,
  toPeekRate: number,
  retireAge: number,
  toRetireRate: number,
  currentIncome: number,
): CashFlows => {
  const cashFlows: CashFlows = {};
  const upTimes = peekAge - age;
  for (let i = 0; i < retireAge - age; i++) {
    if (i <= upTimes) {
      // 52歳まで2%ずつ昇給
      cashFlows[START_YEAR + i] = currentIncome * Math.pow(toPeekRate, i);
    } else {
      const maxIncome = currentIncome * Math.pow(toPeekRate, upTimes)
      cashFlows[START_YEAR + i] = maxIncome * Math.pow(toRetireRate, i - upTimes);
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
  for (let i = START_YEAR; i < END_YEAR; i++) {
    cashFlows[i] = -1 * expence;
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

export type AssetParams = {
  class: 'bank' | 'managed asset';
  interest: number;
  incomes: { year: number, val: number }[];
  opened: boolean;
}

export const createBankAsset = (params: AssetParams): Asset => {
  const cashFlows: CashFlows = {}
  for (const year of YEARS) {
    cashFlows[year] = 0
  }
  for (const income of params.incomes) {
    cashFlows[income.year] = income.val
  }
  return {
    type: 'asset',
    id:  crypto.randomUUID(),
    name: '預金',
    cashFlows,
    params,
    opened: params.opened || false,
  }
}

export const createStockAsset = (params: AssetParams): Asset => {
  const cashFlows: CashFlows = {}
  for (const year of YEARS) {
    cashFlows[year] = 0
  }
  for (const income of params.incomes) {
    cashFlows[income.year] = income.val
  }
  return {
    type: 'asset',
    id:  crypto.randomUUID(),
    name: '運用資産',
    cashFlows,
    params,
    opened: params.opened || false,
  }
}

export const createAsset = (params: AssetParams): Asset => {
  return {
    type: 'asset',
    id:  crypto.randomUUID(),
    name:  getAssetClassName(params.class),
    cashFlows: [],
    params,
    opened: params.opened || false,
  }
}

const getAssetClassName = (cls: string): string => {
  switch (cls) {
    case "bank":
      return "預金"
    default:
      return '運用資産'
  }
}

export type AdultParams = {
  name: string | null;
  sex: Sex | null;
  age: number;
  peekAge: number;
  toPeekRate: number;
  retireAge: number;
  toRetireRate: number;
  currentIncome: number;
  pension: number;
  baseExpence: number;
  totalInclude: boolean;
  opened?: boolean;
}

export const createAdult = (params: AdultParams): Adult => {
  return {
    type: 'adult',
    params,
    id:  crypto.randomUUID(),
    name: params.name,
    sex: params.sex,
    age: params.age,
    retireAge: params.retireAge,
    opened: params.opened || false,
    lifeEvents: [
      {
        name: 'サラリー',
        cashFlows: createSalaryCashFlows(
          params.age,
          params.peekAge,
          params.toPeekRate,
          params.retireAge,
          params.toRetireRate,
          params.currentIncome,
        ),
      },
      {
        name: '年金',
        cashFlows: createPensionCashFlows(params.age, params.retireAge, params.pension)
      },
      {
        name: '生活費',
        cashFlows: createLifeCostCashFlows(params.age, params.retireAge, params.baseExpence)
      },
    ],
  }
}

export type ChildParams = {
  name: string | null;
  sex: Sex | null;
  age: number;
  baseExpence: number;
  highSchoolExpence: number;
  universityExpence: number;
  totalInclude: boolean;
  opened?: boolean;
}

export const createChild = (params: ChildParams): Child => {
  return {
    type: 'child',
    params,
    id:  crypto.randomUUID(),
    name: params.name,
    sex: params.sex,
    age: params.age,
    opened: params.opened || false,
    lifeEvents: [
      {
        name: '生活費',
        cashFlows: createFlatCostCashFlows(params.age, params.age, 22, params.baseExpence)
      },
      {
        name: '高校',
        cashFlows: createFlatCostCashFlows(params.age, 15, 17, params.highSchoolExpence)
      },
      {
        name: '大学',
        cashFlows: createFlatCostCashFlows(params.age, 18, 22, params.universityExpence)
      },
    ],
  }
}

export const isAdult = (t: unknown): t is Adult => {
  if (!t || typeof t !== "object") return false;
  const type = (t as any).type;
  return type === "adult";
};

export const isChild = (t: unknown): t is Child => {
  if (!t || typeof t !== "object") return false;
  const type = (t as any).type;
  return type === "child";
};

export const isMan = (t: unknown): t is Child => {
  if (!t || typeof t !== "object") return false;
  const sex = (t as any).sex;
  return sex === "man";
};

export const isWoman = (t: unknown): t is Child => {
  if (!t || typeof t !== "object") return false;
  const sex = (t as any).sex;
  return sex === "woman";
};
