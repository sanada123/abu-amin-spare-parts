import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TOKEN = "Bearer admin-abu-amin-2026";
const DATA_FILE = path.join(process.cwd(), "data", "catalog.json");

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); }
  catch { return { parts: [], kits: [] }; }
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
  return NextResponse.json({ kits: readData().kits || [] });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const data = readData();
  const maxId = (data.kits || []).reduce((m: number, k: { id: number }) => Math.max(m, k.id), 0);
  const newKit = { ...body, id: maxId + 1 };
  data.kits = [...(data.kits || []), newKit];
  writeData(data);
  return NextResponse.json(newKit, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  const data = readData();
  data.kits = (data.kits || []).filter((k: { id: number }) => k.id !== id);
  writeData(data);
  return NextResponse.json({ ok: true });
}
