import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema } from '@shared/schema';
import type { LoginInput } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import zenagentImage from '@assets/zenagentw_1754916187232.png';
import zensarLogo from '@assets/Zensar_composite_logo_whit_ai_1754917811230.png';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const loginMutation = useLogin();

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onLogin = async (data: LoginInput) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      console.log('Login result:', result);
      if (result.success) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        // Force reload to clear any cached authentication state
        window.location.href = '/';
      } else {
        toast({
          title: "Error",
          description: result.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed. Please check your credentials.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Blue Background with Code Lens AI Agents Layout */}
      <div className="hidden lg:flex lg:w-[60%] bg-[#2E4BC7] items-center justify-center p-12">
        <div className="text-center max-w-2xl w-full">
          {/* Main Heading */}
          <h1 className="text-3xl text-white font-bold mb-16 uppercase tracking-wide">
            ENTERPRISE APPLICATION INTELLIGENCE
          </h1>
          
          {/* Agents Image */}
          <div className="mb-16">
            <img 
              src={zenagentImage} 
              alt="Code Lens AI Agents" 
              className="mx-auto w-full h-auto"
              style={{ maxHeight: '350px' }}
            />
          </div>
          
          {/* Platform Text */}
          <div className="mb-8">
            <h2 className="text-2xl text-white font-bold mb-4 uppercase tracking-wide">
              PLATFORM POWERED BY AI AGENTS
            </h2>
            <p className="text-lg text-white/90 leading-relaxed px-8">
              Analyze your enterprise applications with powerful AI-driven insights<br />
              and comprehensive project intelligence for better decision making.
            </p>
          </div>
          
          {/* Zensar Logo */}
          <img 
            src={zensarLogo} 
            alt="Zensar - An RPG Company" 
            className="mx-auto max-w-[200px] h-auto opacity-95"
          />
        </div>
      </div>

      {/* Right Panel - Clean Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src={zenagentImage} 
              alt="Code Lens AI Agents" 
              className="mx-auto mb-4 w-64 h-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900">Code Lens AI v2</h1>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                CODE LENS AI v2
              </h1>
              <p className="text-sm text-gray-600">
                Secure platform access
              </p>
            </div>

            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 mb-2 block">
                  Username
                </Label>
                <Input
                  id="username"
                  {...loginForm.register('username')}
                  placeholder="Enter your username"
                  disabled={loginMutation.isPending}
                  className="h-11 px-3 text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register('password')}
                    placeholder="Enter your password"
                    disabled={loginMutation.isPending}
                    className="h-11 px-3 text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Forgot Password?
                </a>
              </div>
              
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
              >
                {loginMutation.isPending ? "SIGNING IN..." : "LOGIN"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 mb-3">
                Prepared by Diamond Zensar Team
              </p>
              <div className="flex justify-center space-x-1 text-xs text-gray-500">
                <span>© 2025 |</span>
                <a href="/terms" className="hover:text-blue-600">Terms of use</a>
                <span>|</span>
                <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}