"use client";
import { useEffect, useState } from "react";

export interface CartItem {
  partId: number;
  skuId: number;
  qty: number;
}

const CART_KEY = "abu-amin-cart";
const VEHICLE_KEY = "abu-amin-vehicle";
const LOCALE_KEY = "abu-amin-locale";

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  listeners.forEach((l) => l());
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  emit();
}
export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((c) => c.skuId === item.skuId);
  if (existing) existing.qty += item.qty;
  else cart.push(item);
  setCart(cart);
}
export function removeFromCart(skuId: number) {
  setCart(getCart().filter((c) => c.skuId !== skuId));
}
export function updateQty(skuId: number, qty: number) {
  const cart = getCart();
  const item = cart.find((c) => c.skuId === skuId);
  if (item) {
    item.qty = Math.max(1, qty);
    setCart(cart);
  }
}
export function clearCart() {
  setCart([]);
}

export function useCart() {
  const [cart, setLocalCart] = useState<CartItem[]>([]);
  useEffect(() => {
    setLocalCart(getCart());
    const l = () => setLocalCart(getCart());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return cart;
}

// Active vehicle
export function getActiveVehicleId(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(VEHICLE_KEY);
  return v ? parseInt(v, 10) : null;
}
export function setActiveVehicleId(id: number | null) {
  if (typeof window === "undefined") return;
  if (id === null) localStorage.removeItem(VEHICLE_KEY);
  else localStorage.setItem(VEHICLE_KEY, String(id));
  emit();
}
export function useActiveVehicleId() {
  const [id, setId] = useState<number | null>(null);
  useEffect(() => {
    setId(getActiveVehicleId());
    const l = () => setId(getActiveVehicleId());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return id;
}

// Locale persistence — Hebrew + Arabic only
export function getLocale(): "he" | "ar" {
  if (typeof window === "undefined") return "he";
  const l = localStorage.getItem(LOCALE_KEY) as "he" | "ar" | null;
  if (l === "he" || l === "ar") return l;
  return "he";
}
export function setLocale(l: "he" | "ar") {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_KEY, l);
  document.documentElement.lang = l;
  document.documentElement.dir = "rtl";
  emit();
}
export function useLocale(): "he" | "ar" {
  const [l, setL] = useState<"he" | "ar">("he");
  useEffect(() => {
    const cur = getLocale();
    setL(cur);
    document.documentElement.lang = cur;
    document.documentElement.dir = "rtl";
    const lis = () => setL(getLocale());
    listeners.add(lis);
    return () => {
      listeners.delete(lis);
    };
  }, []);
  return l;
}
