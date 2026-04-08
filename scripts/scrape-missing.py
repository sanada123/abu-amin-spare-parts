#!/usr/bin/env python3
"""Re-fetch missing part images using Wikimedia REST API with identifying User-Agent."""
import os, json, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "public" / "parts"
CATALOG = ROOT / "data" / "scraped-catalog.json"

# Wikimedia requires descriptive User-Agent
UA = "AbuAminSpareParts/1.0 (https://abu-amin-spare-parts-production.up.railway.app/; admin@abu-amin.co.il)"

MISSING = {
    "brake-fluid": "Brake_fluid",
    "brake-shoe": "Brake_shoe",
    "spark-plug": "Spark_plug",
    "timing-belt": "Timing_belt_(camshaft)",
    "air-filter": "Air_filter",
    "fuel-filter": "Fuel_filter",
    "cabin-filter": "Cabin_air_filter",
    "shock-absorber": "Shock_absorber",
    "coil-spring": "Coil_spring",
    "strut": "Strut",
    "ball-joint": "Ball_joint",
    "starter": "Starter_(engine)",
    "radiator": "Radiator_(engine_cooling)",
    "thermostat": "Thermostat",
    "water-pump": "Pump",
    "coolant": "Antifreeze",
    "gearbox": "Transmission_(mechanics)",
    "muffler": "Muffler",
    "oxygen-sensor": "Oxygen_sensor",
    "tail-light": "Automotive_lighting",
    "led-bulb": "LED_lamp",
    "transmission-fluid": "Automatic_transmission_fluid",
    "power-steering-fluid": "Power_steering",
    "tire": "Tire",
    "wheel": "Alloy_wheel",
    "bumper": "Bumper_(car)",
    "side-mirror": "Wing_mirror",
    "windshield": "Windshield",
}

def fetch_summary(title):
    """Use REST API which has different limits + returns thumbnail URL."""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)

def download(url, slug):
    try:
        ext = url.split(".")[-1].split("?")[0].lower()
        if ext not in ("jpg", "jpeg", "png", "webp", "svg"):
            ext = "jpg"
        filepath = IMG_DIR / f"{slug}.{ext}"
        if filepath.exists() and filepath.stat().st_size > 1000:
            return f"/parts/{filepath.name}"
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        with open(filepath, "wb") as f:
            f.write(data)
        print(f"  ✓ {filepath.name} ({len(data)//1024}KB)")
        return f"/parts/{filepath.name}"
    except Exception as e:
        print(f"  ✗ {slug}: {e}")
        return None

import urllib.parse
ok = 0
fail = 0
for slug, title in MISSING.items():
    try:
        summary = fetch_summary(title)
        img_url = (summary.get("thumbnail", {}) or {}).get("source") or \
                  (summary.get("originalimage", {}) or {}).get("source")
        if img_url:
            result = download(img_url, slug)
            if result: ok += 1
            else: fail += 1
        else:
            print(f"  · {slug}: no image")
            fail += 1
        time.sleep(2.0)  # gentle
    except Exception as e:
        print(f"  ✗ {slug}: {e}")
        fail += 1
        time.sleep(3.0)

print(f"\n✅ Done: {ok} ok, {fail} failed")
print(f"Total images in {IMG_DIR}: {len(list(IMG_DIR.glob('*')))}")
