import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-8xl font-black text-yellow-500">404</h1>
          <h2 className="text-3xl font-bold">Không tìm thấy phim</h2>
          <p className="text-gray-400 text-lg">
            Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold w-full sm:w-auto">
              <Home className="mr-2 h-5 w-5" />
              Về Trang Chủ
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Quay Lại
          </Button>
        </div>
      </div>
    </div>
  );
}
