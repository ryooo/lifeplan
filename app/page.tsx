"use client"
import {Timeline} from "@/app/_components/timeline";
import {useContext, useEffect} from "react";
import {useYears, yearsContext} from "./privoders/years";
import {familyContext, useFamily} from "./privoders/family";
import {rangeArray} from "@/app/lib/helper";
import {FamilyComponent} from "@/app/_components/family";
import {
  createInitialAsset,
  createLifeCostCashFlows,
  createPensionCashFlows,
  createSalaryCashFlows
} from "@/app/lib/query";

export default function Home() {
  const yearsCtx = useYears();
  const familyCtx = useFamily();

  useEffect(() => {
    const startYear = 2024
    const endYear = startYear + 100
    yearsCtx.setYears(rangeArray(startYear, endYear))
    familyCtx.setFamily({
      user: {
        age: 40,
        retireAge: 65,
        lifeEvents: [
          {
            name: 'サラリー',
            cashFlows: createSalaryCashFlows(startYear, 40, 65, 1200)
          },
          {
            name: '年金',
            cashFlows: createPensionCashFlows(startYear, endYear, 40, 65, 1200)
          },
          {
            name: '生活費',
            cashFlows: createLifeCostCashFlows(startYear, endYear, 40, 65, 10)
          },
        ],
        assets: [
          createInitialAsset(startYear, 3000),
        ],
      },
      children: [],
    })
  }, []);

  return (
    <yearsContext.Provider value={yearsCtx}>
      <familyContext.Provider value={familyCtx}>
        <main className="h-screen flex flex-wrap flex-col p-12">
          <div className="h-2/3">
            <div className="grid grid-cols-10">
              <FamilyComponent />
            </div>
          </div>
          <div className="h-1/3 pl-20">
            <Timeline/>
          </div>
        </main>
      </familyContext.Provider>
    </yearsContext.Provider>
  );
}
