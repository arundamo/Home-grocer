import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("inventory")
      .select("id, quantity, expiry, item_id, location_id, items(id, name, category, barcode), locations(id, name, parent_id)");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inventory: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const itemId = typeof body.item_id === "string" ? body.item_id : "";
    const locationId = typeof body.location_id === "string" ? body.location_id : "";
    const quantity = Number.isInteger(body.quantity) ? body.quantity : null;
    const expiry = typeof body.expiry === "string" && body.expiry ? body.expiry : null;

    if (!itemId || !locationId || quantity === null) {
      return NextResponse.json(
        { error: "item_id, location_id, and quantity are required." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("inventory")
      .upsert(
        {
          item_id: itemId,
          location_id: locationId,
          quantity,
          expiry,
        },
        { onConflict: "item_id,location_id" },
      )
      .select("id, item_id, location_id, quantity, expiry")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inventory: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 },
    );
  }
}
