export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Chào mừng đến với trang quản trị Film Learning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Tổng quan</h3>
          <p className="text-slate-600">Trang dashboard đang được phát triển...</p>
        </div>
      </div>
    </div>
  );
}
