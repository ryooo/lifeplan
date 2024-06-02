"use client"
import {createContext} from "react";
import {Year} from "@/app/lib/type";

export type GlobalState = {
  years: Year[];
}

export const GlobalStateContext = createContext<GlobalState>({
  years: [],
});


type Props = {
  globalState: GlobalState
  children: React.ReactNode
}

export const GlobalStateProvider = ({ globalState, children }: Props) => {
  return <GlobalStateContext.Provider value={globalState}>
    {children}
  </GlobalStateContext.Provider>
}
