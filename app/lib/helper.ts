export const rangeArray = (start: number, stop: number): number[] =>
  Array.from({ length: (stop - start) + 1}, (_, i) => start + i);

export const last = <T>(arr: T[]): T | undefined => arr[arr.length - 1];


export const START_YEAR = 2024
export const END_YEAR = START_YEAR + 100
export const YEARS = rangeArray(START_YEAR, END_YEAR)