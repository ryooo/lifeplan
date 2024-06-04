
import { createContext, useCallback, useState } from 'react';
import {Year} from "@/app/lib/type";

type YearsContext = {
  years: Year[];
  setYears: (years: Year[]) => void;
};

const defaultContext: YearsContext = {
  years: [],
  setYears: () => {},
};

export const yearsContext = createContext<YearsContext>(defaultContext);

export const useYears = (): YearsContext => {
  const [years, setYearsState] = useState<Year[]>([]);
  const setYears = useCallback((current: Year[]): void => {
    setYearsState(current);
  }, []);
  return {
    years,
    setYears,
  };
};