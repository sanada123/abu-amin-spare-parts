# Admin System — Full E-commerce Backend (Shopify-level)

## Architecture

```
┌─────────────────────────────────────────┐
│  PostgreSQL (Railway)                    │
│  ├── products, skus, categories          │
│  ├── brands, vehicles, fitments          │
│  ├── orders, order_items                 │
│  ├── customers                           │
│  ├── promotions, coupons                 │
│  ├── media (images metadata)             │
│  └── settings                            │
├─────────────────────────────────────────┤
│  Prisma ORM                              │
├─────────────────────────────────────────┤
│  Next.js API Routes (/api/admin/*)       │
│  Auth: cookie-based (admin password)     │
├─────────────────────────────────────────┤
│  Admin UI (/admin/*)                     │
│  React client components                 │
├─────────────────────────────────────────┤
│  Storefront (/catalog, /part/[slug])     │
│  Reads from same DB via Prisma           │
└─────────────────────────────────────────┘
```

## Stack
- **DB:** PostgreSQL on Railway (free tier → paid as needed)
- **ORM:** Prisma (type-safe, migrations, seeding)
- **Auth:** Simple admin password → bcrypt cookie session (no NextAuth overhead)
- **Images:** Upload to /public/uploads/ (Railway disk) or Bunny CDN later
- **Real-time:** No WebSocket needed — admin refreshes, storefront reads latest from DB

## Database Schema (Prisma)

### Core Tables

```prisma
model Category {
  id          Int        @id @default(autoincrement())
  slug        String     @unique
  name        String     // Hebrew
  icon        String?    // Lucide icon name
  parentId    Int?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  group       String?    // "auto" | "tools" | "garden"
  position    Int        @default(0)
  isActive    Boolean    @default(true)
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Brand {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  logo      String?  // URL or path
  country   String?  // "🇩🇪", "🇯🇵" etc
  isActive  Boolean  @default(true)
  skus      Sku[]
  createdAt DateTime @default(now())
}

model Vehicle {
  id        Int      @id @default(autoincrement())
  make      String   // "Toyota"
  makeHe    String   // "טויוטה"
  model     String   // "Corolla"
  modelHe   String   // "קורולה"
  year      Int
  engine    String?  // "1.6L"
  isActive  Boolean  @default(true)
  fitments  Fitment[]
  createdAt DateTime @default(now())

  @@unique([make, model, year, engine])
}

model Product {
  id             Int        @id @default(autoincrement())
  slug           String     @unique
  name           String     // Hebrew name
  description    String?    // Hebrew description
  categoryId     Int
  category       Category   @relation(fields: [categoryId], references: [id])
  images         String[]   // Array of URLs/paths
  isActive       Boolean    @default(true)
  isFeatured     Boolean    @default(false)
  position       Int        @default(0)
  skus           Sku[]
  fitments       Fitment[]
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}

model Sku {
  id              Int      @id @default(autoincrement())
  partNumber      String   @unique
  productId       Int
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  brandId         Int
  brand           Brand    @relation(fields: [brandId], references: [id])
  tier            String   // "original" | "replacement"
  priceIls        Float
  costIls         Float?   // Purchase cost (admin only, hidden from storefront)
  stock           Int      @default(0)
  minStock        Int      @default(5) // Low stock alert threshold
  deliveryDays    Int      @default(3)
  warrantyMonths  Int      @default(12)
  weight          Float?   // kg
  isActive        Boolean  @default(true)
  orderItems      OrderItem[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Fitment {
  id        Int      @id @default(autoincrement())
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  vehicleId Int
  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id])

  @@unique([productId, vehicleId])
}

model Customer {
  id           Int      @id @default(autoincrement())
  name         String
  phone        String   @unique
  type         String   // "private" | "garage"
  garageName   String?
  notes        String?
  orders       Order[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Order {
  id           Int         @id @default(autoincrement())
  orderNumber  String      @unique // "AA-20260409-001"
  customerId   Int
  customer     Customer    @relation(fields: [customerId], references: [id])
  vehicleInfo  String?     // Free text: "2020 טויוטה קורולה 1.6L"
  status       String      @default("new") // new → confirmed → preparing → ready → delivered → cancelled
  channel      String      @default("whatsapp") // "whatsapp" | "phone" | "walk-in"
  subtotal     Float
  vatRate      Float       @default(17)
  vatAmount    Float
  total        Float
  notes        String?
  items        OrderItem[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model OrderItem {
  id        Int    @id @default(autoincrement())
  orderId   Int
  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  skuId     Int
  sku       Sku    @relation(fields: [skuId], references: [id])
  qty       Int
  unitPrice Float
  total     Float
}

model Promotion {
  id          Int       @id @default(autoincrement())
  name        String    // "חיסול מלאי קיץ"
  type        String    // "percentage" | "fixed" | "buyXgetY" | "freeShipping"
  value       Float     // 10 = 10% or 10₪ depending on type
  buyX        Int?      // for buyXgetY
  getY        Int?
  minOrder    Float?    // Minimum order for promotion
  code        String?   @unique // Coupon code (null = automatic)
  appliesToAll   Boolean  @default(true)
  categoryIds    Int[]    // Apply to specific categories
  productIds     Int[]    // Apply to specific products
  brandIds       Int[]    // Apply to specific brands
  customerTypes  String[] // ["private", "garage"] or empty = all
  startDate   DateTime
  endDate     DateTime
  maxUses     Int?      // null = unlimited
  usedCount   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
}

model Setting {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String // JSON string
}
```

