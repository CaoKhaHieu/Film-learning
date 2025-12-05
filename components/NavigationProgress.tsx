"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "@/styles/nprogress.css";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
  easing: "ease",
  speed: 500,
});

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Khi pathname hoặc searchParams thay đổi -> Navigation đã hoàn tất
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Bắt sự kiện click vào thẻ <a> để start progress bar ngay lập tức
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      // Kiểm tra xem có phải là link nội bộ không
      if (anchor && anchor.href && anchor.target !== '_blank' && !event.ctrlKey && !event.metaKey) {
        const targetUrl = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // Chỉ start nếu navigate sang trang khác hoặc query khác
        if (targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)) {
          NProgress.start();
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return null;
}
