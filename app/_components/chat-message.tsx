import {ChatMessage, ChatMessages} from "@/app/lib/chat";
import {chatMessagesContext} from "@/app/privoders/chat-messages";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Textarea} from "@chakra-ui/react";
import {chatMessage, firstMessage, fixJson} from "@/app/lib/llm";
import {familyContext} from "@/app/privoders/family";
import {calcAssetMigratedCashFlow, calcFamilyCashFlow, Family, Sex, totalAssets} from "@/app/lib/type";
import {
  createAdult, createAsset, createBankAsset, createChild,
  createFlatCostCashFlows,
  createLifeCostCashFlows,
  createPensionCashFlows,
  createSalaryCashFlows, createStockAsset
} from "@/app/lib/query";
import {START_YEAR, YEARS} from "@/app/lib/helper";


type ChatMessageComponentProp = {
  chatMessage: ChatMessage;
}
export const ChatMessageComponent = ({chatMessage}: ChatMessageComponentProp) => {
  return (
    <div className="grid gap-2">
      <div className="font-bold text-lg">{chatMessage.speaker}</div>
      <div className="prose prose-stone">
        <p>{chatMessage.message}</p>
      </div>
    </div>
  )
}

type ChatMessagesComponentProp = {
  chatMessages: ChatMessages;
}
export const ChatMessagesComponent = ({chatMessages}: ChatMessagesComponentProp) => {
  return (
    <>
      {chatMessages.map((c, i) => <ChatMessageComponent key={i} chatMessage={c}/>)}
    </>
  )
}

export const ChatComponent = () => {
  const {family, setFamily} = useContext(familyContext);
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const {chatMessages, setChatMessages} = useContext(chatMessagesContext);
  const [loading, setLoading] = useState(false)
  const addChatMessage = useCallback(async (text: string) => {
    const newChatMessages = [...chatMessages]
    newChatMessages.push({
      speaker: 'you',
      message: text,
    })
    setChatMessages(newChatMessages)

    setLoading(true)
    const [condition, prompt] = getFamilyCondition(family)
    const llmMessage = await chatMessage(textAreaRef.current!.value, chatMessages, condition, prompt)
    const [systemCommands, userMessae] = await findSystemCommand(llmMessage)
    const newFamily = execSystemCommands(systemCommands, family)
    if (newFamily) {
      setFamily(newFamily)
    }
    newChatMessages.push({
      speaker: 'ファイナンシャルプランナー',
      message: userMessae,
    })
    setChatMessages(newChatMessages)
    setLoading(false)
  }, [chatMessages, family])

  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        speaker: 'ファイナンシャルプランナー',
        message: firstMessage,
      }])
    }
  }, []);

  return (
    <div className="flex flex-row h-screen w-full">
      <div className="p-2 flex flex-col bg-white">
        <h2 className="text-xl font-bold">Chat</h2>
        <div className="flex-grow overflow-y-auto">
          <div className="space-y-4 pb-4">
            <ChatMessagesComponent chatMessages={chatMessages}/>
          </div>
          <div className="border-t border-gray-200 bg-white sticky bottom-0 h-52 pt-4">
            {
              !loading && <Textarea
                ref={textAreaRef}
                placeholder="Type your message..."
                className="w-full resize-none rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    addChatMessage(textAreaRef.current!.value)
                    textAreaRef.current!.value = ""
                    e.preventDefault()
                    return false
                  }
                }}
              />
            }
          </div>
        </div>
      </div>
    </div>
  )
}

type SystemCommand = {
  command: string;
}

const findSystemCommand = async (llmMessage: string): Promise<[SystemCommand[], string]> => {
  const regex = /```json\s*({[\s\S]*?})\s*```/g;

  let userMessage = llmMessage
  const systemCommands: SystemCommand[] = []
  const matches = llmMessage.match(regex);
  for (const match of (matches || [])) {
    userMessage = userMessage.replace(match, "")
    const js = match.replace("```json", "").replace("```", "")
    console.log(match, js)
    try {
      systemCommands.push(JSON.parse(js))
    } catch (e: any) {
      if (e.message.startsWith("SyntaxError")) {
        const fixedJson = (await fixJson(js)).replace("```json", "").replace("```", "")
        console.log("fixedJson", fixedJson)
        systemCommands.push(JSON.parse(fixedJson))
      }
    }
  }
  return [systemCommands, userMessage]
}

type SystemCommandCreateAdult = SystemCommand & {
  command: 'createAdult';
  age: number;
  incomePerYearJpy: number;
}

type SystemCommandCreateChild = SystemCommand & {
  command: 'createChild';
  age: number;
}

type SystemCommandSetBankBalance = SystemCommand & {
  command: 'setBankBalance';
  balanceJpy: number;
}

type SystemCommandSetManagedAssetBalance = SystemCommand & {
  command: 'setManagedAssetBalance';
  year: number;
  balanceJpy: number;
}

type SystemCommandScheduledDeposit = SystemCommand & {
  command: 'scheduledDeposit';
  year: number;
  balanceJpy: number;
}

type SystemCommandUpdateFamilyExpence = SystemCommand & {
  command: 'updateFamilyExpence';
  balanceJpy: number;
}

type SystemCommandUpdateFamilyPension = SystemCommand & {
  command: 'updateFamilyPension';
  balanceJpy: number;
}

