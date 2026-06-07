import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_no")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lastNum = data ? parseInt(data.invoice_no, 10) || 0 : 0;
  const nextNumber = String(lastNum + 1).padStart(3, "0");
  return NextResponse.json({ nextNumber });
}