## Admin Pages — Full Checklist

### 📦 Products (/admin/products)
- [ ] Product list with search, filter by category/brand/status
- [ ] Add/edit product: name, slug (auto-gen), description, category, images (multi-upload), featured toggle
- [ ] SKU management per product: part number, brand, tier, price, cost, stock, delivery days, warranty
- [ ] Fitment editor: select which vehicles this product fits
- [ ] Bulk actions: activate/deactivate, change category, delete
- [ ] Image upload with drag-and-drop, reorder, delete
- [ ] Duplicate product (copy with new slug)
- [ ] Import/export CSV

### 📁 Categories (/admin/categories)
- [ ] Tree view: parent → children, drag to reorder
- [ ] Add/edit: name, slug, icon, parent, group, position
- [ ] Activate/deactivate (hides from storefront without deleting)

### 🏷️ Brands (/admin/brands)
- [ ] List with logo, country, product count
- [ ] Add/edit: name, slug, logo upload, country flag
- [ ] Activate/deactivate

### 🚗 Vehicles (/admin/vehicles)
- [ ] List grouped by make → model → years
- [ ] Add vehicle: make, model, year, engine
- [ ] Bulk add: "Toyota Corolla 2018-2024 1.6L" → creates 7 vehicles
- [ ] Import from CSV

### 📋 Orders (/admin/orders)
- [ ] Order list with status filter, date range, search by customer/order number
- [ ] Order detail: customer info, items, vehicle, totals, status history
- [ ] Status workflow: new → confirmed → preparing → ready → delivered (with timestamps)
- [ ] Cancel order (with reason)
- [ ] Print order / send WhatsApp confirmation
- [ ] Daily/weekly summary stats

### 👥 Customers (/admin/customers)
- [ ] Customer list with search by name/phone
- [ ] Customer detail: info, order history, total spent
- [ ] Edit customer type, notes
- [ ] Auto-created from orders

### 🎯 Promotions (/admin/promotions)
- [ ] List with status (active/scheduled/expired)
- [ ] Create promotion types:
  - Percentage discount (10% off)
  - Fixed amount (₪50 off)
  - Buy X Get Y (קנה 3 קבל 1)
  - Free shipping
- [ ] Scope: all products, specific categories, specific brands, specific products
- [ ] Customer type targeting: private only, garage only, or both
- [ ] Coupon codes (manual entry at checkout)
- [ ] Auto-promotions (no code needed, apply automatically)
- [ ] Date range: start/end
- [ ] Usage limits
- [ ] Promotion banner on storefront

### 📊 Dashboard (/admin/dashboard)
- [ ] Today's orders count + revenue
- [ ] Low stock alerts (below minStock threshold)
- [ ] Popular products (most ordered)
- [ ] Revenue chart (last 30 days)
- [ ] Customer breakdown (private vs garage)
- [ ] Pending orders count

### ⚙️ Settings (/admin/settings)
- [ ] Store info: name, address, phones, hours
- [ ] VAT rate
- [ ] WhatsApp number
- [ ] Telegram chat ID (for notifications)
- [ ] Admin password change
- [ ] Delivery options & pricing
- [ ] Minimum order amount

### 🖼️ Media (/admin/media)
- [ ] Image library: all uploaded images
- [ ] Upload, delete, rename
- [ ] Used/unused filter (orphaned images)

## API Routes (/api/admin/*)

All admin routes require auth cookie. Return JSON.

