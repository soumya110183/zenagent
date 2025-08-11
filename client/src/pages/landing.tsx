import zenagentAgents from "@assets/zenagentw_1754761999252.png";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import amexLogo from "@assets/amex logo_1754786264214.png";
import { LoginForm } from "@/components/login-form";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleLoginSuccess = () => {
    // Redirect to home page after successful login
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex">
      {/* Left Panel - Hero Content */}
      <div className="flex-1 flex flex-col p-12 text-white relative overflow-hidden">
        {/* Top Section - Title Text */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-2xl font-bold mb-2 tracking-wide">
            ENTERPRISE APPLICATION INTELLIGENCE
          </h1>
          <h2 className="text-base font-medium mb-4 text-cyan-400">
            PLATFORM POWERED BY AI AGENTS
          </h2>
        </div>
        
        {/* Middle Section - Zenagent AI Agents Image */}
        <div className="flex-1 flex items-start justify-center pt-6 pb-8">
          <img 
            src={zenagentAgents} 
            alt="Zengent AI Agents" 
            className="max-w-2xl w-full h-auto object-contain"
          />
        </div>
        
        {/* Text below image with more spacing */}
        <div className="text-center mb-12 mt-6">
          <p className="text-sm opacity-70 leading-relaxed max-w-md mx-auto">
            AI Agents powered by advanced AI-driven insights and comprehensive project intelligence to analyze your enterprise applications with precision. Tailored exclusively to meet the unique requirements of the <span className="text-cyan-400 !opacity-100">Amex Diamond Project</span> team.
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Eras Bold ITC, Arial Black, sans-serif' }}>Zengent AI</h3>
            <p className="text-gray-600">Secure platform access</p>
          </div>
          
          <LoginForm onSuccess={handleLoginSuccess} />
          
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 mb-2">
              Built by the Zensar AI Team - Diamond Project
            </p>
            <p className="text-xs text-gray-400 mb-2">
              © 2025 | <a href="/terms-of-use" className="hover:text-gray-600">Terms of use</a> | <a href="/privacy-policy" className="hover:text-gray-600">Privacy Policy</a>
            </p>
            <p className="text-xs text-gray-400 mb-4">
              <a href="https://www.zensar.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
                www.zensar.com
              </a>
            </p>
            
            {/* Amex Logo */}
            <div className="flex justify-center mt-4">
              <img 
                src={amexLogo} 
                alt="American Express Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}