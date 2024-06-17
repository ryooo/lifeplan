"use client"
import {Timeline} from "@/app/_components/timeline";
import {useContext, useEffect, useState} from "react";
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
  const [showDetail, setShowDetail] = useState(true)

  useEffect(() => {
    // familyCtx.setFamily({
    //   adults: [
    //     createAdult({
    //       name: 'お客様',
    //       sex: 'man',
    //       age: 40,
    //       peekAge: 52,
    //       toPeekRate: 1.02,
    //       retireAge: 65,
    //       toRetireRate: 0.92,
    //       currentIncome: 12000000,
    //       pension: 70000,
    //       baseExpence: 200000,
    //       totalInclude: true,
    //     }),
    //     createAdult({
    //       name: '配偶者様',
    //       sex: 'woman',
    //       age: 38,
    //       peekAge: 52,
    //       toPeekRate: 1.02,
    //       retireAge: 65,
    //       toRetireRate: 0.92,
    //       currentIncome: 1000000,
    //       pension: 70000,
    //       baseExpence: 200000,
    //       totalInclude: true,
    //     }),
    //   ],
    //   children: [
    //     createChild({
    //       name: 'お子様',
    //       sex: 'woman',
    //       age: 8,
    //       baseExpence: 10,
    //       highSchoolExpence: 5,
    //       universityExpence: 15,
    //       totalInclude: true,
    //     }),
    //     createChild({
    //       name: 'お子様',
    //       sex: 'man',
    //       age: 11,
    //       baseExpence: 10,
    //       highSchoolExpence: 5,
    //       universityExpence: 15,
    //       totalInclude: true,
    //     }),
    //   ],
    //   assets: [
    //     createBankAsset({
    //       class: 'bank',
    //       interest: 1,
    //       opened: false,
    //       incomes: [
    //         {year: START_YEAR, val: 10000000},
    //       ],
    //     }),
    //     createStockAsset({
    //       class: 'managed asset',
    //       interest: 1.02,
    //       opened: false,
    //       incomes: [
    //         {year: START_YEAR, val: 30000000},
    //       ],
    //     })
    //   ],
    // })
  }, []);

  const activeBtn = "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
  const inactiveBtn = "py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700";

  const wholeChat = familyCtx.family.adults.length <= 0
  return (
    <chatMessagesContext.Provider value={chatMessagesCtx}>
      <familyContext.Provider value={familyCtx}>
        <div className="flex h-screen bg-white">
          {wholeChat ? (
            <nav className="flex justify-center items-center mx-auto">
              <div className="w-3/4">
                <ChatComponent/>
              </div>
            </nav>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="flex justify-between items-center bg-gray-200 p-4">
                <h1 className="flex font-bold text-xl">ライフプランナー</h1>
                <div className={'flex w-52 justify-between items-center '}>
                  <button type="button" className={showDetail ? activeBtn : inactiveBtn}
                          onClick={() => setShowDetail(true)}>
                    合計
                  </button>
                  <button className={showDetail ? inactiveBtn : activeBtn} onClick={() => setShowDetail(false)}>
                    詳細
                  </button>
                </div>
                <div className="flex">ログイン</div>
              </header>
              <div className="flex h-full">
                <main className="flex flex-col w-full bg-white overflow-x-hidden overflow-y-auto mb-14 p-20">
                  {!showDetail ? (<main className="flex-1 overflow-y-auto">
                    <div className="px-8 md:px-12 lg:px-16 pt-8 md:pt-12 lg:pt-16">
                      <FamilyComponent/>
                    </div>
                    <div className="sticky bottom-0 bg-white rounded-t-3xl border-t-4">
                      <div className="px-8 lg:px-16 lg:py-12 lg:h-96 md:px-8 md:py-4 md:h-52">
                        <Timeline/>
                      </div>
                    </div>
                  </main>) : (
                    <div className="w-full h-full">
                      <Timeline/>
                    </div>
                  )}
                </main>
                <nav className="flex justify-center items-center mx-auto">
                  <div className="w-96">
                    <ChatComponent/>
                  </div>
                </nav>
              </div>
            </div>
          )}
        </div>
      </familyContext.Provider>
    </chatMessagesContext.Provider>
  );
}
