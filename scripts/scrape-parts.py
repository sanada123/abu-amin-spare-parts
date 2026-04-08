#!/usr/bin/env python3
"""
Scrape real auto parts data from Wikipedia + Commons.
Downloads images locally + builds complete catalog with hierarchy.
"""
import os, json, re, urllib.request, urllib.parse, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "public" / "parts"
IMG_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT = ROOT / "data" / "scraped-catalog.json"

UA = "Mozilla/5.0 AbuAminBot/1.0"

# Full hierarchy of auto parts with Wikipedia article names
HIERARCHY = {
    "brakes": {
        "name_he": "בלמים", "name_en": "Brakes", "name_ar": "المكابح",
        "icon": "🛑",
        "parts": [
            {"slug": "brake-pad", "wiki": "Brake_pad", "he": "רפידות בלם", "ar": "وسادات المكابح"},
            {"slug": "disc-brake", "wiki": "Disc_brake", "he": "דיסק בלם", "ar": "قرص المكبح"},
            {"slug": "brake-caliper", "wiki": "Disc_brake", "he": "קליפר בלם", "ar": "ملاقط المكابح"},
            {"slug": "brake-fluid", "wiki": "Brake_fluid", "he": "נוזל בלמים", "ar": "سائل المكابح"},
            {"slug": "brake-shoe", "wiki": "Brake_shoe", "he": "נעל בלם", "ar": "حذاء المكبح"},
        ]
    },
    "engine": {
        "name_he": "מנוע", "name_en": "Engine", "name_ar": "المحرك",
        "icon": "⚙️",
        "parts": [
            {"slug": "spark-plug", "wiki": "Spark_plug", "he": "מצת", "ar": "شمعة الإشعال"},
            {"slug": "timing-belt", "wiki": "Timing_belt_(camshaft)", "he": "רצועת תזמון", "ar": "حزام التوقيت"},
            {"slug": "piston", "wiki": "Piston", "he": "בוכנה", "ar": "مكبس"},
            {"slug": "camshaft", "wiki": "Camshaft", "he": "גל זיזים", "ar": "عمود الكامات"},
            {"slug": "cylinder-head", "wiki": "Cylinder_head", "he": "ראש מנוע", "ar": "رأس الاسطوانة"},
            {"slug": "turbocharger", "wiki": "Turbocharger", "he": "טורבו", "ar": "شاحن توربيني"},
        ]
    },
    "filters": {
        "name_he": "מסננים", "name_en": "Filters", "name_ar": "المرشحات",
        "icon": "🧽",
        "parts": [
            {"slug": "oil-filter", "wiki": "Oil_filter", "he": "מסנן שמן", "ar": "مرشح الزيت"},
            {"slug": "air-filter", "wiki": "Air_filter", "he": "מסנן אוויר", "ar": "مرشح الهواء"},
            {"slug": "fuel-filter", "wiki": "Fuel_filter", "he": "מסנן דלק", "ar": "مرشح الوقود"},
            {"slug": "cabin-filter", "wiki": "Cabin_air_filter", "he": "מסנן מזגן", "ar": "مرشح المقصورة"},
        ]
    },
    "suspension": {
        "name_he": "מתלים", "name_en": "Suspension", "name_ar": "نظام التعليق",
        "icon": "🔧",
        "parts": [
            {"slug": "shock-absorber", "wiki": "Shock_absorber", "he": "בולם זעזועים", "ar": "ماص الصدمات"},
            {"slug": "coil-spring", "wiki": "Coil_spring", "he": "קפיץ סלילי", "ar": "نابض لولبي"},
            {"slug": "strut", "wiki": "Strut", "he": "מוט תמיכה", "ar": "دعامة"},
            {"slug": "control-arm", "wiki": "Control_arm", "he": "זרוע בקרה", "ar": "ذراع التحكم"},
            {"slug": "ball-joint", "wiki": "Ball_joint", "he": "מפרק כדורי", "ar": "مفصل كروي"},
        ]
    },
    "electrical": {
        "name_he": "חשמל", "name_en": "Electrical", "name_ar": "الكهرباء",
        "icon": "⚡",
        "parts": [
            {"slug": "alternator", "wiki": "Alternator", "he": "אלטרנטור", "ar": "مولد التيار المتردد"},
            {"slug": "starter", "wiki": "Starter_(engine)", "he": "מתנע", "ar": "بادئ التشغيل"},
            {"slug": "battery", "wiki": "Automotive_battery", "he": "מצבר", "ar": "البطارية"},
            {"slug": "ignition-coil", "wiki": "Ignition_coil", "he": "סליל הצתה", "ar": "ملف الإشعال"},
        ]
    },
    "cooling": {
        "name_he": "קירור", "name_en": "Cooling", "name_ar": "التبريد",
        "icon": "❄️",
        "parts": [
            {"slug": "radiator", "wiki": "Radiator_(engine_cooling)", "he": "רדיאטור", "ar": "الرادياتير"},
            {"slug": "thermostat", "wiki": "Thermostat", "he": "תרמוסטט", "ar": "الترموستات"},
            {"slug": "water-pump", "wiki": "Pump#Centrifugal_pumps", "he": "משאבת מים", "ar": "مضخة الماء"},
            {"slug": "coolant", "wiki": "Antifreeze", "he": "מי צינון", "ar": "سائل التبريد"},
        ]
    },
    "transmission": {
        "name_he": "גיר", "name_en": "Transmission", "name_ar": "ناقل الحركة",
        "icon": "🔩",
        "parts": [
            {"slug": "clutch", "wiki": "Clutch", "he": "קלאץ'", "ar": "القابض"},
            {"slug": "cv-joint", "wiki": "Constant-velocity_joint", "he": "מפרק CV", "ar": "مفصل سرعة ثابتة"},
            {"slug": "drive-shaft", "wiki": "Drive_shaft", "he": "גל הנעה", "ar": "عمود الدوران"},
            {"slug": "gearbox", "wiki": "Transmission_(mechanics)", "he": "תיבת הילוכים", "ar": "صندوق التروس"},
        ]
    },
    "exhaust": {
        "name_he": "פליטה", "name_en": "Exhaust", "name_ar": "العادم",
        "icon": "💨",
        "parts": [
            {"slug": "muffler", "wiki": "Muffler", "he": "מופלר", "ar": "كاتم الصوت"},
            {"slug": "catalytic-converter", "wiki": "Catalytic_converter", "he": "ממיר קטליטי", "ar": "المحول الحفاز"},
            {"slug": "oxygen-sensor", "wiki": "Oxygen_sensor", "he": "חיישן חמצן", "ar": "حساس الأكسجين"},
        ]
    },
    "lighting": {
        "name_he": "תאורה", "name_en": "Lighting", "name_ar": "الإضاءة",
        "icon": "💡",
        "parts": [
            {"slug": "headlight", "wiki": "Headlamp", "he": "פנס קדמי", "ar": "المصباح الأمامي"},
            {"slug": "tail-light", "wiki": "Automotive_lighting", "he": "פנס אחורי", "ar": "المصباح الخلفي"},
            {"slug": "led-bulb", "wiki": "LED_lamp", "he": "נורת LED", "ar": "مصباح LED"},
        ]
    },
    "oils-fluids": {
        "name_he": "שמנים ונוזלים", "name_en": "Oils & Fluids", "name_ar": "الزيوت والسوائل",
        "icon": "🛢️",
        "parts": [
            {"slug": "motor-oil", "wiki": "Motor_oil", "he": "שמן מנוע", "ar": "زيت المحرك"},
            {"slug": "transmission-fluid", "wiki": "Automatic_transmission_fluid", "he": "שמן גיר", "ar": "سائل ناقل الحركة"},
            {"slug": "power-steering-fluid", "wiki": "Power_steering", "he": "שמן הגה כוח", "ar": "سائل التوجيه"},
        ]
    },
    "tires-wheels": {
        "name_he": "צמיגים וגלגלים", "name_en": "Tires & Wheels", "name_ar": "الإطارات والعجلات",
        "icon": "🛞",
        "parts": [
            {"slug": "tire", "wiki": "Tire", "he": "צמיג", "ar": "الإطار"},
            {"slug": "wheel", "wiki": "Alloy_wheel", "he": "חישוק", "ar": "العجلة"},
            {"slug": "wheel-bearing", "wiki": "Wheel_hub_assembly", "he": "מיסב גלגל", "ar": "محمل العجلة"},
        ]
    },
    "body": {
        "name_he": "מרכב", "name_en": "Body", "name_ar": "الهيكل",
        "icon": "🚗",
        "parts": [
            {"slug": "bumper", "wiki": "Bumper_(car)", "he": "פגוש", "ar": "المصد"},
            {"slug": "side-mirror", "wiki": "Wing_mirror", "he": "מראת צד", "ar": "مرآة جانبية"},
            {"slug": "windshield", "wiki": "Windshield", "he": "שמשה קדמית", "ar": "الزجاج الأمامي"},
            {"slug": "wiper-blade", "wiki": "Windscreen_wiper", "he": "להב מגב", "ar": "شفرة الممسحة"},
        ]
    },
}

