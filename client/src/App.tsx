import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import TermsOfUse from "@/pages/terms-of-use";
import PrivacyPolicy from "@/pages/privacy-policy";
import UsageStatistics from "@/pages/usage-statistics";
import AdminDashboard from "@/pages/admin-dashboard";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import ReadmePage from "@/pages/readme";
import KnowledgeAgent from "@/pages/knowledge-agent";
import ZenVectorAgent from "@/pages/zenvector-agent";
import Layout from "@/components/layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes available without authentication */}
      <Route path="/terms-of-use" component={TermsOfUse} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/usage-statistics">
            {() => (
              <Layout>
                <UsageStatistics />
              </Layout>
            )}
          </Route>
          <Route path="/admin-dashboard">
            {() => (
              <Layout>
                <AdminDashboard />
              </Layout>
            )}
          </Route>
          <Route path="/profile" component={Profile} />
          <Route path="/about">
            {() => (
              <Layout>
                <About />
              </Layout>
            )}
          </Route>
          <Route path="/readme">
            {() => (
              <Layout>
                <ReadmePage />
              </Layout>
            )}
          </Route>
          <Route path="/knowledge-agent">
            {() => (
              <Layout>
                <KnowledgeAgent />
              </Layout>
            )}
          </Route>
          <Route path="/zenvector-agent">
            {() => (
              <Layout>
                <ZenVectorAgent />
              </Layout>
            )}
          </Route>
          <Route path="/" component={Home} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
