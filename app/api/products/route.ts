import { NextResponse } from "next/server";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

// ── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    return Object.fromEntries(
      headers.map((h, i) => [h, (values[i] ?? "").trim()])
    );
  });
}

// ── GET — fetch products from Google Sheet ───────────────────────────────────

export async function GET() {
  if (!SHEET_ID) {
    return NextResponse.json(
      { error: "GOOGLE_SHEET_ID is not configured" },
      { status: 500 }
    );
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ["products"] },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            "Failed to fetch Google Sheet. Make sure it is shared publicly.",
        },
        { status: 502 }
      );
    }

    const text = await res.text();
    const rows = parseCSV(text);

    const products = rows
      .filter((row) => row.name?.trim())
      .map((row) => ({
        id: row.id?.trim() || crypto.randomUUID(),
        name: row.name.trim(),
        pricePerItem: parseFloat(row.pricePerItem) || 0,
        quantity: parseInt(row.quantity) || 0,
        added_date: row.added_date?.trim() || "",
        added_by: row.added_by?.trim() || "",
      }));

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST — append a new row via Google Apps Script ───────────────────────────

export async function POST(request: Request) {
  if (!SCRIPT_URL) {
    return NextResponse.json(
      { error: "GOOGLE_APPS_SCRIPT_URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to write to Google Sheet" },
        { status: 502 }
      );
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
