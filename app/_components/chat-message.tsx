import {ChatMessage, ChatMessages} from "@/app/lib/chat";
import {chatMessagesContext} from "@/app/privoders/chat-messages";
import {useCallback, useContext, useRef, useState} from "react";
import {Textarea} from "@chakra-ui/react";


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
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const {chatMessages, setChatMessages} = useContext(chatMessagesContext);
  const addChatMessage = useCallback((text: string) => {
    const newChatMessages = [...chatMessages]
    newChatMessages.push({
      speaker: 'you',
      message: text,
    })
    setChatMessages(newChatMessages)
  }, [chatMessages, setChatMessages])

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
          <Textarea
            ref={textAreaRef}
            placeholder="Type your message..."
            className="w-full resize-none rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addChatMessage(textAreaRef.current!.value)
                textAreaRef.current!.value = ""
                e.preventDefault()
                return false
              }
            }}
          />
        </div>
      </div>
    </>
  )
}
