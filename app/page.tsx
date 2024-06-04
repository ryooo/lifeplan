"use client"
import {Timeline} from "@/app/_components/timeline";
import {useContext, useEffect} from "react";
import {useYears, yearsContext} from "./privoders/years";
import {familyContext, useFamily} from "./privoders/family";
import {rangeArray} from "@/app/lib/helper";
import {FamilyComponent} from "@/app/_components/family";
import {
  createFlatCostCashFlows,
  createBankAsset,
  createLifeCostCashFlows,
  createPensionCashFlows,
  createSalaryCashFlows, createStockAsset
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
            cashFlows: createPensionCashFlows(startYear, endYear, 40, 65, 7)
          },
          {
            name: '生活費',
            cashFlows: createLifeCostCashFlows(startYear, endYear, 40, 65, 20)
          },
        ],
        assets: [
          createBankAsset(yearsCtx.years, [
            {year: startYear, val: 1000},
          ]),
          createStockAsset(yearsCtx.years, 1.04, [
            {year: startYear, val: 3000},
          ])
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
            cashFlows: createPensionCashFlows(startYear, endYear, 38, 65, 7)
          },
          {
            name: '生活費',
            cashFlows: createLifeCostCashFlows(startYear, endYear, 38, 65, 20)
          },
        ],
        assets: [
          createBankAsset(yearsCtx.years, [
          ]),
        ],
      },
      children: [
        {
          id: "child1",
          age: 8,
          lifeEvents: [
            {
              name: '生活費',
              cashFlows: createFlatCostCashFlows(startYear, 8, 8, 22, 10)
            },
            {
              name: '高校',
              cashFlows: createFlatCostCashFlows(startYear, 8, 15, 17, 5)
            },
            {
              name: '大学',
              cashFlows: createFlatCostCashFlows(startYear, 8, 18, 22, 15)
            },
          ],
          assets: [],
        },
        {
          id: "child2",
          age: 11,
          lifeEvents: [
            {
              name: '生活費',
              cashFlows: createFlatCostCashFlows(startYear, 11, 11, 22, 10)
            },
            {
              name: '高校',
              cashFlows: createFlatCostCashFlows(startYear, 11, 15, 17, 5)
            },
            {
              name: '大学',
              cashFlows: createFlatCostCashFlows(startYear, 11, 18, 22, 15)
            },
          ],
          assets: [],
        },
      ],
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
