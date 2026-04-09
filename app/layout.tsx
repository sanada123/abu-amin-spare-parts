import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import PromoBanner from "@/components/PromoBanner";

export const metadata: Metadata = {
  title: "אבו אמין חלפים | מס׳ 1 בכרמל — חלפי רכב · כלים · גינה",
  description:
    "חנות חלפים ותיקה בלב הכרמל. חלקי חילוף לרכב, שמנים, מצברים, כלי עבודה, מכונות שטיפה וציוד גינה. עוספיה, הכרמל.",
  metadataBase: new URL("https://abu-amin.co.il"),
  openGraph: {
    title: "אבו אמין חלפים | מס׳ 1 בכרמל",
    description:
      "חנות חלפים ותיקה בלב הכרמל — חלקי חילוף לרכב, שמנים, מצברים, כלי עבודה וציוד גינה.",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }],
    locale: "he_IL",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" data-theme="light">
      <head>
        {/* Prevent flash of unstyled theme — runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){localStorage.setItem('theme','light');t='light';}if(!t)t='light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        {/* Heebo — Hebrew-first font, 3 weights */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap"
        />
      </head>
      <body style={{ fontFamily: "'Heebo', 'Arial Hebrew', 'David', system-ui, sans-serif" }}>
        <ThemeProvider>
          <PromoBanner />
          <Nav />
          {children}
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
