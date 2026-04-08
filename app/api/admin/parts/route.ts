import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TOKEN = "Bearer admin-abu-amin-2026";
const DATA_FILE = path.join(process.cwd(), "data", "catalog.json");

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { parts: [], kits: [] };
  }
}
function writeData(d: object) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}
function auth(req: NextRequest) {
  return req.headers.get("authorization") === TOKEN;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = readData();
  return NextResponse.json({ parts: data.parts || [] });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const data = readData();
  const maxId = (data.parts || []).reduce((m: number, p: { id: number }) => Math.max(m, p.id), 0);
  const newPart = { ...body, id: maxId + 1 };
  data.parts = [...(data.parts || []), newPart];
  writeData(data);
  return NextResponse.json(newPart, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const data = readData();
  data.parts = (data.parts || []).map((p: { id: number }) => p.id === body.id ? { ...p, ...body } : p);
  writeData(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  const data = readData();
  data.parts = (data.parts || []).filter((p: { id: number }) => p.id !== id);
  writeData(data);
  return NextResponse.json({ ok: true });
}
