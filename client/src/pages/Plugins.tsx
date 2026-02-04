import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { 
  Download, 
  Server, 
  Play, 
  Square, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  UserPlus,
  Copy,
  Database,
  Zap,
  HardDrive,
  Globe,
  AlertCircle,
  Settings,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { useState, useCallback } from "react";

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Server,
  Database,
  Zap,
  HardDrive,
  Globe,
};

// 插件定义类型
interface PluginConfigField {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "password";
  required?: boolean;
  default?: string | number | boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
}

interface PluginDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: string;
  version: string;
  author: string;
  icon: string;
  dockerImage: string;
  dockerTag: string;
  defaultPort: number;
  containerPort: number;
  dataVolume: string;
  envTemplate: Record<string, string>;
  configFields: PluginConfigField[];
  healthCheck?: {
    endpoint?: string;
    interval?: number;
  };
  documentation?: string;
}

// 单个插件卡片组件
function PluginCard({ 
  definition, 
  isDockerAvailable,
}: { 
  definition: PluginDefinition;
  isDockerAvailable: boolean;
}) {
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false);
  const [pluginId, setPluginId] = useState<number | null>(null);
  
  // 动态配置表单状态
  const [config, setConfig] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    definition.configFields.forEach(field => {
      initial[field.name] = field.default ?? (field.type === "boolean" ? false : "");
    });
    return initial;
  });
  
  // 管理员表单（仅 Synapse）
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });

  // 手动获取状态（点击刷新时）
  const [containerStatus, setContainerStatus] = useState<string>("not_installed");
  const [containerConfig, setContainerConfig] = useState<any>(null);
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // 使用 trpc utils 进行手动查询
  const utils = trpc.useUtils();

  // 手动刷新状态
  const refreshStatus = useCallback(async () => {
    if (!isDockerAvailable || !pluginId) return;
    
    setIsLoading(true);
    try {
      const status = await utils.plugins.container.status.fetch({ 
        pluginId, 
        definitionId: definition.id 
      });
      setContainerStatus(status.status || "not_installed");
      
      const configResult = await utils.plugins.container.getConfig.fetch({ pluginId });
      if (configResult.success) {
        setContainerConfig(configResult.config);
      }
    } catch (e) {
      console.error("Failed to fetch status:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isDockerAvailable, pluginId, definition.id, utils]);

  // 获取日志
  const fetchLogs = useCallback(async () => {
    if (!isDockerAvailable || !pluginId) return;
    
    try {
      const logsResult = await utils.plugins.container.logs.fetch({ 
        pluginId, 
        definitionId: definition.id,
        tail: 200 
      });
      if (logsResult.success) {
        setLogs(logsResult.logs || "");
      }
    } catch (e) {
      console.error("Failed to fetch logs:", e);
    }
  }, [isDockerAvailable, pluginId, definition.id, utils]);

  // Mutations
  const installMutation = trpc.plugins.container.install.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`${definition.displayName} 安装成功！`);
        setInstallDialogOpen(false);
        if (result.pluginId) {
          setPluginId(result.pluginId);
        }
        setContainerStatus("running");
      } else {
        toast.error(`安装失败: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(`安装失败: ${error.message}`);
    },
  });

  const startMutation = trpc.plugins.container.start.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`${definition.displayName} 已启动`);
        setContainerStatus("running");
      } else {
        toast.error(`启动失败: ${result.error}`);
      }
    },
  });

  const stopMutation = trpc.plugins.container.stop.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`${definition.displayName} 已停止`);
        setContainerStatus("stopped");
      } else {
        toast.error(`停止失败: ${result.error}`);
      }
    },
  });

  const uninstallMutation = trpc.plugins.container.uninstall.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`${definition.displayName} 已卸载`);
        setContainerStatus("not_installed");
        setPluginId(null);
        setContainerConfig(null);
      } else {
        toast.error(`卸载失败: ${result.error}`);
      }
    },
  });

  // Synapse 特有：创建管理员
  const createAdminMutation = trpc.plugins.synapse.createAdmin.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("管理员用户创建成功！");
        setCreateAdminDialogOpen(false);
        setAdminForm({ username: "", password: "" });
      } else {
        toast.error(`创建失败: ${result.error}`);
      }
    },
  });

  const handleInstall = () => {
    installMutation.mutate({
      pluginId: 0, // 后端会创建新的插件记录
      definitionId: definition.id,
      config,
    });
  };

  const handleCreateAdmin = () => {
    if (!pluginId) return;
    if (adminForm.username.length < 1) {
      toast.error("请输入用户名");
      return;
    }
    if (adminForm.password.length < 8) {
      toast.error("密码至少需要 8 个字符");
      return;
    }
    createAdminMutation.mutate({
      pluginId,
      username: adminForm.username,
      password: adminForm.password,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  // 状态判断
  const isInstalled = containerStatus !== "not_installed";
  const isRunning = containerStatus === "running";
  const isPending = installMutation.isPending || startMutation.isPending || stopMutation.isPending || uninstallMutation.isPending;

  const IconComponent = iconMap[definition.icon] || Server;

  // 状态徽章
  const getStatusBadge = () => {
    if (!isDockerAvailable) {
      return (
        <Badge variant="secondary" className="text-xs">
          未安装
        </Badge>
      );
    }
    
    switch (containerStatus) {
      case "running":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            运行中
          </Badge>
        );
      case "stopped":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
            <Square className="h-3 w-3 mr-1" />
            已停止
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            错误
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            未安装
          </Badge>
        );
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shrink-0">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{definition.displayName}</CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription className="text-xs mt-1 line-clamp-2">
              {definition.description}
            </CardDescription>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>v{definition.version}</span>
              <span>•</span>
              <span>{definition.author}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {!isInstalled ? (
          /* 未安装状态 */
          <div className="space-y-3">
            {!isDockerAvailable && (
              <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-2 text-xs">
                <div className="flex items-center gap-1.5 text-yellow-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Docker 不可用，请先安装 Docker</span>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => setInstallDialogOpen(true)}
              disabled={!isDockerAvailable || isPending}
              className="w-full"
              size="sm"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              安装
            </Button>
          </div>
        ) : (
          /* 已安装状态 */
          <div className="space-y-3">
            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2">
              {isRunning ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pluginId && stopMutation.mutate({ pluginId, definitionId: definition.id })}
                  disabled={isPending}
                >
                  {stopMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Square className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  停止
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pluginId && startMutation.mutate({ pluginId, definitionId: definition.id })}
                  disabled={isPending}
                >
                  {startMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  启动
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                刷新
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLogs(!showLogs);
                  if (!showLogs) fetchLogs();
                }}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                日志
              </Button>
              
              {/* Synapse 特有：创建管理员 */}
              {definition.id === "synapse" && isRunning && (
                <Button variant="outline" size="sm" onClick={() => setCreateAdminDialogOpen(true)}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  管理员
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    卸载
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认卸载</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要卸载 {definition.displayName} 吗？此操作将停止并删除容器。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => pluginId && uninstallMutation.mutate({ 
                        pluginId, 
                        definitionId: definition.id,
                        removeData: false 
                      })}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      卸载
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            {/* 连接信息 */}
            {containerConfig && (
              <div className="rounded-md border p-3 space-y-2">
                <h4 className="font-medium text-xs flex items-center gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  连接信息
                </h4>
                <div className="grid gap-1.5 text-xs">
                  {definition.id === "synapse" && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Homeserver</span>
                      <div className="flex items-center gap-1">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          http://localhost:{containerConfig.hostPort}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(`http://localhost:${containerConfig.hostPort}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">端口</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      {containerConfig.hostPort}
                    </code>
                  </div>
                </div>
              </div>
            )}
            
            {/* 日志区域 */}
            {showLogs && (
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-xs">容器日志</h4>
                  <Button variant="ghost" size="sm" onClick={fetchLogs} className="h-6 px-2 text-xs">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    刷新
                  </Button>
                </div>
                <ScrollArea className="h-40">
                  {logs ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                      {logs}
                    </pre>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-xs">
                      暂无日志
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* 安装对话框 */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-primary" />
              安装 {definition.displayName}
            </DialogTitle>
            <DialogDescription>
              {definition.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {definition.configFields.map((field) => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name} className="text-sm">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === "boolean" ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      id={field.name}
                      checked={config[field.name] || false}
                      onCheckedChange={(checked) => setConfig({ ...config, [field.name]: checked })}
                    />
                    {field.description && (
                      <span className="text-xs text-muted-foreground">{field.description}</span>
                    )}
                  </div>
                ) : field.type === "number" ? (
                  <Input
                    id={field.name}
                    type="number"
                    value={config[field.name] || ""}
                    onChange={(e) => setConfig({ ...config, [field.name]: parseInt(e.target.value) || 0 })}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === "password" ? "password" : "text"}
                    value={config[field.name] || ""}
                    onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
                {field.description && field.type !== "boolean" && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleInstall} disabled={installMutation.isPending}>
              {installMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              安装
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 创建管理员对话框 */}
      <Dialog open={createAdminDialogOpen} onOpenChange={setCreateAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建管理员用户</DialogTitle>
            <DialogDescription>
              为 Matrix Synapse 创建一个管理员用户
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-username">用户名</Label>
              <Input
                id="admin-username"
                value={adminForm.username}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                placeholder="admin"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-password">密码</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                placeholder="至少 8 个字符"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAdminDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateAdmin} disabled={createAdminMutation.isPending}>
              {createAdminMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function Plugins() {
  const { t } = useI18n();
  
  // 获取插件注册表 - 只查询一次
  const { data: registry, isLoading: registryLoading, error: registryError } = trpc.plugins.registry.useQuery(undefined, {
    staleTime: Infinity, // 永不过期
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });
  
  // 获取 Docker 状态 - 只查询一次
  const { data: dockerStatus } = trpc.plugins.checkDocker.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const isDockerAvailable = dockerStatus?.available ?? false;

  if (registryLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (registryError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">加载插件列表失败</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('plugins.title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              管理基础设施插件，构建完整的 AI 云办公环境
            </p>
          </div>
          <Badge 
            variant={isDockerAvailable ? "outline" : "destructive"} 
            className="self-start sm:self-auto"
          >
            <Server className="h-3 w-3 mr-1" />
            Docker {isDockerAvailable ? "可用" : "不可用"}
          </Badge>
        </div>

        {/* 插件列表 - 使用网格布局 */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {registry?.map((definition) => (
            <PluginCard
              key={definition.id}
              definition={definition}
              isDockerAvailable={isDockerAvailable}
            />
          ))}
        </div>

        {/* 使用说明 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">快速开始</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">安装插件</p>
                  <p className="text-xs text-muted-foreground mt-0.5">选择需要的基础设施插件</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">配置实例</p>
                  <p className="text-xs text-muted-foreground mt-0.5">创建实例时填写连接信息</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">开始使用</p>
                  <p className="text-xs text-muted-foreground mt-0.5">通过客户端与 AI 对话</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
