import type { Metadata, Viewport } from "next";
import { Sarabun, Playfair_Display } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sarabun",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sur Beau — Beauty Clinic Platform",
  description: "พบคลินิกที่ใช่ เปรียบราคา ดูรีวิวจริง — แพลตฟอร์มจองคลินิกความงามอันดับ 1",
  applicationName: "Sur Beau",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0a08",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sarabun.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <div className="mx-auto min-h-dvh max-w-md">
          {children}
        </div>
      </body>
    </html>
  );
}
