import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, Sparkles, X, Minimize2, Maximize2, MessageCircle, Bot } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Streamdown } from "streamdown";
import { useI18n } from "@/contexts/I18nContext";

/**
 * Message type for chat
 */
export type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type AIChatWindowProps = {
  /**
   * Callback when user sends a message
   */
  onSendMessage?: (content: string) => Promise<string>;

  /**
   * Custom className for the container
   */
  className?: string;
};

/**
 * A floating AI chat window component with modern design.
 * Now manages its own open/close state internally.
 */
export function AIChatWindow({
  onSendMessage,
  className,
}: AIChatWindowProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    t('chat.suggestedPrompts.createInstance'),
    t('chat.suggestedPrompts.installSkill'),
    t('chat.suggestedPrompts.configureChannel'),
    t('chat.suggestedPrompts.troubleshoot'),
  ];

  // Filter out system messages for display
  const displayMessages = messages.filter((msg) => msg.role !== "system");

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // If onSendMessage is provided, use it; otherwise simulate a response
      let response: string;
      if (onSendMessage) {
        response = await onSendMessage(content);
      } else {
        // Simulated response for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = getSimulatedResponse(content);
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  // Simulated responses for demo purposes
  const getSimulatedResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('instance') || lowerQuestion.includes('实例')) {
      return `To create a new instance:

1. Navigate to the **Instances** page
2. Click the **Create Instance** button
3. Fill in the required fields:
   - Instance name
   - LLM provider and API key
   - At least one channel (Telegram, Discord, Slack, or Matrix)
4. Click **Create** to deploy your instance

Your instance will start automatically after creation.`;
    }
    
    if (lowerQuestion.includes('skill') || lowerQuestion.includes('技能')) {
      return `To install a skill:

1. Go to the **Skills** page
2. Browse or search for the skill you want
3. Click the **Install** button on the skill card
4. Select the target instance
5. Confirm the installation

The skill will be automatically deployed to your instance's skills directory.`;
    }
    
    if (lowerQuestion.includes('channel') || lowerQuestion.includes('频道')) {
      return `OpenClaw Cloud supports multiple channels:

- **Telegram**: Requires bot token and optional chat ID
- **Discord**: Requires bot token, optional guild and channel IDs
- **Slack**: Requires bot token and app token
- **Matrix**: Requires homeserver URL, access token, and DM policy

Configure at least one channel when creating an instance.`;
    }
    
    return `I'm here to help you with OpenClaw Cloud! You can ask me about:

- Creating and managing instances
- Installing and configuring skills
- Setting up channels (Telegram, Discord, Slack, Matrix)
- Plugin management
- Troubleshooting common issues

What would you like to know?`;
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "absolute bottom-16 right-0 bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200",
            isMaximized 
              ? "w-[600px] h-[700px]" 
              : "w-[400px] h-[500px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl brand-gradient flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t('chat.title')}</h3>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "Thinking..." : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMaximized(!isMaximized)}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
            {displayMessages.length === 0 ? (
              <div className="flex h-full flex-col p-4">
                <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-2xl brand-gradient flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-center">{t('chat.emptyState')}</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(prompt)}
                        disabled={isLoading}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="flex flex-col space-y-4 p-4">
                  {displayMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user"
                          ? "justify-end items-start"
                          : "justify-start items-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 shrink-0 mt-1 rounded-xl brand-gradient flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <Streamdown>{message.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </p>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="h-8 w-8 shrink-0 mt-1 rounded-xl bg-secondary flex items-center justify-center">
                          <User className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 shrink-0 mt-1 rounded-xl brand-gradient flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t bg-background/50"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="flex-1 max-h-24 resize-none min-h-10 rounded-xl"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-10 w-10 rounded-xl brand-gradient hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "h-14 w-14 rounded-full brand-gradient shadow-lg flex items-center justify-center transition-all primary-glow hover:scale-105 active:scale-95"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}
