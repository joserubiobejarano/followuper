import { NextResponse } from "next/server";
import { parseCsv } from "@/server/services/csv";
import { createVisit, getFirstBusiness } from "@/server/services/followups";

export async function POST(request: Request) {
  try {
    const business = await getFirstBusiness();
    if (!business) {
      return NextResponse.json(
        { error: "Please configure business settings first." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsv(text);

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row.visited_at || (!row.customer_email && !row.customer_phone)) {
        skipped += 1;
        continue;
      }

      try {
        await createVisit({
          business_id: business.id,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          service_name: row.service_name,
          visited_at: row.visited_at,
          source: "csv"
        });
        inserted += 1;
      } catch (error) {
        errors.push({ row: i + 2, reason: String(error) });
      }
    }

    return NextResponse.json({ inserted, skipped, errors });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process CSV upload", details: String(error) },
      { status: 500 }
    );
  }
}
