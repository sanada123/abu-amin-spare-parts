import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Abu Amin Spare Parts | אבו אמין חלפים | أبو أمين لقطع الغيار",
  description: "Every part for every car — exact fit. Auto parts e-commerce for Israel and the Arab world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
