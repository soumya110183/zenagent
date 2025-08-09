import zenagentAgents from "@assets/zenagentw_1754761061005.png";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import { LoginForm } from "@/components/login-form";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex">
      {/* Left Panel - Hero Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        {/* Zenagent AI Agents Image - Top Section */}
        <div className="flex-1 flex items-end justify-center pb-8">
          <img 
            src={zenagentAgents} 
            alt="Zengent AI Agents" 
            className="max-w-2xl w-full h-auto object-contain"
          />
        </div>
        
        {/* Content - Bottom Section */}
        <div className="text-center max-w-lg">
          {/* Zensar Logo */}
          <div className="mb-6">
            <img 
              src={zensarLogo} 
              alt="Zensar Logo" 
              className="h-16 w-auto object-contain mx-auto filter brightness-0 invert"
            />
          </div>

          <h1 className="text-3xl font-bold mb-3">
            ENTERPRISE APPLICATION INTELLIGENCE
          </h1>
          <h2 className="text-lg font-medium mb-4 opacity-90">
            PLATFORM POWERED BY AI AGENTS
          </h2>
          <p className="text-base opacity-80 leading-relaxed">
            Analyze your enterprise applications with powerful AI-driven insights and comprehensive 
            project intelligence for better decision making.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-96 bg-white flex flex-col justify-center items-center p-8 shadow-2xl">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">ZENGENT AI</h3>
            <p className="text-gray-600">Secure platform access</p>
          </div>
          
          <LoginForm />
          
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Prepared by Diamond Zensar Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}