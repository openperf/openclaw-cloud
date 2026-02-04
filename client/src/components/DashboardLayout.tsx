import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Server, Puzzle, Sparkles, FolderOpen, Moon, Sun, MessageSquare } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { Logo, LogoIcon } from "./Logo";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 200;
const MAX_WIDTH = 360;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  // 菜单项配色 - Stripe风格渐变色
  const menuItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: "/dashboard", color: "#635BFF" },
    { icon: MessageSquare, label: t('nav.chat'), path: "/chat", highlight: true, color: "#00D4FF" },
    { icon: Server, label: t('nav.instances'), path: "/instances", color: "#FF80B5" },
    { icon: Puzzle, label: t('nav.plugins'), path: "/plugins", color: "#FF9E2C" },
    { icon: Sparkles, label: t('nav.skills'), path: "/skills", color: "#10B981" },
    { icon: FolderOpen, label: t('nav.collections'), path: "/collections", color: "#8B5CF6" },
  ];

  const activeMenuItem = menuItems.find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="stripe-sidebar border-r"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-14 justify-center border-b border-border !p-0">
            <div className="flex items-center gap-2 px-2 ml-2 transition-all w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:ml-0">
              {/* 折叠按钮 - 与菜单项图标严格对齐，使用相同的 h-8 和 p-2 */}
              <button
                onClick={toggleSidebar}
                className="h-8 p-2 flex items-center justify-center hover:bg-accent rounded-md transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {/* Logo 和导航文字 - 点击返回主页 */}
              <button
                onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:hidden hover:opacity-80 transition-opacity"
              >
                <LogoIcon size="md" className="shrink-0" />
                <span className="text-base font-semibold text-foreground truncate">
                  {t('nav.navigation')}
                </span>
              </button>
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 py-2">
            <SidebarMenu className="px-2 space-y-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
              {menuItems.map(item => {
                const isActive = location === item.path;
                const isHighlight = 'highlight' in item && item.highlight;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      size="default"
                      className={`rounded-md transition-all ${
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : isHighlight 
                            ? "text-primary hover:bg-primary/5" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon 
                        className="h-4 w-4" 
                        style={{ color: isActive ? item.color : undefined }}
                      />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2 border-t border-border group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            {/* Language & Theme Controls */}
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <div className="flex items-center border border-border rounded-full overflow-hidden flex-1 text-xs">
                  <button
                    onClick={() => setLocale('zh')}
                    className={`flex-1 px-3 py-1.5 font-medium transition-colors ${
                      locale === 'zh' 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => setLocale('en')}
                    className={`flex-1 px-3 py-1.5 font-medium transition-colors ${
                      locale === 'en' 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    EN
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-8 w-8 shrink-0 rounded-full hover:bg-accent"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-border shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "G"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-foreground">
                      {user?.name || t('nav.guest')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user?.email || t('nav.notSignedIn')}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                {isCollapsed && (
                  <>
                    <div className="flex items-center gap-1.5 p-2">
                      <div className="flex items-center border rounded-full overflow-hidden flex-1 text-xs">
                        <button
                          onClick={() => setLocale('zh')}
                          className={`flex-1 px-2 py-1 font-medium transition-colors ${
                            locale === 'zh' 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          中文
                        </button>
                        <button
                          onClick={() => setLocale('en')}
                          className={`flex-1 px-2 py-1 font-medium transition-colors ${
                            locale === 'en' 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-accent'
                          }`}
                        >
                          EN
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="h-7 w-7 shrink-0 rounded-full"
                      >
                        {theme === 'dark' ? (
                          <Sun className="h-3.5 w-3.5" />
                        ) : (
                          <Moon className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.signOut')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-background">
        {isMobile && (
          <div className="flex border-b border-border h-12 items-center justify-between bg-card px-3 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8 rounded-lg" />
              <span className="text-sm font-medium text-foreground">
                {activeMenuItem?.label ?? "Menu"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
