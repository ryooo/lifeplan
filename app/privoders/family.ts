
import { createContext, useCallback, useState } from 'react';
import {Family, Year} from "@/app/lib/type";

type FamilyContext = {
  family: Family;
  setFamily: (family: Family) => void;
};

const defaultContext: FamilyContext = {
  family: {
    children: [],
  },
  setFamily: () => {},
};

export const familyContext = createContext<FamilyContext>(defaultContext);

export const useFamily = (): FamilyContext => {
  const [family, setFamilyState] = useState<Family>(defaultContext.family);
  const setFamily = useCallback((current: Family): void => {
    setFamilyState(current);
  }, []);
  return {
    family,
    setFamily,
  };
};