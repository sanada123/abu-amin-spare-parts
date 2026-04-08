import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abu Amin Spare Parts | אבו אמין חלפים | أبو أمين لقطع الغيار",
  description:
    "Every part for every car — exact fit. Auto parts e-commerce for Israel and the Arab world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), 'Heebo', 'Cairo', system-ui, sans-serif" }}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
