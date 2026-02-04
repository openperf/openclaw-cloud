import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Instances from "./pages/Instances";
import Plugins from "./pages/Plugins";
import Skills from "./pages/Skills";
import SharedSkill from "./pages/SharedSkill";
import Collections from "./pages/Collections";
import Chat from "./pages/Chat";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/instances"} component={Instances} />
      <Route path={"/plugins"} component={Plugins} />
      <Route path={"/skills"} component={Skills} />
      <Route path={"/skills/shared"} component={SharedSkill} />
      <Route path={"/collections"} component={Collections} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
