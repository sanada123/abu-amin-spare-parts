import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json");

interface OrderPart {
  name: string;
  partNumber: string;
  priceIls: number;
  qty: number;
}

interface OrderPayload {
  name: string;
  phone: string;
  city: string;
  notes: string;
  vehicle: string;
  parts: OrderPart[];
  subtotal: number;
  locale: string;
}

interface StoredOrder extends OrderPayload {
  id: string;
  createdAt: string;
  status: "new" | "confirmed" | "shipped" | "delivered" | "handled";
}

async function readOrders(): Promise<StoredOrder[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeOrders(orders: StoredOrder[]) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

function generateOrderId(): string {
  const date = new Date();
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `A-${yy}${mm}${dd}-${rand}`;
}

function formatTelegramMessage(order: StoredOrder): string {
  const partsLines = order.parts
    .map((p) => `• ${p.name}${p.partNumber ? ` (${p.partNumber})` : ""} — ₪${p.priceIls * p.qty}${p.qty > 1 ? ` x${p.qty}` : ""}`)
    .join("\n");

  const date = new Date(order.createdAt).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `🛠️ הזמנה חדשה — אבו אמין חלפים

👤 ${order.name}
📞 ${order.phone}
📍 ${order.city}
🚗 ${order.vehicle}

📦 פריטים:
${partsLines}

💰 סה"כ: ₪${order.subtotal} (לא כולל מע"מ)
${order.notes ? `\n📝 הערות: ${order.notes}` : ""}
───
הזמנה #${order.id} · ${date}`;
}

async function sendTelegram(message: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderPayload = await req.json();

    if (!body.name || !body.phone || !body.city || !body.parts?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order: StoredOrder = {
      ...body,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // Store order
    const orders = await readOrders();
    orders.unshift(order);
    await writeOrders(orders);

    // Send Telegram notification (non-blocking failure)
    const message = formatTelegramMessage(order);
    await sendTelegram(message);

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const expectedAuth = `Bearer ${process.env.ADMIN_API_KEY || "admin-abu-amin-2026"}`;
  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await readOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const expectedAuth = `Bearer ${process.env.ADMIN_API_KEY || "admin-abu-amin-2026"}`;
  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  const orders = await readOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  order.status = status;
  await writeOrders(orders);
  return NextResponse.json({ success: true });
}
