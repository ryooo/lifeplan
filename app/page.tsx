"use client"
import {Timeline} from "@/app/_components/timeline";
import {useContext, useEffect} from "react";
import {familyContext, useFamily} from "./privoders/family";
import {chatMessagesContext, useChatMessages} from "./privoders/chat-messages";
import {END_YEAR, rangeArray, START_YEAR} from "@/app/lib/helper";
import {FamilyComponent} from "@/app/_components/family";
import {
  createFlatCostCashFlows,
  createBankAsset,
  createLifeCostCashFlows,
  createPensionCashFlows,
  createSalaryCashFlows, createStockAsset, createChild, createAdult
} from "@/app/lib/query";
import {Textarea} from "@chakra-ui/react";
import {ChatComponent} from "@/app/_components/chat-message";

export default function Home() {
  const familyCtx = useFamily();
  const chatMessagesCtx = useChatMessages()

  useEffect(() => {
    familyCtx.setFamily({
      adults: [
        createAdult({
          name: 'お客様',
          sex: 'man',
          age: 40,
          peekAge: 52,
          toPeekRate: 1.02,
          retireAge: 65,
          toRetireRate: 0.92,
          currentIncome: 1200,
          pension: 7,
          baseExpence: 20,
        }),
        createAdult({
          name: '配偶者様',
          sex: 'woman',
          age: 38,
          peekAge: 52,
          toPeekRate: 1.02,
          retireAge: 65,
          toRetireRate: 0.92,
          currentIncome: 100,
          pension: 7,
          baseExpence: 20,
        }),
      ],
      children: [
        createChild({
          name: 'お子様',
          sex: 'woman',
          age: 8,
          baseExpence: 10,
          highSchoolExpence: 5,
          universityExpence: 15,
        }),
        createChild({
          name: 'お子様',
          sex: 'man',
          age: 11,
          baseExpence: 10,
          highSchoolExpence: 5,
          universityExpence: 15,
        }),
      ],
      assets: [
        createBankAsset({
          incomes: [
            {year: START_YEAR, val: 1000},
          ],
        }),
        createStockAsset({
          interest: 1.02,
          incomes: [
            {year: START_YEAR, val: 3000},
          ],
        })
      ],
    })
  }, []);

  return (
    <chatMessagesContext.Provider value={chatMessagesCtx}>
      <familyContext.Provider value={familyCtx}>
        <div className="flex h-screen w-full">
          <main className="flex-1 overflow-y-auto">
            <div className="px-8 md:px-12 lg:px-16 pt-8 md:pt-12 lg:pt-16">
              <FamilyComponent/>
            </div>
            <div className="sticky bottom-0 bg-white rounded-t-3xl border-t-4">
              <div className="px-8 lg:px-16 lg:py-12 lg:h-96 md:px-8 md:py-4 md:h-52">
                <Timeline/>
              </div>
            </div>
          </main>
          <aside className="hidden w-96 border-l bg-gray-50 p-8 dark:bg-gray-900 md:block overflow-y-auto">
            <ChatComponent />
          </aside>
        </div>
      </familyContext.Provider>
    </chatMessagesContext.Provider>
  );
}
