import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import LoginForm from "@/components/LoginForm";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TermsOfUse from "@/pages/terms-of-use";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicyNew from "@/pages/PrivacyPolicy";
import UsageStatistics from "@/pages/usage-statistics";
import AdminDashboard from "@/pages/admin-dashboard";
import Profile from "@/pages/profile";
import TeamBehind from "@/pages/about";
import ReadmePage from "@/pages/readme";
import KnowledgeAgent from "@/pages/knowledge-agent";
import ZenVectorAgent from "@/pages/zenvector-agent";
import TechnologyFlow from "@/pages/technology-flow";
import DemographicScan from "@/pages/demographic-scan";

import Layout from "@/components/layout";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes (accessible without authentication)
  return (
    <Switch>
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicyNew} />
      <Route>
        {() => {
          // Show login form if not authenticated
          if (!isAuthenticated || !user) {
            return <LoginForm />;
          }
          
          // Authenticated routes
          return (
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/terms-of-use" component={TermsOfUse} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
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
              <Route path="/technology-flow">
                {() => (
                  <Layout>
                    <TechnologyFlow />
                  </Layout>
                )}
              </Route>
              <Route path="/about">
                {() => (
                  <Layout>
                    <TeamBehind />
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
              <Route path="/demographic-scan">
                {() => (
                  <Layout>
                    <DemographicScan />
                  </Layout>
                )}
              </Route>
              <Route component={NotFound} />
            </Switch>
          );
        }}
      </Route>
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