def fetch_wiki(titles):
    """Get image + summary + infobox for wiki articles in batch."""
    titles_str = "|".join(titles)
    url = (
        "https://en.wikipedia.org/w/api.php?action=query"
        f"&prop=pageimages|extracts|pageterms"
        f"&titles={urllib.parse.quote(titles_str)}"
        "&piprop=thumbnail&pithumbsize=640"
        "&exintro=1&explaintext=1&exsentences=3"
        "&format=json&redirects=1"
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)

def download_image(url, slug):
    """Download image and save locally. Returns relative path."""
    try:
        ext = url.split(".")[-1].split("?")[0].lower()
        if ext not in ("jpg", "jpeg", "png", "webp"):
            ext = "jpg"
        filename = f"{slug}.{ext}"
        filepath = IMG_DIR / filename
        if filepath.exists():
            return f"/parts/{filename}"
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        with open(filepath, "wb") as f:
            f.write(data)
        print(f"  ✓ {filename} ({len(data)//1024}KB)")
        return f"/parts/{filename}"
    except Exception as e:
        print(f"  ✗ {slug}: {e}")
        return None

def main():
    print("🔍 Scraping Wikipedia for auto parts catalog...\n")
    catalog = {"categories": [], "parts": [], "scraped_at": int(time.time())}
    part_id = 1

    for cat_slug, cat_data in HIERARCHY.items():
        print(f"\n📁 {cat_data['name_en']} ({cat_slug})")
        catalog["categories"].append({
            "slug": cat_slug,
            "name": {"he": cat_data["name_he"], "en": cat_data["name_en"], "ar": cat_data["name_ar"]},
            "icon": cat_data["icon"],
        })

        # Batch fetch wiki data
        titles = [p["wiki"] for p in cat_data["parts"]]
        try:
            wiki_data = fetch_wiki(titles)
            pages = wiki_data.get("query", {}).get("pages", {})
        except Exception as e:
            print(f"  wiki fetch failed: {e}")
            pages = {}

        # Map wiki title → page
        wiki_by_title = {}
        for p in pages.values():
            wiki_by_title[p.get("title", "").replace(" ", "_")] = p

        for part in cat_data["parts"]:
            page = wiki_by_title.get(part["wiki"]) or next(
                (p for p in pages.values() if part["wiki"].replace("_", " ").lower() in p.get("title", "").lower()),
                None
            )
            img_url = page.get("thumbnail", {}).get("source") if page else None
            description = (page.get("extract", "") if page else "")[:300]

            local_img = None
            if img_url:
                local_img = download_image(img_url, part["slug"])
                time.sleep(1.5)  # be nice to Wikimedia

            catalog["parts"].append({
                "id": part_id,
                "slug": part["slug"],
                "categorySlug": cat_slug,
                "name": {"he": part["he"], "en": part["wiki"].replace("_", " "), "ar": part["ar"]},
                "description": description,
                "image": local_img or f"/parts/placeholder.jpg",
                "source": f"https://en.wikipedia.org/wiki/{part['wiki']}",
            })
            part_id += 1

    # Save
    OUTPUT.parent.mkdir(exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"\n✅ DONE")
    print(f"   Categories: {len(catalog['categories'])}")
    print(f"   Parts: {len(catalog['parts'])}")
    print(f"   Output: {OUTPUT}")
    print(f"   Images: {IMG_DIR}")

if __name__ == "__main__":
    main()
