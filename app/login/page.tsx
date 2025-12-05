import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <span className="text-2xl font-black text-white">F</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900">Film Learning</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Admin Panel</p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Đăng Nhập</h2>
            <p className="text-slate-500 text-sm">
              Chỉ dành cho quản trị viên
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="w-full h-12 bg-slate-100 rounded-lg animate-pulse" />

          {/* Info */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              ⚠️ Chỉ tài khoản Google được phê duyệt mới có thể truy cập trang quản trị
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-slate-500 hover:text-yellow-600 transition-colors font-medium"
          >
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
