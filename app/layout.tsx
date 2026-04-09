import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "אבו אמין חלפים | أبو أمين لقطع الغيار",
  description:
    "חנות חלפים לרכב באזור עוספיא / דלית אל כרמל. בחר רכב, בחר חלפים, ושלח הזמנה — נחזור אליך תוך שעות.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={inter.variable} data-theme="dark">
      <head>
        {/* Prevent flash of unstyled theme — runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-inter), 'Heebo', 'Cairo', system-ui, sans-serif" }}>
        <ThemeProvider>
          <Nav />
          {children}
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
