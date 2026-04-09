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

// Locale — Hebrew only
export function getLocale(): "he" {
  if (typeof window === "undefined") return "he";
  // Migrate any stored "ar" back to "he"
  const l = localStorage.getItem(LOCALE_KEY);
  if (l !== "he") localStorage.setItem(LOCALE_KEY, "he");
  return "he";
}
export function setLocale(_l: "he") {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_KEY, "he");
  document.documentElement.lang = "he";
  document.documentElement.dir = "rtl";
  emit();
}
export function useLocale(): "he" {
  useEffect(() => {
    getLocale(); // migrate stored ar → he
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
  }, []);
  return "he";
}
