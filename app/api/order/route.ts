import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";

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

let _orderSeq = 0;
function generateOrderId(): string {
  const date = new Date();
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const ts = String(date.getTime()).slice(-5);
  _orderSeq = (_orderSeq + 1) % 1000;
  const seq = String(_orderSeq).padStart(3, "0");
  return `A-${yy}${mm}${dd}-${ts}${seq}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatTelegramMessage(order: StoredOrder): string {
  const partsLines = order.parts
    .map((p) => `• ${escapeHtml(p.name)}${p.partNumber ? ` (${escapeHtml(p.partNumber)})` : ""} — ₪${p.priceIls * p.qty}${p.qty > 1 ? ` x${p.qty}` : ""}`)
    .join("\n");

  const date = new Date(order.createdAt).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `🛠️ הזמנה חדשה — אבו אמין חלפים

👤 ${escapeHtml(order.name)}
📞 ${escapeHtml(order.phone)}
📍 ${escapeHtml(order.city)}
🚗 ${escapeHtml(order.vehicle || '')}

📦 פריטים:
${partsLines}

💰 סה"כ: ₪${order.subtotal} (לא כולל מע"מ)
${order.notes ? `\n📝 הערות: ${escapeHtml(order.notes)}` : ""}
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

    // Input validation
    if (!body.name || typeof body.name !== 'string' || body.name.length > 200) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!body.phone || typeof body.phone !== 'string' || body.phone.length > 20) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
    if (!body.city || typeof body.city !== 'string' || body.city.length > 100) {
      return NextResponse.json({ error: "Invalid city" }, { status: 400 });
    }
    if (!Array.isArray(body.parts) || body.parts.length === 0 || body.parts.length > 50) {
      return NextResponse.json({ error: "Invalid parts list" }, { status: 400 });
    }
    if (body.notes && (typeof body.notes !== 'string' || body.notes.length > 1000)) {
      return NextResponse.json({ error: "Notes too long" }, { status: 400 });
    }
    if (body.vehicle && (typeof body.vehicle !== 'string' || body.vehicle.length > 200)) {
      return NextResponse.json({ error: "Invalid vehicle" }, { status: 400 });
    }

    // Sanitize parts
    for (const part of body.parts) {
      if (!part.name || typeof part.name !== 'string' || part.name.length > 200) {
        return NextResponse.json({ error: "Invalid part name" }, { status: 400 });
      }
      if (typeof part.qty !== 'number' || part.qty < 1 || part.qty > 999) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }
      if (typeof part.priceIls !== 'number' || part.priceIls < 0 || part.priceIls > 100000) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
    }

    const order: StoredOrder = {
      ...body,
      name: body.name.trim().slice(0, 200),
      phone: body.phone.trim().slice(0, 20),
      city: body.city.trim().slice(0, 100),
      notes: (body.notes || '').trim().slice(0, 1000),
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // Store order — try DB first, fall back to JSON file
    let savedToDb = false;
    if (prisma) {
      try {
        const customer = await prisma.customer.upsert({
          where: { phone: order.phone },
          update: { name: order.name },
          create: { name: order.name, phone: order.phone, type: "private" },
        });
        await prisma.order.create({
          data: {
            orderNumber: order.id,
            customerId: customer.id,
            vehicleInfo: order.vehicle || null,
            subtotal: order.subtotal,
            vatRate: 17,
            vatAmount: Math.round(order.subtotal * 0.17 * 100) / 100,
            total: Math.round(order.subtotal * 1.17 * 100) / 100,
            notes: order.notes || null,
            channel: "whatsapp",
            status: "new",
          },
        });
        savedToDb = true;
      } catch (dbErr) {
        console.error("Failed to save order to DB, falling back to JSON:", dbErr);
      }
    }

    // Fallback: save to JSON file (also serves as backup)
    try {
      const orders = await readOrders();
      orders.unshift(order);
      await writeOrders(orders);
    } catch {
      // JSON write may fail on ephemeral FS — non-critical if DB saved
      if (!savedToDb) console.error("Failed to save order to both DB and JSON file");
    }

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
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    console.error("[order-GET] ADMIN_API_KEY not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await readOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${apiKey}`) {
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
