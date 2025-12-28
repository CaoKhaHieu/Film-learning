import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProxyUrl(url: string) {
  if (!url || !url.includes('.m3u8')) return url;

  // If it's already a proxy URL, don't wrap it again
  if (url.includes('hls.kolarea.com/m3u8-proxy')) return url;

  const proxyBase = "https://hls.kolarea.com/m3u8-proxy";
  const headers = {
    "Referer": "https://flixer.sh/",
    "Origin": "https://flixer.sh"
  };

  return `${proxyBase}?url=${encodeURIComponent(url)}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
}
