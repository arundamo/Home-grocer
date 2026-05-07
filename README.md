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

- `GET/POST /api/items`
- `GET/PATCH/DELETE /api/items/[id]`
- `GET/PATCH /api/inventory`
- `GET /api/locations`

## Main UI Components

- Search groceries with live location + stock status
- Add item form with predefined location dropdown
- Stock view grouped by location buttons
- Placeholder shelf image recognition hook returning product JSON
