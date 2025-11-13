import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl mb-4 shadow-lg">
              <i className="fas fa-magic text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dream Piece
            </h1>
            <p className="text-gray-600">관리자 시스템</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </>
  );
}

