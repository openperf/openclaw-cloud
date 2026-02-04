import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const newValue = !prev;
      console.log('[ChatContext] toggle called, new isOpen:', newValue);
      return newValue;
    });
  }, []);

  const handleSetIsOpen = useCallback((open: boolean) => {
    console.log('[ChatContext] setIsOpen called:', open);
    setIsOpen(open);
  }, []);

  return (
    <ChatContext.Provider value={{ isOpen, setIsOpen: handleSetIsOpen, toggle }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
