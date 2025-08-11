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
        // Small delay to ensure session is set properly
        setTimeout(() => {
          window.location.reload();
        }, 100);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Zengent AI</CardTitle>
          <CardDescription>
            Enterprise Application Intelligence Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...loginForm.register('username')}
                placeholder="Enter your username"
                disabled={loginMutation.isPending}
              />
              {loginForm.formState.errors.username && (
                <p className="text-sm text-red-600">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...loginForm.register('password')}
                  placeholder="Enter your password"
                  disabled={loginMutation.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
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
              className="w-full"
              disabled={loginMutation.isPending}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}