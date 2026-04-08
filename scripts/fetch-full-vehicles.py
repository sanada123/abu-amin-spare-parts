#!/usr/bin/env python3
"""
Fetch FULL vehicle data from data.gov.il (4.1M records)
Generates vehicles-israel.ts with complete year/model coverage
Run: python3 scripts/fetch-full-vehicles.py > /tmp/vehicles-build.log 2>&1 &
"""

import urllib.request, json, time, re
import sys

resource = "053cea08-09bc-40ec-8f7a-156f0677aff3"
base = "https://data.gov.il/api/3/action/datastore_search"

make_years = {}
offset = 0
limit = 20000  # Larger batches
total_fetched = 0

def normalize(nm):
    if not nm: return ''
    n = re.sub(
        r'[\s\-]+(יפן|קוריאה|גרמניה|ארהב|ארה"ב|טורקיה|צרפת|אנגליה|איטליה|תאילנד|אוסט\S*|צ.כיה|סלובקיה|תורכיה|ספרד|בלגיה|פולין|הודו|סין|מקסיקו|שבדיה|הונג\S*|בריטניה|הולנד|טיוואן|אוסטרליה|רוסיה|פורטוגל|רומניה|הונגריה|סלובניה|פינלנד|דנמרק|נורבגיה|שווייץ|אירלנד|קנדה|ברזיל|דרום\S*|אפריקה)\b.*$',
        '', nm
    ).strip()
    fixes = {
        'ב מ וו': 'BMW',
        'ב.מ.וו': 'BMW',
        'מרצדס בנץ': 'מרצדס-בנץ',
        'מרצדס-בנץ': 'מרצדס-בנץ',
    }
    return fixes.get(n, n)

MAKE_EN = {
    'טויוטה': ('toyota', 'Toyota'),
    'יונדאי': ('hyundai', 'Hyundai'),
    'קיה': ('kia', 'Kia'),
    'מזדה': ('mazda', 'Mazda'),
    'ניסאן': ('nissan', 'Nissan'),
    'הונדה': ('honda', 'Honda'),
    'סוזוקי': ('suzuki', 'Suzuki'),
    'מרצדס-בנץ': ('mercedes-benz', 'Mercedes-Benz'),
    'BMW': ('bmw', 'BMW'),
    'אאודי': ('audi', 'Audi'),
    'פולקסווגן': ('volkswagen', 'Volkswagen'),
    'פיג\'ו': ('peugeot', 'Peugeot'),
    'רנו': ('renault', 'Renault'),
    'סיטרואן': ('citroen', 'Citroen'),
    'פיאט': ('fiat', 'Fiat'),
    'פורד': ('ford', 'Ford'),
    'שברולט': ('chevrolet', 'Chevrolet'),
    'מיצובישי': ('mitsubishi', 'Mitsubishi'),
    'סובארו': ('subaru', 'Subaru'),
    'וולבו': ('volvo', 'Volvo'),
    'סקודה': ('skoda', 'Skoda'),
    'סיאט': ('seat', 'Seat'),
    'דאציה': ('dacia', 'Dacia'),
    'לקסוס': ('lexus', 'Lexus'),
    'פורשה': ('porsche', 'Porsche'),
    'אלפא רומיאו': ('alfa-romeo', 'Alfa Romeo'),
    'מזארטי': ('maserati', 'Maserati'),
    'ג\'יפ': ('jeep', 'Jeep'),
    'סאנגיונג': ('ssangyong', 'SsangYong'),
}

print("Starting FULL pull from data.gov.il...")
sys.stdout.flush()

while True:
    url = f"{base}?resource_id={resource}&limit={limit}&offset={offset}&fields=tozeret_nm,kinuy_mishari,shnat_yitzur,sug_degem"
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            d = json.loads(r.read())
        records = d['result']['records']
        if not records:
            break
        
        for rec in records:
            if rec.get('sug_degem') != 'P': continue
            yr = rec.get('shnat_yitzur', 0)
            if not yr or yr < 2010: continue
            raw = (rec.get('tozeret_nm') or '').strip()
            model = (rec.get('kinuy_mishari') or '').strip().upper()
            if not raw or not model: continue
            norm = normalize(raw)
            if not norm: continue
            if norm not in make_years:
                make_years[norm] = {'years': set(), 'models': set()}
            make_years[norm]['years'].add(int(yr))
            make_years[norm]['models'].add(model)
        
        total_fetched += len(records)
        offset += limit
        
        if total_fetched % 200000 == 0:
            print(f"  {total_fetched:,} records, {len(make_years)} makes...")
            sys.stdout.flush()
        
        if len(records) < limit:
            break
        time.sleep(0.01)
    except Exception as e:
        print(f"  Error @{offset}: {e}, retrying...")
        sys.stdout.flush()
        time.sleep(2)
        continue

print(f"\nDone. {total_fetched:,} records, {len(make_years)} makes")

# Generate TS file
lines = [
    '// AUTO-GENERATED from data.gov.il full dataset',
    f'// Generated: {time.strftime("%Y-%m-%d %H:%M:%S")}',
    f'// Records scanned: {total_fetched:,}',
    f'// Unique makes: {len(make_years)}',
    '',
    'export interface IsraelMake {',
    '  slug: string;',
    '  nameHe: string;',
    '  nameEn: string;',
    '  logoSlug: string;',
    '  models: string[];',
    '  years: number[];',
    '}',
    '',
    'export const israelMakes: IsraelMake[] = [',
]

for make_he, v in sorted(make_years.items(), key=lambda x: -len(x[1]['models'])):
    if len(v['years']) < 2 and len(v['models']) < 3:
        continue  # Skip tiny makes
    
    slug, name_en = MAKE_EN.get(make_he, (make_he.lower().replace(' ', '-'), make_he))
    years = sorted(v['years'])
    models = sorted(list(v['models']))[:150]  # Cap at 150 models per make
    
    lines += [
        '  {',
        f'    slug: {json.dumps(slug)},',
        f'    nameHe: {json.dumps(make_he)},',
        f'    nameEn: {json.dumps(name_en)},',
        f'    logoSlug: {json.dumps(slug)},',
        f'    models: {json.dumps(models)},',
        f'    years: {json.dumps(years)},',
        '  },',
    ]

lines += [
    '];',
    '',
    'export function getMakeBySlug(slug: string) {',
    '  return israelMakes.find(m => m.slug === slug);',
    '}',
    '',
    'export function getLogoUrl(logoSlug: string): string {',
    '  return `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${logoSlug}.png`;',
    '}',
]

output = '\n'.join(lines)
with open('lib/vehicles-israel.ts', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Written lib/vehicles-israel.ts ({len(lines)} lines)")
