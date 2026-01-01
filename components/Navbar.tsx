"use client";

import Link from "next/link";
import { Search, User, LogOut, Crown, BookOpen, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PricingModal } from "@/components/PricingModal";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [isVIP, setIsVIP] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Check VIP status if user exists
      if (user) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .eq("plan", "vip")
          .single();

        setIsVIP(!!subscription);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowUserMenu(false);
    router.refresh();
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error('Error logging in:', error);
      toast.error('Lỗi khi đăng nhập. Vui lòng thử lại!');
    }
  };

  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navBackground = isScrolled || !isHomePage
    ? "bg-white shadow-sm py-2 border-b border-slate-100"
    : "bg-white/80 backdrop-blur-md py-4 border-b border-slate-100/50";

  const textColor = "text-slate-700";
  const iconColor = "text-slate-600 hover:bg-slate-100";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-16 transition-all duration-500 ${navBackground}`}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-size-[200%_auto] animate-shimmer">
              FILM LEARNING
            </span>
            <span className="absolute top-0 left-0 text-2xl font-black tracking-tighter text-yellow-500/30 blur-sm animate-pulse">
              FILM LEARNING
            </span>
          </div>
        </Link>
        <div className={`hidden md:flex items-center gap-8 text-[15px] font-bold transition-colors ${textColor}`}>
          <Link href="/beginner" className="hover:text-yellow-600 transition-colors">Cơ Bản</Link>
          <Link href="/intermediate" className="hover:text-yellow-600 transition-colors">Trung Cấp</Link>
          <Link href="/advanced" className="hover:text-yellow-600 transition-colors">Nâng Cao</Link>
          <Link href="/all" className="hover:text-yellow-600 transition-colors flex items-center gap-1">
            <Compass className="w-4 h-4" />
            Khám Phá
          </Link>
          <Link href="/request" className="hover:text-yellow-600 transition-colors flex items-center gap-1">
            Yêu Cầu Phim
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`transition-all hover:scale-110 ${iconColor}`}
          onClick={() => router.push("/search")}
        >
          <Search className="h-5 w-5" />
        </Button>

        {!user ? (
          <Button
            onClick={handleLogin}
            className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold"
          >
            Đăng nhập
          </Button>
        ) : (
          <>
            {!isVIP && (
              <Button
                onClick={() => setShowPricingModal(true)}
                className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold hidden sm:flex"
              >
                <Crown className="h-4 w-4 mr-2" />
                Mua Gói VIP
              </Button>
            )}

            {/* User Menu */}
            <div className="relative user-menu-container cursor-pointer">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border-2 border-gray-500 hover:border-yellow-500 transition-colors relative"
              >
                {user?.user_metadata?.avatar_url ? (
                  <>
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || user.email}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                    {isVIP && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-yellow-500 rounded-full p-0.5">
                        <Crown className="h-2.5 w-2.5 text-black" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {isVIP ? (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <User className="h-5 w-5 text-gray-300" />
                    )}
                  </>
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đăng nhập với</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    {isVIP && (
                      <div className="mt-2 flex items-center gap-1.5 text-yellow-600 text-xs font-bold bg-yellow-50 px-2 py-1 rounded-full w-fit">
                        <Crown className="h-3 w-3" />
                        <span>Thành viên VIP</span>
                      </div>
                    )}
                  </div>

                  <div className="py-2">
                    {!isVIP && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowPricingModal(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-3 cursor-pointer font-bold transition-colors"
                      >
                        <div className="p-1.5 bg-yellow-100 rounded-lg">
                          <Crown className="h-4 w-4" />
                        </div>
                        Nâng cấp VIP
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/vocabulary");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 cursor-pointer font-bold transition-colors"
                    >
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      Sổ tay từ vựng
                    </button>

                    <div className="h-px bg-slate-100 my-1 mx-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 cursor-pointer font-bold transition-colors"
                    >
                      <div className="p-1.5 bg-red-100 rounded-lg">
                        <LogOut className="h-4 w-4" />
                      </div>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} user={user} />
    </nav >
  );
}

