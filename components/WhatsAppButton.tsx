"use client";
import { MessageCircle } from "lucide-react";
import { useLocale } from "@/lib/cart";

interface WhatsAppButtonProps {
  /** Optional context text to pre-fill in the WhatsApp message */
  context?: string;
}

export default function WhatsAppButton({ context }: WhatsAppButtonProps) {
  const locale = useLocale();
  const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "972500000000";

  const defaultText = locale === "ar"
    ? "שלום، أنا مهتم بقطع غيار لسيارتي"
    : "שלום, אני מעוניין בחלפים לרכב שלי";

  const text = context ? `${defaultText} — ${context}` : defaultText;
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      style={{
        position: "fixed",
        bottom: "calc(var(--bottom-nav-h, 64px) + 16px)",
        insetInlineStart: 16,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "#25D366",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(37,211,102,0.45)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.08)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(37,211,102,0.6)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(37,211,102,0.45)";
      }}
    >
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  );
}
