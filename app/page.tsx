"use client"
import {Timeline} from "@/app/_components/timeline";
import {useContext, useEffect} from "react";
import {useYears, yearsContext} from "./privoders/years";
import {familyContext, useFamily} from "./privoders/family";
import {rangeArray} from "@/app/lib/helper";
import {FamilyComponent} from "@/app/_components/family";
import {
  createInitialBankAsset,
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
        id: "user",
        age: 40,
        retireAge: 65,
        lifeEvents: [
          {
            name: 'サラリー',
            cashFlows: createSalaryCashFlows(startYear, 40, 65, 1200)
          },
          {
            name: '年金',
            cashFlows: createPensionCashFlows(startYear, endYear, 40, 65, 7 * 12)
          },
          {
            name: '生活費',
            cashFlows: createLifeCostCashFlows(startYear, endYear, 40, 65, 20)
          },
        ],
        assets: [
          createInitialBankAsset(yearsCtx.years, [
            {year: startYear, val: 3000},
            {year: startYear + 25, val: 2000},
          ]),
        ],
      },
      partner: {
        id: "partner",
        age: 38,
        retireAge: 65,
        lifeEvents: [
          {
            name: 'サラリー',
            cashFlows: createSalaryCashFlows(startYear, 38, 65, 80)
          },
          {
            name: '年金',
            cashFlows: createPensionCashFlows(startYear, endYear, 38, 65, 7 * 12)
          },
          {
            name: '生活費',
            cashFlows: createLifeCostCashFlows(startYear, endYear, 38, 65, 20)
          },
        ],
        assets: [
        ],
      },
      children: [],
    })
  }, []);

  return (
    <yearsContext.Provider value={yearsCtx}>
      <familyContext.Provider value={familyCtx}>
        <main>
          <div>
            <div className="p-10">
              <FamilyComponent />
              <div className="h-60">
                <Timeline/>
              </div>
            </div>
          </div>
        </main>
      </familyContext.Provider>
    </yearsContext.Provider>
  );
}
