import zenagentAgents from "@assets/zenagentw_1754760754148.png";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import { LoginForm } from "@/components/login-form";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Zensar Logo - Top of page */}
      <div className="relative z-10 text-center pt-8 pb-4">
        <img 
          src={zensarLogo} 
          alt="Zensar Logo" 
          className="h-16 w-auto object-contain mx-auto filter brightness-0 invert"
        />
      </div>
      
      {/* Background Image - Centered in middle portion */}
      <div className="absolute top-24 left-0 right-0 h-2/3 flex items-center justify-center">
        <img 
          src={zenagentAgents} 
          alt="Zengent AI Agents" 
          className="max-w-5xl w-full h-auto object-contain opacity-25"
        />
      </div>
      
      {/* Spacer to push content down */}
      <div className="flex-1"></div>
      
      {/* Content Container - Positioned in lower portion */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 pb-16">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">ZENGENT AI</h1>
          <p className="text-blue-300 text-sm">Enterprise Application Intelligence Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300 text-sm">Sign in to access your AI agents</p>
          </div>
          
          <LoginForm />
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Prepared by Diamond Zensar Team
          </p>
        </div>
      </div>
    </div>
  );
}