import Link from "next/link";
import { Play, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image Placeholder - In a real app, use next/image with a real URL */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-4 md:px-16 max-w-3xl pt-20">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
          CONAN
        </h1>

        <p className="text-gray-200 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-xl">
          Thám tử lừng danh Conan phải đối mặt với vụ án khó khăn nhất từ trước đến nay.
          Một bí ẩn bao trùm lên toàn bộ thành phố Tokyo khi tổ chức áo đen bắt đầu hành động trở lại.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/movie/conan">
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 px-8 text-lg rounded-md">
              <Play className="mr-2 h-5 w-5 fill-black" /> Xem Ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
