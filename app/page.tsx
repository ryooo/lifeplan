"use client"
import {Timeline} from "@/app/_components/timeline";
import {useContext, useEffect} from "react";
import {familyContext, useFamily} from "./privoders/family";
import {END_YEAR, rangeArray, START_YEAR} from "@/app/lib/helper";
import {FamilyComponent} from "@/app/_components/family";
import {
  createFlatCostCashFlows,
  createBankAsset,
  createLifeCostCashFlows,
  createPensionCashFlows,
  createSalaryCashFlows, createStockAsset
} from "@/app/lib/query";

export default function Home() {
  const familyCtx = useFamily();

  useEffect(() => {
    familyCtx.setFamily({
      user: {
        id: "user",
        age: 40,
        retireAge: 65,
        lifeEvents: [
          {
            name: 'サラリー',
            cashFlows: createSalaryCashFlows(40, 65, 1200)
          },
          {
            name: '年金',
            cashFlows: createPensionCashFlows(40, 65, 7)
          },
          {
            name: '生活費',
            cashFlows: createLifeCostCashFlows(40, 65, 20)
          },
        ],
      },
      partner: {
        id: "partner",
        age: 38,
        retireAge: 65,
        lifeEvents: [
          {
            name: 'サラリー',
            cashFlows: createSalaryCashFlows(38, 65, 80)
          },
          {
            name: '年金',
            cashFlows: createPensionCashFlows(38, 65, 7)
          },
          {
            name: '生活費',
            cashFlows: createLifeCostCashFlows(38, 65, 20)
          },
        ],
      },
      children: [
        {
          id: "child1",
          age: 8,
          lifeEvents: [
            {
              name: '生活費',
              cashFlows: createFlatCostCashFlows(8, 8, 22, 10)
            },
            {
              name: '高校',
              cashFlows: createFlatCostCashFlows(8, 15, 17, 5)
            },
            {
              name: '大学',
              cashFlows: createFlatCostCashFlows(8, 18, 22, 15)
            },
          ],
        },
        {
          id: "child2",
          age: 11,
          lifeEvents: [
            {
              name: '生活費',
              cashFlows: createFlatCostCashFlows(11, 11, 22, 10)
            },
            {
              name: '高校',
              cashFlows: createFlatCostCashFlows(11, 15, 17, 5)
            },
            {
              name: '大学',
              cashFlows: createFlatCostCashFlows(11, 18, 22, 15)
            },
          ],
        },
      ],
      assets: [
        createBankAsset([
          {year: START_YEAR, val: 1000},
        ]),
        createStockAsset(1.02, [
          {year: START_YEAR, val: 3000},
        ])
      ],
    })
  }, []);

  return (
    <familyContext.Provider value={familyCtx}>
      <main>
        <div>
          <div className="p-10">
            <FamilyComponent/>
            <div className="h-60">
              <Timeline/>
            </div>
          </div>
        </div>
      </main>
    </familyContext.Provider>
  );
}
