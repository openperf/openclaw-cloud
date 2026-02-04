import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { Play, Plus, Square, Trash2, Pencil, Server, Cpu, Radio, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Instances() {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: instances, isLoading } = trpc.instances.list.useQuery();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<any>(null);
  
  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // Model configuration
  const [provider, setProvider] = useState<"openai" | "anthropic" | "ollama" | "openrouter" | "litellm" | "custom">("openai");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  
  // Channel configuration
  const [enableTelegram, setEnableTelegram] = useState(false);
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  
  const [enableDiscord, setEnableDiscord] = useState(false);
  const [discordToken, setDiscordToken] = useState("");
  const [discordGuildId, setDiscordGuildId] = useState("");
  const [discordChannelId, setDiscordChannelId] = useState("");
  
  const [enableSlack, setEnableSlack] = useState(false);
  const [slackBotToken, setSlackBotToken] = useState("");
  const [slackAppToken, setSlackAppToken] = useState("");
  
  const [enableMatrix, setEnableMatrix] = useState(false);
  const [matrixHomeserver, setMatrixHomeserver] = useState("");
  const [matrixAccessToken, setMatrixAccessToken] = useState("");
  const [matrixRoomId, setMatrixRoomId] = useState("");
  const [matrixDmPolicy, setMatrixDmPolicy] = useState<"pairing" | "open" | "allowlist" | "disabled">("pairing");

  // Model options based on provider
  const getModelOptions = () => {
    switch (provider) {
      case "openai":
        return ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];
      case "anthropic":
        return ["claude-opus-4-5", "claude-sonnet-4", "claude-haiku-4"];
      case "ollama":
        return ["llama3.3", "qwen2.5", "deepseek-r1"];
      case "openrouter":
        return [
          "openrouter/anthropic/claude-opus-4.5",
          "openrouter/anthropic/claude-sonnet-4.5",
          "openrouter/anthropic/claude-haiku-4.5",
          "openrouter/anthropic/claude-sonnet-4",
          "openrouter/openai/gpt-4o",
          "openrouter/openai/gpt-4-turbo",
        ];
      case "litellm":
        return ["gpt-4o", "claude-opus-4-5", "custom"];
      case "custom":
        return [];
      default:
        return [];
    }
  };

  const createMutation = trpc.instances.create.useMutation({
    onSuccess: () => {
      utils.instances.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const updateMutation = trpc.instances.update.useMutation({
    onSuccess: () => {
      utils.instances.list.invalidate();
      setEditOpen(false);
      setEditingInstance(null);
      resetForm();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const deleteMutation = trpc.instances.delete.useMutation({
    onSuccess: () => {
      utils.instances.list.invalidate();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const startMutation = trpc.instances.start.useMutation({
    onSuccess: () => {
      utils.instances.list.invalidate();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const stopMutation = trpc.instances.stop.useMutation({
    onSuccess: () => {
      utils.instances.list.invalidate();
      toast.success(t('common.success'));
    },
    onError: (error) => {
      toast.error(`${t('common.error')}: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setProvider("openai");
    setModel("");
    setApiKey("");
    setBaseUrl("");
    setEnableTelegram(false);
    setTelegramToken("");
    setTelegramChatId("");
    setEnableDiscord(false);
    setDiscordToken("");
    setDiscordGuildId("");
    setDiscordChannelId("");
    setEnableSlack(false);
    setSlackBotToken("");
    setSlackAppToken("");
    setEnableMatrix(false);
    setMatrixHomeserver("");
    setMatrixAccessToken("");
    setMatrixRoomId("");
    setMatrixDmPolicy("pairing");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error(t('instances.instanceName') + " " + t('common.error'));
      return;
    }
    if (!apiKey.trim()) {
      toast.error(t('instances.apiKey') + " " + t('common.error'));
      return;
    }
    if (!enableTelegram && !enableDiscord && !enableSlack && !enableMatrix) {
      toast.error(t('instances.enableChannel'));
      return;
    }

    createMutation.mutate({
      name,
      description,
      llmProvider: provider,
      llmApiKey: apiKey,
      llmModel: model || getModelOptions()[0],
      config: {
        provider,
        model: model || getModelOptions()[0],
        apiKey,
        baseUrl: provider === "custom" ? baseUrl : undefined,
        telegram: enableTelegram ? {
          botToken: telegramToken,
          chatId: telegramChatId || undefined,
        } : undefined,
        discord: enableDiscord ? {
          token: discordToken,
          guildId: discordGuildId || undefined,
          channelId: discordChannelId || undefined,
        } : undefined,
        slack: enableSlack ? {
          botToken: slackBotToken,
          appToken: slackAppToken,
        } : undefined,
        matrix: enableMatrix ? {
          homeserverUrl: matrixHomeserver,
          accessToken: matrixAccessToken,
          roomId: matrixRoomId || undefined,
          dmPolicy: matrixDmPolicy,
        } : undefined,
      },
    });
  };

  const handleEdit = (instance: any) => {
    setEditingInstance(instance);
    setName(instance.name);
    setDescription(instance.description || "");
    
    const config = instance.config as any;
    if (config) {
      setProvider(config.provider || "openai");
      setModel(config.model || "");
      setApiKey(instance.llmApiKey || config.apiKey || "");
      setBaseUrl(config.baseUrl || "");
      
      if (config.telegram) {
        setEnableTelegram(true);
        setTelegramToken(config.telegram.botToken || "");
        setTelegramChatId(config.telegram.chatId || "");
      }
      if (config.discord) {
        setEnableDiscord(true);
        setDiscordToken(config.discord.token || "");
        setDiscordGuildId(config.discord.guildId || "");
        setDiscordChannelId(config.discord.channelId || "");
      }
      if (config.slack) {
        setEnableSlack(true);
        setSlackBotToken(config.slack.botToken || "");
        setSlackAppToken(config.slack.appToken || "");
      }
      if (config.matrix) {
        setEnableMatrix(true);
        setMatrixHomeserver(config.matrix.homeserverUrl || "");
        setMatrixAccessToken(config.matrix.accessToken || "");
        setMatrixRoomId(config.matrix.roomId || "");
        setMatrixDmPolicy(config.matrix.dmPolicy || "pairing");
      }
    }
    
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingInstance) return;
    if (!name.trim()) {
      toast.error(t('instances.instanceName') + " " + t('common.error'));
      return;
    }

    updateMutation.mutate({
      id: editingInstance.id,
      name,
      description,
      llmProvider: provider,
      llmApiKey: apiKey,
      llmModel: model || getModelOptions()[0],
      config: {
        provider,
        model: model || getModelOptions()[0],
        apiKey,
        baseUrl: provider === "custom" ? baseUrl : undefined,
        telegram: enableTelegram ? {
          botToken: telegramToken,
          chatId: telegramChatId || undefined,
        } : undefined,
        discord: enableDiscord ? {
          token: discordToken,
          guildId: discordGuildId || undefined,
          channelId: discordChannelId || undefined,
        } : undefined,
        slack: enableSlack ? {
          botToken: slackBotToken,
          appToken: slackAppToken,
        } : undefined,
        matrix: enableMatrix ? {
          homeserverUrl: matrixHomeserver,
          accessToken: matrixAccessToken,
          roomId: matrixRoomId || undefined,
          dmPolicy: matrixDmPolicy,
        } : undefined,
      },
    });
  };

  const handleStart = (id: number) => {
    startMutation.mutate({ id });
  };

  const handleStop = (id: number) => {
    stopMutation.mutate({ id });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm') + "?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "running":
        return { text: t('instances.running'), color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" };
      case "stopped":
        return { text: t('instances.stopped'), color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-500/10" };
      case "error":
        return { text: t('instances.error'), color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" };
      default:
        return { text: status, color: "text-gray-600", bg: "bg-gray-500/10" };
    }
  };

  // Form dialog content (reusable for create and edit)
  const FormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6 py-4">
      {/* Basic Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          {t('instances.basicConfig')}
        </h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-name" : "name"}>{t('instances.instanceName')} *</Label>
            <Input
              id={isEdit ? "edit-name" : "name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('instances.instanceNamePlaceholder')}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-description" : "description"}>{t('instances.descriptionLabel')}</Label>
            <Textarea
              id={isEdit ? "edit-description" : "description"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('instances.descriptionPlaceholder')}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Model Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          {t('instances.llmConfig')}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-provider" : "provider"}>{t('instances.provider')} *</Label>
            <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="litellm">LiteLLM</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {getModelOptions().length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={isEdit ? "edit-model" : "model"}>{t('instances.model')}</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t('skills.selectInstancePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {getModelOptions().map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-apiKey" : "apiKey"}>{t('instances.apiKey')} *</Label>
          <Input
            id={isEdit ? "edit-apiKey" : "apiKey"}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('instances.apiKeyPlaceholder')}
            className="h-10"
          />
        </div>

        {provider === "custom" && (
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-baseUrl" : "baseUrl"}>{t('instances.baseUrl')} *</Label>
            <Input
              id={isEdit ? "edit-baseUrl" : "baseUrl"}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={t('instances.baseUrlPlaceholder')}
              className="h-10"
            />
          </div>
        )}
      </div>

      {/* Channel Configuration */}
      <div className="space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          {t('instances.channelConfig')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('instances.enableChannel')}
        </p>

        {/* Telegram */}
        <div className="space-y-3 border rounded-xl p-4 bg-card/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="telegram"
              checked={enableTelegram}
              onCheckedChange={(checked) => setEnableTelegram(checked as boolean)}
            />
            <Label htmlFor="telegram" className="font-medium cursor-pointer">
              Telegram
            </Label>
          </div>
          {enableTelegram && (
            <div className="space-y-3 ml-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="telegramToken">{t('instances.botToken')} *</Label>
                <Input
                  id="telegramToken"
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramChatId">{t('instances.chatId')}</Label>
                <Input
                  id="telegramChatId"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="123456789"
                  className="h-10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Discord */}
        <div className="space-y-3 border rounded-xl p-4 bg-card/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="discord"
              checked={enableDiscord}
              onCheckedChange={(checked) => setEnableDiscord(checked as boolean)}
            />
            <Label htmlFor="discord" className="font-medium cursor-pointer">
              Discord
            </Label>
          </div>
          {enableDiscord && (
            <div className="space-y-3 ml-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="discordToken">{t('instances.botToken')} *</Label>
                <Input
                  id="discordToken"
                  type="password"
                  value={discordToken}
                  onChange={(e) => setDiscordToken(e.target.value)}
                  placeholder="Your Discord bot token"
                  className="h-10"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="discordGuildId">{t('instances.guildId')}</Label>
                  <Input
                    id="discordGuildId"
                    value={discordGuildId}
                    onChange={(e) => setDiscordGuildId(e.target.value)}
                    placeholder="123456789012345678"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discordChannelId">{t('instances.channelId')}</Label>
                  <Input
                    id="discordChannelId"
                    value={discordChannelId}
                    onChange={(e) => setDiscordChannelId(e.target.value)}
                    placeholder="123456789012345678"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slack */}
        <div className="space-y-3 border rounded-xl p-4 bg-card/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="slack"
              checked={enableSlack}
              onCheckedChange={(checked) => setEnableSlack(checked as boolean)}
            />
            <Label htmlFor="slack" className="font-medium cursor-pointer">
              Slack
            </Label>
          </div>
          {enableSlack && (
            <div className="space-y-3 ml-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="slackBotToken">{t('instances.botToken')} *</Label>
                <Input
                  id="slackBotToken"
                  type="password"
                  value={slackBotToken}
                  onChange={(e) => setSlackBotToken(e.target.value)}
                  placeholder="xoxb-..."
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slackAppToken">App Token *</Label>
                <Input
                  id="slackAppToken"
                  type="password"
                  value={slackAppToken}
                  onChange={(e) => setSlackAppToken(e.target.value)}
                  placeholder="xapp-..."
                  className="h-10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Matrix */}
        <div className="space-y-3 border rounded-xl p-4 bg-card/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="matrix"
              checked={enableMatrix}
              onCheckedChange={(checked) => setEnableMatrix(checked as boolean)}
            />
            <Label htmlFor="matrix" className="font-medium cursor-pointer">
              Matrix
            </Label>
          </div>
          {enableMatrix && (
            <div className="space-y-3 ml-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="matrixHomeserver">{t('instances.homeserverUrl')} *</Label>
                <Input
                  id="matrixHomeserver"
                  value={matrixHomeserver}
                  onChange={(e) => setMatrixHomeserver(e.target.value)}
                  placeholder="https://matrix.org"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matrixAccessToken">{t('instances.accessToken')} *</Label>
                <Input
                  id="matrixAccessToken"
                  type="password"
                  value={matrixAccessToken}
                  onChange={(e) => setMatrixAccessToken(e.target.value)}
                  placeholder="Your Matrix access token"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matrixRoomId">{t('instances.roomId')}</Label>
                <Input
                  id="matrixRoomId"
                  value={matrixRoomId}
                  onChange={(e) => setMatrixRoomId(e.target.value)}
                  placeholder="!roomid:matrix.org"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matrixDmPolicy">{t('instances.dmPolicy')}</Label>
                <Select value={matrixDmPolicy} onValueChange={(value: any) => setMatrixDmPolicy(value)}>
                  <SelectTrigger id="matrixDmPolicy" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pairing">{t('instances.dmPolicyPairing')}</SelectItem>
                    <SelectItem value="open">{t('instances.dmPolicyOpen')}</SelectItem>
                    <SelectItem value="allowlist">{t('instances.dmPolicyAllowlist')}</SelectItem>
                    <SelectItem value="disabled">{t('instances.dmPolicyDisabled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('instances.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('instances.description')}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('instances.createInstance')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('instances.createInstanceTitle')}</DialogTitle>
                <DialogDescription>
                  {t('instances.createInstanceDesc')}
                </DialogDescription>
              </DialogHeader>
              <FormContent />
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('instances.creating') : t('common.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Instance Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('instances.editInstance')}</DialogTitle>
                <DialogDescription>
                  {t('instances.editInstanceDesc')}
                </DialogDescription>
              </DialogHeader>
              <FormContent isEdit />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditOpen(false); resetForm(); }}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('instances.updating') : t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {instances && instances.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Server className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4 text-center">
                {t('instances.noInstancesYet')}
              </p>
              <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('instances.createInstance')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {instances?.map((instance) => {
              const status = getStatusDisplay(instance.status);
              return (
                <Card key={instance.id} className="hover-lift overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${status.bg} flex items-center justify-center`}>
                          <Server className={`h-5 w-5 ${status.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{instance.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {instance.description || t('dashboard.noDescription')}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className={`font-medium ${status.color} flex items-center gap-1.5`}>
                          <span className={`h-2 w-2 rounded-full ${instance.status === "running" ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                          {status.text}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {instance.status === "running" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStop(instance.id)}
                              disabled={stopMutation.isPending}
                              className="flex-1"
                            >
                              <Square className="mr-1.5 h-3.5 w-3.5" />
                              {stopMutation.isPending ? t('instances.stopping') : t('instances.stop')}
                            </Button>
                            <Link href="/chat">
                              <Button size="sm" variant="default" className="gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {t('nav.chat')}
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleStart(instance.id)}
                            disabled={startMutation.isPending}
                            className="flex-1"
                          >
                            <Play className="mr-1.5 h-3.5 w-3.5" />
                            {startMutation.isPending ? t('instances.starting') : t('instances.start')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(instance)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(instance.id)}
                          disabled={deleteMutation.isPending}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
