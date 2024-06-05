
import { createContext, useCallback, useState } from 'react';
import {ChatMessages} from "@/app/lib/chat";

type ChatMessagesContext = {
  chatMessages: ChatMessages;
  setChatMessages: (chatMessages: ChatMessages) => void;
};

const defaultContext: ChatMessagesContext = {
  chatMessages: [],
  setChatMessages: () => {},
};

export const chatMessagesContext = createContext<ChatMessagesContext>(defaultContext);

export const useChatMessages = (): ChatMessagesContext => {
  const [chatMessages, setChatMessagesState] = useState<ChatMessages>(defaultContext.chatMessages);
  const setChatMessages = useCallback((current: ChatMessages): void => {
    setChatMessagesState(current);
  }, []);
  return {
    chatMessages,
    setChatMessages,
  };
};