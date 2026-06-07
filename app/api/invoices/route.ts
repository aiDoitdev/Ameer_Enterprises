import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          invoice_no: body.invoice_no,
          company_name: body.company_name,
          document_type: body.document_type,
          cell_no: body.cell_no,
          date: body.date,
          vendor_name: body.vendor_name,
          items: body.items,
          sub_total: body.sub_total,
          old_due: body.old_due,
          received: body.received,
          grand_total: body.grand_total,
          footer_text: body.footer_text,
        },
      ])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