const execSystemCommands = (systemCommands: SystemCommand[], family: Family): Family | undefined => {
  const newFamily = {...family}
  for (const systemCommand of systemCommands) {
    switch (systemCommand.command) {
      case "createAdult":
        const createAdultCommand = systemCommand as SystemCommandCreateAdult
        newFamily.adults.push(createAdult({
          name: newFamily.adults.length === 0 ? 'お客様' : "ご家族様",
          sex: newFamily.adults.length === 1 ? 'woman' : "man",
          age: createAdultCommand.age,
          peekAge: 52,
          toPeekRate: 1.02,
          retireAge: 65,
          toRetireRate: 0.92,
          currentIncome: createAdultCommand.incomePerYearJpy,
          pension: 7,
          baseExpence: 15,
          totalInclude: true,
        }))
        break;
      case "createChild":
        const createChildCommand = systemCommand as SystemCommandCreateChild
        newFamily.children.push(createChild({
          name: 'お子様',
          sex: newFamily.adults.length === 1 ? 'woman' : "man",
          age: createChildCommand.age,
          baseExpence: 5,
          highSchoolExpence: 5,
          universityExpence: 15,
          totalInclude: true,
        }))
        break;
      case "setBankBalance":
        const setBankBalanceCommand = systemCommand as SystemCommandSetBankBalance
        const indexBankBalanceCommand = newFamily.assets.findIndex(a => a.params.class === 'bank')
        const assetBankBalanceCommand = createBankAsset({
          class: 'bank',
          interest: 1,
          opened: false,
          incomes: [
            {year: START_YEAR, val: setBankBalanceCommand.balanceJpy},
          ],
        })
        if (indexBankBalanceCommand < 0) {
          newFamily.assets.push(assetBankBalanceCommand)
        } else {
          newFamily.assets[indexBankBalanceCommand] = assetBankBalanceCommand
        }
        break;
      case "setManagedAssetBalance":
        const setManagedAssetBalanceCommand = systemCommand as SystemCommandSetManagedAssetBalance
        const indexSetManagedAssetBalanceCommand = newFamily.assets.findIndex(a => a.params.class === 'managed asset')
        const assetSetManagedAssetBalanceCommand = createStockAsset({
          class: 'managed asset',
          interest: 1.02,
          opened: false,
          incomes: [
            {year: START_YEAR, val: setManagedAssetBalanceCommand.balanceJpy},
          ],
        })
        if (indexSetManagedAssetBalanceCommand < 0) {
          newFamily.assets.push(assetSetManagedAssetBalanceCommand)
        } else {
          newFamily.assets[indexSetManagedAssetBalanceCommand] = assetSetManagedAssetBalanceCommand
        }
        break;
      case "scheduledDeposit":
        const scheduledDepositCommand = systemCommand as SystemCommandScheduledDeposit
        const indexScheduledDepositCommand = newFamily.assets.findIndex(a => a.params.class === 'bank')
        const assetScheduledDepositCommand = indexScheduledDepositCommand < 0 ? createBankAsset({
          class: 'bank',
          interest: 1,
          opened: false,
          incomes: [
            {year: START_YEAR, val: 0},
          ],
        }) : newFamily.assets[indexScheduledDepositCommand];
        assetScheduledDepositCommand.cashFlows[scheduledDepositCommand.year] = scheduledDepositCommand.balanceJpy;
        break;
      case "updateFamilyExpence":
        const updateFamilyExpenceCommand = systemCommand as SystemCommandUpdateFamilyExpence
        const expense = Math.max(updateFamilyExpenceCommand.balanceJpy - family.children.reduce((h, c) => h + c.params.baseExpence, 0), 0)
        for (const adult of family.adults) {
          adult.params.baseExpence = Math.ceil(expense / family.adults.length)
        }
        break;
      case "updateFamilyPension":
        const updateFamilyPensionCommand = systemCommand as SystemCommandUpdateFamilyPension
        const pension = Math.max(updateFamilyPensionCommand.balanceJpy, 0)
        for (const adult of family.adults) {
          adult.params.baseExpence = Math.ceil(pension / family.adults.length)
        }
        break;
    }
  }
  return newFamily;
}

const getFamilyCondition = (family: Family): [string, string] => {
  if (family.adults.length == 0) {
    return ['', '']
  }
  const ret: string[] = []
    ret.push(`■ 家族状況`)
  for (const adult of family.adults) {
    ret.push(`・${adult.name}(${adult.age}歳) ご年収 ${adult.params.currentIncome}万円`)
  }
  for (const child of family.children) {
    ret.push(`・${child.name}(${child.age}歳)`)
  }
    ret.push(``)
    ret.push(`■ 資産状況`)
  for (const asset of family.assets) {
    ret.push(`・${asset.name} 現在 ${asset.cashFlows[START_YEAR] || 0}万円`)
  }

  const familyCashFlow = calcFamilyCashFlow(family)
  calcAssetMigratedCashFlow(family.assets, familyCashFlow)
  const totals = YEARS.map(y => totalAssets(y, family))
  const minusYearIndex = totals.findIndex(t => t < 0);
  if (minusYearIndex >= 0) {
    ret.push(``)
    ret.push(`■ 将来、ご家族の資産推移がマイナスになる年`)
    ret.push(`現在のシミュレーションでは、このご家族は${YEARS[minusYearIndex]}年に資産がマイナスとなってしまいます。`)
    ret.push(`生活費を節約したり資産運用を行うなどの行動を取る必要があると思われます`)
    return [ret.join("\n"), '今後のご家族の資産推移のシミュレーション結果を踏まえて、ファイナンシャルプランナーとしてアドバイスがあれば伝えてください。']
  }
  return [ret.join("\n"), '']
}