```
POST   /api/admin/auth          — login
DELETE /api/admin/auth          — logout

GET    /api/admin/products      — list (pagination, search, filters)
POST   /api/admin/products      — create
GET    /api/admin/products/:id   — detail
PUT    /api/admin/products/:id   — update
DELETE /api/admin/products/:id   — soft delete (isActive=false)

POST   /api/admin/products/:id/skus       — add SKU
PUT    /api/admin/products/:id/skus/:skuId — update SKU
DELETE /api/admin/products/:id/skus/:skuId — delete SKU

POST   /api/admin/products/:id/fitments   — set fitments (array of vehicleIds)
POST   /api/admin/products/:id/images     — upload images
DELETE /api/admin/products/:id/images/:idx — remove image

GET/POST/PUT/DELETE /api/admin/categories
GET/POST/PUT/DELETE /api/admin/brands
GET/POST/PUT/DELETE /api/admin/vehicles
GET/POST/PUT/DELETE /api/admin/orders
PUT    /api/admin/orders/:id/status       — update status
GET/POST/PUT/DELETE /api/admin/customers
GET/POST/PUT/DELETE /api/admin/promotions
GET/PUT /api/admin/settings

GET    /api/admin/dashboard     — stats
POST   /api/admin/import/csv    — bulk import
GET    /api/admin/export/csv    — bulk export
```

## Storefront Changes

Replace `lib/data.ts` (hardcoded) with Prisma queries:

```typescript
// lib/db.ts — new file
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- Homepage featured products → `prisma.product.findMany({ where: { isFeatured: true, isActive: true } })`
- Catalog → `prisma.product.findMany()` with filters
- Part detail → `prisma.product.findUnique({ include: { skus: true, fitments: true } })`
- Vehicle selector → `prisma.vehicle.findMany()`
- Search → `prisma.product.findMany({ where: { name: { contains: q, mode: 'insensitive' } } })`

## Migration Plan

1. **Phase 1:** Set up Prisma + PostgreSQL, seed from current lib/data.ts
2. **Phase 2:** Build admin API routes (CRUD for all entities)
3. **Phase 3:** Build admin UI pages
4. **Phase 4:** Migrate storefront from lib/data.ts → Prisma queries
5. **Phase 5:** Promotions system
6. **Phase 6:** Dashboard + analytics

## Dependencies to Add

```bash
npm install prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs
```

## Environment Variables

```
DATABASE_URL="postgresql://user:pass@host:5432/abuamin?sslmode=require"
ADMIN_PASSWORD_HASH="$2b$10$..."  # bcrypt hash
ADMIN_SESSION_SECRET="random-32-char-string"
```

## Execution Order for Claude Code

CRITICAL: Execute in this exact order. Each phase must build + verify before next.

### Phase 1: Database Foundation (~20 min)
1. npm install prisma @prisma/client bcryptjs @types/bcryptjs
2. npx prisma init
3. Write full schema.prisma (all models above)
4. Create seed.ts that migrates data from current lib/data.ts → DB
5. Set DATABASE_URL in .env
6. npx prisma db push
7. npx prisma db seed
8. VERIFY: npx prisma studio — check all tables have data

### Phase 2: Admin Auth + API (~30 min)
1. Create lib/db.ts (Prisma singleton)
2. Create lib/admin-auth.ts (cookie session, bcrypt verify)
3. Create middleware for /api/admin/* routes (auth check)
4. Build ALL API routes listed above (CRUD)
5. VERIFY: curl each endpoint, check responses

### Phase 3: Admin UI (~45 min)
1. /admin/dashboard — stats cards + charts
2. /admin/products — list + add/edit modal + SKU editor + fitment editor
3. /admin/categories — tree view + add/edit
4. /admin/brands — list + add/edit
5. /admin/vehicles — grouped list + bulk add
6. /admin/orders — list + detail + status workflow
7. /admin/customers — list + detail
8. /admin/promotions — list + create wizard
9. /admin/settings — form
10. /admin/media — image library
11. VERIFY: navigate every page, create/edit/delete test records

### Phase 4: Storefront Migration (~20 min)
1. Create lib/queries.ts — Prisma query functions matching current lib/data.ts API
2. Update app/page.tsx — use server components + Prisma
3. Update app/catalog/page.tsx — Prisma queries with filters
4. Update app/part/[slug]/page.tsx — Prisma findUnique
5. Update app/vehicle/page.tsx — Prisma vehicles
6. Update app/search/page.tsx — Prisma search
7. Update components/ — adapt to new data shape
8. DELETE lib/data.ts (no more hardcoded data)
9. VERIFY: full storefront works with DB data, no regressions

### Phase 5: Promotions (~15 min)
1. Promotion engine: check active promotions, apply discounts
2. Coupon input on cart page
3. Auto-apply promotions (banner on matching products)
4. Admin: promotion analytics (usage count, revenue impact)
5. VERIFY: create promotion, verify discount shows on storefront

### Phase 6: Dashboard (~10 min)
1. Revenue chart (last 30 days)
2. Order status breakdown
3. Low stock alerts
4. Top products
5. VERIFY: dashboard shows real data

## TOTAL ESTIMATED: ~2.5 hours Claude Code
