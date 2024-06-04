
export type Age = number;
export type Year = number;
export type MYen = number;

export type CashFlows = {
  [key in Year]: MYen;
}

export type LifeEvent = {
  name: string;
  cashFlows: CashFlows;
}

export type Family = {
  user?: Adult;
  partner?: Adult;
  children: Child[];
}

export type Person = {
  id: string;
  age: Age;
  lifeEvents: LifeEvent[];
  assets: Asset[];
}

export type Adult = Person & {
  retireAge?: Age;
}

export type Child = Person;

export type Asset = {
  name: string;
  cashFlows: CashFlows;
}

export const ASSET_COLOR = '#6b78b4'
export const ASSET_COLOR_BG = '#6b78b433'
export const INCOME_COLOR = '#ffca00'
export const INCOME_COLOR_BG = '#ffca0033'
export const OUTCOME_COLOR = '#cccccc'
export const OUTCOME_COLOR_BG = '#cccccc33'

export const getPerson = (family: Family, personId: string): Person | undefined => {
  switch (personId) {
    case "user":
      return family.user;
    case "partner":
      return family.partner;
  }
  const index = Number(personId.replace("child", ""))
  return family.children[index]
}