import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-8xl font-black text-yellow-500">404</h1>
        <h2 className="text-3xl font-bold">Không Tìm Thấy Phim</h2>
        <p className="text-gray-400 text-lg">
          Rất tiếc, chúng tôi không thể tìm thấy bộ phim bạn đang tìm kiếm.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/">
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
              <Home className="mr-2 h-5 w-5" />
              Về Trang Chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
