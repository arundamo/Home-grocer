create extension if not exists "pgcrypto";

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.locations(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (name, parent_id)
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  barcode text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  expiry date,
  updated_at timestamptz not null default now(),
  unique (item_id, location_id)
);

create index if not exists idx_locations_parent_id on public.locations(parent_id);
create index if not exists idx_items_name on public.items(name);
create unique index if not exists uq_items_name_category
  on public.items (lower(name), lower(coalesce(category, '')));
create index if not exists idx_items_barcode on public.items(barcode);
create index if not exists idx_inventory_location_id on public.inventory(location_id);
create index if not exists idx_inventory_item_id on public.inventory(item_id);

insert into public.locations (name, parent_id)
values
  ('Kitchen Cabinet 1', null),
  ('Kitchen Cabinet 2', null),
  ('Basement Freezer', null),
  ('Pantry Shelf 1', null),
  ('Pantry Shelf 2', null)
on conflict do nothing;
