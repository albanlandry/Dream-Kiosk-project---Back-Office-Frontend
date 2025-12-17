'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';

const loginSchema = z.object({
  email: z.string().email('유효하지 않은 이메일 주소입니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Translate error messages to Korean
  const translateError = (message?: string): string => {
    if (!message) return '이메일 또는 비밀번호가 올바르지 않습니다';
    
    const errorMap: Record<string, string> = {
      'Invalid credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
      'Invalid email or password': '이메일 또는 비밀번호가 올바르지 않습니다',
      'Unauthorized': '인증에 실패했습니다',
      'User not found': '사용자를 찾을 수 없습니다',
      'Account is inactive': '계정이 비활성화되었습니다',
      'Too many login attempts': '로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요',
    };

    // Check for exact match first
    if (errorMap[message]) {
      return errorMap[message];
    }

    // Check for partial matches
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('invalid') || lowerMessage.includes('credentials')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다';
    }
    if (lowerMessage.includes('unauthorized')) {
      return '인증에 실패했습니다';
    }
    if (lowerMessage.includes('not found')) {
      return '사용자를 찾을 수 없습니다';
    }
    if (lowerMessage.includes('inactive')) {
      return '계정이 비활성화되었습니다';
    }
    if (lowerMessage.includes('too many') || lowerMessage.includes('attempts')) {
      return '로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요';
    }

    // Return original message if no translation found
    return message;
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data.email, data.password);
      login(response.access_token, response.admin);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(translateError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Card className="w-full shadow-xl border-0">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800 text-center">
            관리자 로그인
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            백오피스에 접근하려면 자격 증명을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-800">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kiosk.com"
                  className="pl-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-xs"></i>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-800">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle text-xs"></i>
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  로그인 중...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  로그인
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

