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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-black text-black">F</span>
              </div>
              <h1 className="text-3xl font-black text-white">Film Learning</h1>
            </div>
            <p className="text-gray-400 text-sm">Admin Panel</p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Đăng Nhập</h2>
            <p className="text-gray-400 text-sm">
              Chỉ dành cho quản trị viên
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="w-full h-12 bg-zinc-800 rounded-lg animate-pulse" />

          {/* Info */}
          <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-xs text-gray-400 text-center">
              ⚠️ Chỉ tài khoản Google được phê duyệt mới có thể truy cập trang quản trị
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-yellow-500 transition-colors"
          >
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
