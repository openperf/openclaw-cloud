import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Server, Puzzle, Sparkles, Zap, ArrowRight, Plus, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/contexts/I18nContext";

export default function Dashboard() {
  const { data: instances } = trpc.instances.list.useQuery();
  const { data: plugins } = trpc.plugins.list.useQuery();
  const { data: skills } = trpc.skills.list.useQuery();
  const { t } = useI18n();

  // Stripe风格配色
  const stats = [
    {
      title: t('dashboard.activeInstances'),
      value: instances?.filter(i => i.status === "running").length || 0,
      total: instances?.length || 0,
      icon: Server,
      color: "#635BFF",
      bgColor: "rgba(99, 91, 255, 0.1)",
    },
    {
      title: t('dashboard.installedPlugins'),
      value: plugins?.filter(p => p.installed).length || 0,
      total: plugins?.length || 0,
      icon: Puzzle,
      color: "#FF9E2C",
      bgColor: "rgba(255, 158, 44, 0.1)",
    },
    {
      title: t('dashboard.availableSkills'),
      value: skills?.length || 0,
      total: skills?.length || 0,
      icon: Sparkles,
      color: "#00D4FF",
      bgColor: "rgba(0, 212, 255, 0.1)",
    },
    {
      title: t('dashboard.enabledPlugins'),
      value: plugins?.filter(p => p.enabled).length || 0,
      total: plugins?.length || 0,
      icon: Zap,
      color: "#FF80B5",
      bgColor: "rgba(255, 128, 181, 0.1)",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-2 text-base">
              {t('dashboard.welcome')}
            </p>
          </div>
          <Link href="/instances" className="w-full sm:w-auto">
            <button className="stripe-btn flex items-center justify-center gap-2 h-10 px-5 text-sm w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {t('dashboard.createInstance')}
            </button>
          </Link>
        </div>

        {/* Stats Grid - Stripe风格卡片 */}
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={stat.title} 
              className="stripe-card p-5 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                  </div>
                </div>
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center"
                  style={{ background: stat.bgColor }}
                >
                  <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
          {/* Recent Instances - Takes 3 columns */}
          <div className="stripe-card lg:col-span-3">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t('dashboard.recentInstances')}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('dashboard.recentInstancesDesc')}
                  </p>
                </div>
                <Link href="/instances">
                  <button className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                    {t('home.learnMore')}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {instances && instances.length > 0 ? (
                <div className="space-y-3">
                  {instances.slice(0, 5).map((instance, index) => (
                    <div
                      key={instance.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="h-10 w-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(99, 91, 255, 0.1)' }}
                        >
                          <Server className="h-5 w-5" style={{ color: '#635BFF' }} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{instance.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {instance.description || t('dashboard.noDescription')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            instance.status === "running"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : instance.status === "stopped"
                              ? "bg-muted text-muted-foreground"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            instance.status === "running"
                              ? "bg-emerald-500"
                              : instance.status === "stopped"
                              ? "bg-gray-400"
                              : "bg-red-500"
                          }`}></span>
                          {instance.status === "running" ? t('instances.running') : 
                           instance.status === "stopped" ? t('instances.stopped') : t('instances.error')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div 
                    className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
                    style={{ background: 'rgba(99, 91, 255, 0.1)' }}
                  >
                    <Server className="h-8 w-8" style={{ color: '#635BFF' }} />
                  </div>
                  <p className="text-muted-foreground">
                    {t('dashboard.noInstances')}
                  </p>
                  <Link href="/instances">
                    <button className="mt-4 stripe-btn-outline h-9 px-4 text-sm">
                      {t('dashboard.createInstance')}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - Takes 2 columns */}
          <div className="stripe-card lg:col-span-2">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{t('dashboard.quickActions')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('dashboard.quickActionsDesc')}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link href="/instances">
                  <div 
                    className="group flex items-center gap-4 rounded-xl p-4 transition-all cursor-pointer border"
                    style={{ 
                      borderColor: 'rgba(99, 91, 255, 0.2)',
                      background: 'rgba(99, 91, 255, 0.05)'
                    }}
                  >
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(99, 91, 255, 0.1)' }}
                    >
                      <Plus className="h-5 w-5" style={{ color: '#635BFF' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{t('dashboard.createInstance')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.createInstanceDesc')}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#635BFF' }} />
                  </div>
                </Link>
                
                <Link href="/skills">
                  <div 
                    className="group flex items-center gap-4 rounded-xl p-4 transition-all cursor-pointer border"
                    style={{ 
                      borderColor: 'rgba(0, 212, 255, 0.2)',
                      background: 'rgba(0, 212, 255, 0.05)'
                    }}
                  >
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(0, 212, 255, 0.1)' }}
                    >
                      <Sparkles className="h-5 w-5" style={{ color: '#00D4FF' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{t('dashboard.browseSkills')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.browseSkillsDesc')}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#00D4FF' }} />
                  </div>
                </Link>
                
                <Link href="/plugins">
                  <div 
                    className="group flex items-center gap-4 rounded-xl p-4 transition-all cursor-pointer border"
                    style={{ 
                      borderColor: 'rgba(255, 158, 44, 0.2)',
                      background: 'rgba(255, 158, 44, 0.05)'
                    }}
                  >
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(255, 158, 44, 0.1)' }}
                    >
                      <Puzzle className="h-5 w-5" style={{ color: '#FF9E2C' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{t('dashboard.managePlugins')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.managePluginsDesc')}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#FF9E2C' }} />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
