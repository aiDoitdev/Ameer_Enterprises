import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── GET — fetch all products from Supabase ───────────────────────────────────

export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── PATCH — decrement stock quantities after invoice generation ──────────────

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const reductions: { id: string; qty: number }[] = body.reductions ?? [];

    for (const { id, qty } of reductions) {
      if (!id || qty <= 0) continue;

      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", id)
        .single();

      if (fetchError || !product) continue;

      const newQty = Math.max(0, product.quantity - qty);
      await supabase.from("products").update({ quantity: newQty }).eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// ── PUT — update an existing product ─────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, pricePerItem, quantity, added_by } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update({ name, pricePerItem, quantity, added_by })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// ── DELETE — remove a product by id ──────────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// ── POST — insert a new product into Supabase ────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          id: body.id,
          name: body.name,
          pricePerItem: body.pricePerItem,
          quantity: body.quantity,
          added_date: body.added_date,
          added_by: body.added_by,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
