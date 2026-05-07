import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, name, category, barcode")
      .eq("id", id)
      .single();

    if (itemError) {
      const status = itemError.code === "PGRST116" ? 404 : 500;
      return NextResponse.json({ error: itemError.message }, { status });
    }

    const { data: stockRows, error: stockError } = await supabase
      .from("inventory")
      .select("id, quantity, expiry, location_id, locations(name, parent_id)")
      .eq("item_id", id);

    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 500 });
    }

    return NextResponse.json({ item, stock: stockRows ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;
    const body = await request.json();

    const patch: Record<string, string | null> = {};
    if (typeof body.name === "string") {
      patch.name = body.name.trim();
    }
    if (typeof body.category === "string" || body.category === null) {
      patch.category = body.category;
    }
    if (typeof body.barcode === "string" || body.barcode === null) {
      patch.barcode = body.barcode;
    }

    if (Object.keys(patch).length > 0) {
      const { error: itemError } = await supabase.from("items").update(patch).eq("id", id);
      if (itemError) {
        return NextResponse.json({ error: itemError.message }, { status: 500 });
      }
    }

    if (typeof body.location_id === "string" && Number.isInteger(body.quantity)) {
      const { error: stockError } = await supabase.from("inventory").upsert(
        {
          item_id: id,
          location_id: body.location_id,
          quantity: body.quantity,
          expiry: typeof body.expiry === "string" && body.expiry ? body.expiry : null,
        },
        { onConflict: "item_id,location_id" },
      );

      if (stockError) {
        return NextResponse.json({ error: stockError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;

    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error" },
      { status: 500 },
    );
  }
}
