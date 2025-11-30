import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Film Learning - Xem phim online chất lượng cao",
  description: "Trải nghiệm xem phim đỉnh cao với hàng ngàn bộ phim bom tấn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${oswald.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
