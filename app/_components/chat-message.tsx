import {ChatMessage, ChatMessages} from "@/app/lib/chat";
import {chatMessagesContext} from "@/app/privoders/chat-messages";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Textarea} from "@chakra-ui/react";
import {chatMessage, firstMessage} from "@/app/lib/llm";
import {familyContext} from "@/app/privoders/family";
import {Family} from "@/app/lib/type";
import {
  createFlatCostCashFlows,
  createLifeCostCashFlows,
  createPensionCashFlows,
  createSalaryCashFlows
} from "@/app/lib/query";


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
    const llmMessage = await chatMessage(textAreaRef.current!.value)
    const [systemCommands, userMessae] = findSystemCommand(llmMessage)
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
    setChatMessages([{
      speaker: 'ファイナンシャルプランナー',
      message: firstMessage,
    }])
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Chat</h2>
      </div>
      <div className="mt-4 flex-1 overflow-y-auto">
        <div className="grid gap-4">
          <ChatMessagesComponent chatMessages={chatMessages}/>
        </div>
        <div className="mt-4 border-t pt-4">
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
    </>
  )
}

type SystemCommand = {
  command: string;
}

const findSystemCommand = (llmMessage: string): [SystemCommand[], string] => {
  const regex = /```json\s*({[\s\S]*?})\s*```/g;

  let userMessage = llmMessage
  const systemCommands: SystemCommand[] = []
  const matches = llmMessage.match(regex);
  for (const match of (matches || [])) {
    userMessage = userMessage.replace(match, "")
    const js = match.replace("```json", "").replace("```", "")
    console.log(match, js)
    systemCommands.push(JSON.parse(js))
  }
  return [systemCommands, userMessage]
}

const execSystemCommands = (systemCommands: SystemCommand[], family: Family): Family | undefined => {
  const newFamily = {...family}
  for (const systemCommand of systemCommands) {
    switch (systemCommand.command) {
      case "create_adult":
        const c = systemCommand as any
        const age = c.age as number
        const income = c.income_per_year as number
        newFamily.user = {
          id: "user",
          age: age,
          retireAge: 65,
          lifeEvents: [
            {
              name: 'サラリー',
              cashFlows: createSalaryCashFlows(age, 65, income)
            },
            {
              name: '年金',
              cashFlows: createPensionCashFlows(age, 65, 7)
            },
            {
              name: '生活費',
              cashFlows: createLifeCostCashFlows(age, 65, 20)
            },
          ],
        }
        break;
      case "create_child":
        const c2= systemCommand as any
        const age2 = c2.age as number
        newFamily.children.push({
          id: `child${newFamily.children.length + 1}`,
          age: age2,
          lifeEvents: [
            {
              name: '生活費',
              cashFlows: createFlatCostCashFlows(age2, age2, 22, 10)
            },
            {
              name: '高校',
              cashFlows: createFlatCostCashFlows(age2, 15, 17, 5)
            },
            {
              name: '大学',
              cashFlows: createFlatCostCashFlows(age2, 18, 22, 15)
            },
          ],
        })
        break;
    }
  }
  return newFamily;
}
