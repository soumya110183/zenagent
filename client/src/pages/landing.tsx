import { Button } from "@/components/ui/button";
import zenagentBanner from "@assets/zenagent_1754759778955.png";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import Layout from "@/components/layout";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={zensarLogo} 
              alt="Zensar Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Main Banner */}
          <div className="max-w-4xl w-full mb-12">
            <img 
              src={zenagentBanner} 
              alt="Zengent AI Agents" 
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Welcome Content */}
          <div className="text-center max-w-3xl">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Welcome to Zengent AI
            </h1>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Enterprise Application Intelligence Platform
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Analyze your enterprise applications with powerful AI-driven insights and comprehensive 
              project intelligence for better decision making.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-primary font-semibold mb-2">Generator Agent</div>
                <p className="text-sm text-muted-foreground">Creates comprehensive documentation and reports</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-secondary font-semibold mb-2">Analyzer Agent</div>
                <p className="text-sm text-muted-foreground">Deep code analysis and architecture insights</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-warning font-semibold mb-2">Validation Agent</div>
                <p className="text-sm text-muted-foreground">Quality assurance and best practices validation</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="text-destructive font-semibold mb-2">Visualization Agent</div>
                <p className="text-sm text-muted-foreground">Interactive diagrams and visual representations</p>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Sign In to Get Started
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Secure authentication powered by Replit
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-muted py-8 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-muted-foreground">
              Prepared by Diamond Zensar Team • Enterprise Application Intelligence Platform
            </p>
          </div>
        </footer>
      </div>
    </Layout>
  );
}