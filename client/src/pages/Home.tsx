import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ScrollingCodeBlock } from "@/components/ScrollingCodeBlock";
import { getLoginUrl } from "@/const";
import { 
  Server, 
  Sparkles, 
  Puzzle, 
  Github, 
  Moon, 
  Sun, 
  ArrowRight,
  Check,
  Zap,
  Shield,
  MessageSquare
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <Logo size="lg" showText={false} />
          </div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Stripe风格导航栏 */}
      <header className="sticky top-0 z-50 stripe-navbar">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher - 手机端隐藏 */}
            <div className="hidden sm:flex items-center border border-border rounded-full overflow-hidden text-xs">
              <button
                onClick={() => setLocale('zh')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  locale === 'zh' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  locale === 'en' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                EN
              </button>
            </div>
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {/* Login - 手机端隐藏 */}
            <Button variant="outline" size="sm" className="hidden sm:flex rounded-full h-9 px-4" asChild>
              <a href={getLoginUrl()}>{t('home.login')}</a>
            </Button>
            <Button size="sm" className="stripe-btn h-9 px-3 sm:px-5" asChild>
              <Link href="/dashboard">
                <span className="hidden sm:inline">{t('home.startNow')}</span>
                <span className="sm:hidden">开始</span>
                <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Stripe风格 */}
      <section className="relative overflow-hidden">
        {/* 彩虹渐变装饰背景 */}
        <div className="absolute top-0 right-0 w-[800px] h-[600px] opacity-60 pointer-events-none">
          <div 
            className="w-full h-full stripe-gradient-bg"
            style={{
              clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)',
              filter: 'blur(60px)'
            }}
          />
        </div>
        
        <div className="container relative py-12 sm:py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* 左侧内容 */}
            <div className="animate-fade-in text-center lg:text-left">
                {/* 标题 */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6 sm:mb-8">
                <span className="stripe-gradient-text font-extrabold">OpenClaw</span>
                <span className="text-foreground font-semibold"> Cloud</span>
              </h1>
              
              {/* 描述 */}
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {t('home.description')}
              </p>
              
              {/* 按钮组 - 手机端垂直排列 */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Button className="stripe-btn h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                  <Link href="/dashboard">
                    {t('home.startNow')}
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Link>
                </Button>
                <Button className="stripe-btn-outline h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                  <a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                    {t('home.viewOnGithub')}
                  </a>
                </Button>
              </div>
            </div>

            {/* 右侧代码展示 - 滚动动画 */}
            <div className="hidden lg:block animate-slide-in-up delay-200">
              <ScrollingCodeBlock />
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 - Stripe风格卡片 */}
      <section className="container py-12 sm:py-16 md:py-28">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('home.coreFeatures')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            管理 OpenClaw 实例所需的一切
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* 实例管理 */}
          <Link href="/instances" className="block">
            <div className="stripe-feature-card h-full group text-center sm:text-left">
              <div className="stripe-feature-icon mx-auto sm:mx-0" style={{ background: 'linear-gradient(135deg, rgba(99, 91, 255, 0.15) 0%, rgba(99, 91, 255, 0.05) 100%)' }}>
                <Server className="h-6 w-6 text-[#635BFF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.instanceManagement')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('home.instanceManagementDesc')}
              </p>
            </div>
          </Link>

          {/* AI 智能对话 */}
          <Link href="/chat" className="block">
            <div className="stripe-feature-card h-full group text-center sm:text-left">
              <div className="stripe-feature-icon mx-auto sm:mx-0" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
                <MessageSquare className="h-6 w-6 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.aiChat')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('home.aiChatDesc')}
              </p>
            </div>
          </Link>

          {/* Skills 技能 */}
          <Link href="/skills" className="block">
            <div className="stripe-feature-card h-full group text-center sm:text-left">
              <div className="stripe-feature-icon mx-auto sm:mx-0" style={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)' }}>
                <Sparkles className="h-6 w-6 text-[#00D4FF]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.skillIntegration')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('home.skillIntegrationDesc')}
              </p>
            </div>
          </Link>

          {/* 插件系统 */}
          <Link href="/plugins" className="block">
            <div className="stripe-feature-card h-full group text-center sm:text-left">
              <div className="stripe-feature-icon mx-auto sm:mx-0" style={{ background: 'linear-gradient(135deg, rgba(255, 128, 181, 0.15) 0%, rgba(255, 128, 181, 0.05) 100%)' }}>
                <Puzzle className="h-6 w-6 text-[#FF80B5]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('home.pluginSystem')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('home.pluginSystemDesc')}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 统计数据 - Stripe风格 */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-10 sm:py-16">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="stripe-stat">
              <div className="stripe-stat-number">100%</div>
              <div className="stripe-stat-label">{t('home.openSource')}</div>
            </div>
            <div className="stripe-stat">
              <div className="stripe-stat-number">∞</div>
              <div className="stripe-stat-label">{t('home.scalable')}</div>
            </div>
            <div className="stripe-stat">
              <div className="stripe-stat-number flex items-center justify-center gap-2">
                <Zap className="h-8 w-8 text-[#FF9E2C]" />
              </div>
              <div className="stripe-stat-label">{t('home.fastDeployment')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Stripe风格渐变背景 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 stripe-gradient-bg opacity-90" />
        <div className="container relative py-12 sm:py-16 md:py-24 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {t('home.readyToStart')}
          </h2>
          <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8 max-w-xl mx-auto px-4 sm:px-0">
            {t('home.startBuildingToday')}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-[#635BFF] hover:bg-white/90 h-12 px-8 rounded-full font-semibold"
            asChild
          >
            <Link href="/dashboard">
              {t('home.startNow')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer - Stripe风格 */}
      <footer className="border-t border-border bg-background">
        <div className="container py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t('home.features')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/instances" className="hover:text-foreground transition-colors">{t('home.instanceManagement')}</Link></li>
                <li><Link href="/skills" className="hover:text-foreground transition-colors">{t('home.skillIntegration')}</Link></li>
                <li><Link href="/plugins" className="hover:text-foreground transition-colors">{t('home.pluginSystem')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t('home.pricing')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">{t('home.pricing')}</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">{t('home.docs')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">GitHub</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{t('home.discussions')}</a></li>
                <li><a href="https://github.com/openclaw/openclaw/issues" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{t('home.issues')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t('home.legal')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">{t('home.privacy')}</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">{t('home.terms')}</Link></li>
                <li><Link href="/license" className="hover:text-foreground transition-colors">{t('home.license')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo />
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              © 2026 OpenClaw Cloud. {t('home.allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
