import Link from "next/link";
import { Search, Bell, User, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:px-8 bg-gradient-to-b from-black/80 to-transparent">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white">
          <PlayCircle className="h-8 w-8 text-yellow-500 fill-yellow-500" />
          <span>RaPhim</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="#" className="hover:text-white transition-colors">Phim bộ</Link>
          <Link href="#" className="hover:text-white transition-colors">Phim lẻ</Link>
          <Link href="#" className="hover:text-white transition-colors">TV Shows</Link>
          <Link href="#" className="hover:text-white transition-colors">Hoạt hình</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
        </Button>
        <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold hidden sm:flex">
          Mua Gói VIP
        </Button>
        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border border-gray-500">
          <User className="h-5 w-5 text-gray-300" />
        </div>
      </div>
    </nav>
  );
}
