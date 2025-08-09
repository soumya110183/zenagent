import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Bot, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Shield
} from "lucide-react";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";

interface LayoutProps {
  children: React.ReactNode;
  showAIConfig?: boolean;
  onAIConfigToggle?: () => void;
  aiConfigButton?: React.ReactNode;
}

export default function Layout({ children, showAIConfig, onAIConfigToggle, aiConfigButton }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    {
      name: 'AI Agent',
      href: '/',
      icon: Bot,
      current: location === '/'
    },
    {
      name: 'Usage Statistics',
      href: '/usage-statistics',
      icon: BarChart3,
      current: location === '/usage-statistics'
    },
    {
      name: 'Admin Dashboard',
      href: '/admin-dashboard',
      icon: Shield,
      current: location === '/admin-dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg relative z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Menu button and Zensar Logo */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-blue-700 md:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <img 
                src={zensarLogo} 
                alt="Zensar Logo" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Center - Zengent AI Text */}
            <div className="flex-1 text-center">
              <h2 className="text-lg font-medium">Zengent AI - Enterprise Application Intelligence Platform</h2>
            </div>
            
            {/* Right side - AI Settings and other buttons */}
            <div className="flex items-center space-x-4">
              {aiConfigButton || (
                onAIConfigToggle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAIConfigToggle}
                    className="text-blue-900 bg-white border-white hover:bg-gray-100 hover:text-primary font-medium"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    AI Settings
                  </Button>
                )
              )}
              <button className="text-blue-200 hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="text-blue-200 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                    >
                      <div
                        className={`
                          group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer
                          ${item.current
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                          }
                        `}
                      >
                        <Icon
                          className={`
                            mr-3 flex-shrink-0 h-5 w-5 transition-colors
                            ${item.current
                              ? 'text-blue-500 dark:text-blue-300'
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                            }
                          `}
                        />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                  >
                    <a
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                        ${item.current
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={`
                          mr-3 flex-shrink-0 h-5 w-5 transition-colors
                          ${item.current
                            ? 'text-blue-500 dark:text-blue-300'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                          }
                        `}
                      />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  );
}