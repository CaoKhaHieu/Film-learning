"use client";

import Link from "next/link";
import { Search, Bell, User, PlayCircle, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isVIP, setIsVIP] = useState(false);

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
      alert('Lỗi khi đăng nhập. Vui lòng thử lại!');
    }
  };

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:px-8 transition-all duration-300 ${isScrolled
          ? "bg-black/80 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
    >
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-[length:200%_auto] animate-shimmer">
              FILM LEARNING
            </span>
            <span className="absolute top-0 left-0 text-2xl font-black tracking-tighter text-yellow-500/50 blur-sm animate-pulse">
              FILM LEARNING
            </span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/beginner" className="hover:text-white transition-colors">Cơ Bản</Link>
          <Link href="/intermediate" className="hover:text-white transition-colors">Trung Cấp</Link>
          <Link href="/advanced" className="hover:text-white transition-colors">Nâng Cao</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Search className="h-5 w-5" />
        </Button>

        {user && (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </Button>
        )}

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
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold hidden sm:flex">
                <Crown className="h-4 w-4 mr-2" />
                Mua Gói VIP
              </Button>
            )}

            {/* User Menu */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border-2 border-gray-500 hover:border-yellow-500 transition-colors relative"
              >
                {user?.user_metadata?.avatar_url ? (
                  <>
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || user.email}
                      className="w-full h-full object-cover"
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
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-700">
                    <p className="text-sm text-gray-400">Đăng nhập với</p>
                    <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    {isVIP && (
                      <div className="mt-1 flex items-center gap-1 text-yellow-500 text-xs">
                        <Crown className="h-3 w-3" />
                        <span>Thành viên VIP</span>
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    {!isVIP && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/upgrade");
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-yellow-500 hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <Crown className="h-4 w-4" />
                        Nâng cấp VIP
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
