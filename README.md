# Home-grocer

Smart Home Grocery Manager built with Next.js, Tailwind CSS, and Supabase.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Apply database schema in Supabase SQL editor:
   - `supabase/schema.sql`
4. Start development server:
   ```bash
   npm run dev
   ```

## API Routes

- `GET /api/items?search=<name>`: list items, optionally filtered by name; each item includes stock locations and quantity.
- `POST /api/items`: create item. Body: `{ name, category?, barcode?, location_id?, location_name?, quantity?, expiry? }`.
- `GET /api/items/[id]`: fetch a single item and all stock rows for that item.
- `PATCH /api/items/[id]`: update item fields and optionally upsert stock with `{ location_id, quantity, expiry? }`.
- `DELETE /api/items/[id]`: delete an item (inventory rows cascade).
- `GET /api/inventory`: list inventory rows joined with item and location metadata.
- `PATCH /api/inventory`: upsert stock row. Body: `{ item_id, location_id, quantity, expiry? }`.
- `GET /api/locations`: list available storage locations for dropdowns and stock grouping.

## Main UI Components

- Search groceries with live location + stock status
- Add item form with predefined location dropdown
- Stock view grouped by location buttons
- Placeholder shelf image recognition hook returning product JSON
