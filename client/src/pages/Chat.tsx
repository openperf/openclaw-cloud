import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Settings2, 
  Trash2, 
  Copy, 
  Check,
  MessageSquare,
  Zap,
  BookOpen,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.min.css";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  instanceId: number;
  messages: Message[];
  title: string;
  createdAt: Date;
}

export default function Chat() {
  const { t } = useI18n();
  const { data: instances } = trpc.instances.list.useQuery();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

  // 获取运行中的实例
  const runningInstances = instances?.filter(i => i.status === "running") || [];

  // 发送消息到 OpenClaw 实例
  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedInstanceId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // 创建助手消息占位符
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const instance = instances?.find(i => i.id.toString() === selectedInstanceId);
      if (!instance || !instance.port) {
        throw new Error(t('chat.noInstanceSelected'));
      }

      // 调用 OpenClaw Gateway API
      // OpenClaw Gateway 使用 POST /api/chat 端点
      const response = await fetch(`/api/chat/${selectedInstanceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 更新助手消息
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: data.response || data.message || t('chat.noResponse'), isStreaming: false }
          : m
      ));
    } catch (error: any) {
      console.error("Chat error:", error);
      // 更新为错误消息
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: `${t('chat.error')}: ${error.message}`, isStreaming: false }
          : m
      ));
      toast.error(error.message || t('chat.sendFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 复制消息内容
  const copyMessage = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error(t('chat.copyFailed'));
    }
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
  };

  // 快捷提示
  const quickPrompts = [
    { icon: Zap, text: t('chat.quickPrompts.createInstance'), prompt: t('chat.quickPrompts.createInstancePrompt') },
    { icon: BookOpen, text: t('chat.quickPrompts.installSkill'), prompt: t('chat.quickPrompts.installSkillPrompt') },
    { icon: Settings2, text: t('chat.quickPrompts.configureChannel'), prompt: t('chat.quickPrompts.configureChannelPrompt') },
    { icon: HelpCircle, text: t('chat.quickPrompts.troubleshoot'), prompt: t('chat.quickPrompts.troubleshootPrompt') },
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t('chat.title')}</h1>
                <p className="text-xs text-muted-foreground">{t('chat.subtitle')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 实例选择器 */}
            <Select value={selectedInstanceId} onValueChange={setSelectedInstanceId}>
              <SelectTrigger className="w-[240px] bg-background/50 backdrop-blur-sm border-border/50">
                <SelectValue placeholder={t('chat.selectInstance')} />
              </SelectTrigger>
              <SelectContent>
                {runningInstances.length > 0 ? (
                  runningInstances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        {instance.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {t('chat.noRunningInstances')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* 清空按钮 */}
            {messages.length > 0 && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={clearChat}
                className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin">
          {messages.length === 0 ? (
            /* 空状态 - 欢迎界面 */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-primary/30">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('chat.welcomeTitle')}</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                {t('chat.welcomeDescription')}
              </p>
              
              {/* 快捷提示卡片 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {quickPrompts.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    disabled={!selectedInstanceId}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/30 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </button>
                ))}
              </div>

              {!selectedInstanceId && runningInstances.length > 0 && (
                <p className="text-sm text-amber-500 mt-6 flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  {t('chat.selectInstanceHint')}
                </p>
              )}

              {runningInstances.length === 0 && (
                <p className="text-sm text-amber-500 mt-6 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  {t('chat.noRunningInstancesHint')}
                </p>
              )}
            </div>
          ) : (
            /* 消息列表 */
            <div className="space-y-6 px-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* 头像 */}
                  <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${
                    message.role === "user" 
                      ? "bg-gradient-to-br from-violet-500 to-purple-500 shadow-violet-500/20" 
                      : "bg-gradient-to-br from-primary to-rose-500 shadow-primary/20"
                  }`}>
                    {message.role === "user" ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-2xl px-5 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20"
                        : "bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
                    }`}>
                      {message.isStreaming ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{t('chat.thinking')}</span>
                        </div>
                      ) : message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>

                    {/* 消息操作 */}
                    {!message.isStreaming && message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => copyMessage(message.id, message.content)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3 w-3" />
                              {t('chat.copied')}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              {t('chat.copy')}
                            </>
                          )}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="pt-4 border-t border-border/50">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedInstanceId ? t('chat.inputPlaceholder') : t('chat.selectInstanceFirst')}
              disabled={!selectedInstanceId || isLoading}
              className="min-h-[56px] max-h-[200px] pr-14 resize-none bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || !selectedInstanceId || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-rose-500 hover:from-primary/90 hover:to-rose-600 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t('chat.disclaimer')}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
