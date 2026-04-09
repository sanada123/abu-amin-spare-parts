'use client';
import { useEffect, useState } from 'react';
import { Tag, X } from 'lucide-react';

interface Promo {
  id: number;
  name: string;
  type: string;
  value: number;
  code: string | null;
  endDate: string;
}

export default function PromoBanner() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((d) => setPromos(d.promotions ?? []))
      .catch(() => {});
  }, []);

  const visible = promos.filter((p) => !dismissed.has(p.id));
  if (visible.length === 0) return null;

  const promo = visible[0];
  const daysLeft = Math.ceil((new Date(promo.endDate).getTime() - Date.now()) / 86400000);

  let label = promo.name;
  if (promo.type === 'percentage') label += ` — ${promo.value}% הנחה`;
  if (promo.type === 'fixed') label += ` — ₪${promo.value} הנחה`;
  if (promo.code) label += ` | קוד: ${promo.code}`;

  return (
    <div className="bg-[#FFC424] text-black text-sm font-bold py-2 px-4 flex items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Tag size={15} className="shrink-0" />
        <span className="truncate">{label}</span>
        {daysLeft <= 7 && (
          <span className="bg-black text-[#FFC424] text-xs px-2 py-0.5 rounded-full shrink-0">
            {daysLeft === 1 ? 'יום אחרון!' : `${daysLeft} ימים`}
          </span>
        )}
      </div>
      <button
        onClick={() => setDismissed((s) => new Set([...s, promo.id]))}
        className="shrink-0 hover:opacity-70"
        aria-label="סגור"
      >
        <X size={16} />
      </button>
    </div>
  );
}
