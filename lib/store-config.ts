/**
 * Centralized store configuration — single source of truth for contact info,
 * phone numbers, and business details used across the storefront.
 */

export const STORE = {
  name: "אבו אמין חלפים",
  nameEn: "Abu Amin Spare Parts",

  // Phone numbers
  phoneLandline: "04-8599333",
  phoneMobile: "052-3158796",
  phoneLandlineHref: "tel:+97248599333",
  phoneMobileHref: "tel:+972523158796",

  // WhatsApp
  whatsappNumber: "972523158796",
  whatsappHref: "https://wa.me/972523158796",

  // Address
  address: "כביש ראשי דלית עוספיא, מול אמל חשמל, עוספיה",

  // Hours
  hours: "א׳–ה׳ 08:00–18:00 · ו׳ 08:00–13:00 · שבת סגור",

  // VAT
  vatId: process.env.NEXT_PUBLIC_VAT_ID ?? "",
  vatRate: 17,

  // Free shipping threshold (ILS)
  freeShippingMin: 300,
} as const;

/** Build a WhatsApp deep link with a pre-filled message */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
