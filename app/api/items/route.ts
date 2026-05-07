import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const search = request.nextUrl.searchParams.get("search")?.trim();

    let itemsQuery = supabase
      .from("items")
      .select("id, name, category, barcode")
      .order("name", { ascending: true });

    if (search) {
      itemsQuery = itemsQuery.ilike("name", `%${search}%`);
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const itemIds = items.map((item) => item.id);

    const { data: stockRows, error: stockError } = await supabase
      .from("inventory")
      .select("item_id, quantity, expiry, location_id, locations(name)")
      .in("item_id", itemIds);

    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 500 });
    }

    const stockByItem = new Map<string, Array<Record<string, unknown>>>();

    for (const row of stockRows ?? []) {
      const current = stockByItem.get(row.item_id) ?? [];
      current.push(row);
      stockByItem.set(row.item_id, current);
    }

    const responseItems = items.map((item) => ({
      ...item,
      stock: (stockByItem.get(item.id) ?? []).map((row) => ({
        quantity: row.quantity,
        expiry: row.expiry,
        location_id: row.location_id,
        location_name:
          typeof row.locations === "object" && row.locations !== null && "name" in row.locations
            ? String((row.locations as { name?: string }).name ?? "Unknown")
            : "Unknown",
      })),
    }));

    return NextResponse.json({ items: responseItems });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : null;
    const barcode = typeof body.barcode === "string" ? body.barcode.trim() : null;
    const locationId = typeof body.location_id === "string" ? body.location_id : null;
    const quantity = Number.isInteger(body.quantity) ? body.quantity : 0;
    const expiry = typeof body.expiry === "string" && body.expiry ? body.expiry : null;

    if (!name) {
      return NextResponse.json({ error: "Item name is required." }, { status: 400 });
    }

    const { data: item, error: itemError } = await supabase
      .from("items")
      .insert({ name, category, barcode })
      .select("id, name, category, barcode")
      .single();

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    if (locationId) {
      const { error: inventoryError } = await supabase.from("inventory").upsert(
        {
          item_id: item.id,
          location_id: locationId,
          quantity,
          expiry,
        },
        { onConflict: "item_id,location_id" },
      );

      if (inventoryError) {
        return NextResponse.json({ error: inventoryError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 },
    );
  }
}
