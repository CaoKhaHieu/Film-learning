"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Film, Flag, Users, Settings, BarChart3, FileText, MessageSquare } from "lucide-react";

const menuItems = [
  {
    title: "Tổng quan",
    icon: BarChart3,
    href: "/admin",
  },
  {
    title: "Quản lý phim",
    icon: Film,
    href: "/admin/movies",
  },
  {
    title: "Báo cáo lỗi",
    icon: Flag,
    href: "/admin/reports",
  },
  {
    title: "Yêu cầu phim",
    icon: MessageSquare,
    href: "/admin/requests",
  },
  {
    title: "Người dùng",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Cài đặt",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Film Learning</h1>
            <p className="text-xs text-slate-500 font-medium">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                  ? "bg-yellow-400 text-slate-900 shadow-md"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Back to Site */}
      <div className="p-4 border-t border-slate-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Home className="w-5 h-5" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </aside>
  );
}
