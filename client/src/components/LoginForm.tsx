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
import zensarLogo from '@assets/Zensar composite_logo_whit_png_1754917009834.png';

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
      {/* Left Panel - Blue Background with Zengent AI Agents Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="text-center max-w-lg">
          <img 
            src={zenagentImage} 
            alt="Zengent AI Agents" 
            className="mx-auto mb-8 w-full h-auto"
            style={{ maxHeight: '400px' }}
          />
          <h1 className="text-4xl font-bold text-white mb-4">
            Zengent AI
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed mb-6">
            Enterprise Application Intelligence Platform with Advanced AI Agents
          </p>
          <img 
            src={zensarLogo} 
            alt="Zensar - An RPG Company" 
            className="mx-auto max-w-xs h-auto opacity-90"
          />
        </div>
      </div>

      {/* Right Panel - White Background with Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src={zenagentImage} 
              alt="Zengent AI Agents" 
              className="mx-auto mb-4 w-64 h-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900">Zengent AI</h1>
          </div>

          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Zengent AI
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2 text-lg">
                Sign in to access your enterprise AI platform
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    {...loginForm.register('username')}
                    placeholder="Enter your username"
                    disabled={loginMutation.isPending}
                    className="h-12 px-4 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-600">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...loginForm.register('password')}
                      placeholder="Enter your password"
                      disabled={loginMutation.isPending}
                      className="h-12 px-4 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Test credentials: <span className="font-medium">amex</span> / <span className="font-medium">zensar</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}