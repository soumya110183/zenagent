import zenagentAgents from "@assets/zenagentw_1754761999252.png";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import { LoginForm } from "@/components/login-form";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex">
      {/* Left Panel - Hero Content */}
      <div className="flex-1 flex flex-col p-12 text-white relative overflow-hidden">
        {/* Top Section - Title Text */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-2xl font-bold mb-2 tracking-wide">
            ENTERPRISE APPLICATION INTELLIGENCE
          </h1>
        </div>
        
        {/* Middle Section - Zenagent AI Agents Image - Moved Up */}
        <div className="flex-1 flex items-start justify-center pt-4">
          <img 
            src={zenagentAgents} 
            alt="Zengent AI Agents" 
            className="max-w-3xl w-full h-auto object-contain"
          />
        </div>
        
        {/* Text below image */}
        <div className="text-center mb-12">
          <h2 className="text-lg font-medium mb-6 opacity-90">
            PLATFORM POWERED BY AI AGENTS
          </h2>
          <p className="text-sm opacity-70 leading-relaxed max-w-md mx-auto mt-8">
            Analyze your enterprise applications with powerful AI-driven insights 
            and comprehensive project intelligence for better decision making.
          </p>
        </div>
        
        {/* Bottom Section - Zensar Logo - Moved Further Down */}
        <div className="text-center pb-8 mt-auto">
          <img 
            src={zensarLogo} 
            alt="Zensar Logo" 
            className="h-12 w-auto object-contain mx-auto filter brightness-0 invert"
          />
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
            <p className="text-xs text-gray-500 mb-2">
              Prepared by Diamond Zensar Team
            </p>
            <p className="text-xs text-gray-400">
              © 2025 | <a href="#" className="hover:text-gray-600">Terms of use</a> | <a href="#" className="hover:text-gray-600">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}