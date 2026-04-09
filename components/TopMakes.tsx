"use client";
import { useRouter } from "next/navigation";
import { getLogoUrl } from "@/lib/vehicles-israel";
import { useLocale } from "@/lib/cart";

const TOP_MAKES = [
  { slug: "toyota", nameHe: "טויוטה", nameAr: "تويوتا", nameEn: "Toyota" },
  { slug: "hyundai", nameHe: "יונדאי", nameAr: "هيونداي", nameEn: "Hyundai" },
  { slug: "kia", nameHe: "קיה", nameAr: "كيا", nameEn: "Kia" },
  { slug: "mazda", nameHe: "מזדה", nameAr: "مازدا", nameEn: "Mazda" },
  { slug: "nissan", nameHe: "ניסאן", nameAr: "نيسان", nameEn: "Nissan" },
  { slug: "volkswagen", nameHe: "פולקסווגן", nameAr: "فولكسفاجن", nameEn: "VW" },
  { slug: "bmw", nameHe: "BMW", nameAr: "BMW", nameEn: "BMW" },
  { slug: "mercedes-benz", nameHe: "מרצדס", nameAr: "مرسيدس", nameEn: "Mercedes" },
  { slug: "skoda", nameHe: "סקודה", nameAr: "سكودا", nameEn: "Skoda" },
  { slug: "renault", nameHe: "רנו", nameAr: "رينو", nameEn: "Renault" },
  { slug: "subaru", nameHe: "סובארו", nameAr: "سوبارو", nameEn: "Subaru" },
  { slug: "audi", nameHe: "אאודי", nameAr: "أودي", nameEn: "Audi" },
];

export default function TopMakes() {
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="makes-strip">
      {TOP_MAKES.map((m) => {
        const label = locale === "ar" ? m.nameAr : m.nameHe;

        return (
          <button
            key={m.slug}
            className="make-card"
            onClick={() => router.push(`/catalog?make=${m.slug}`)}
            aria-label={label}
          >
            <img
              src={getLogoUrl(m.slug)}
              alt=""
              aria-hidden="true"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
