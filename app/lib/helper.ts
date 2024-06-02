export const rangeArray = (start: number, stop: number): number[] =>
  Array.from({ length: (stop - start) + 1}, (_, i) => start + i);
