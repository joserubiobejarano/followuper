import { NextResponse } from "next/server";
import { sql } from "@/server/db";
import { createVisit } from "@/server/services/followups";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      business_id,
      source,
      event_type,
      external_id,
      customer_name,
      customer_email,
      customer_phone,
      service_name,
      visited_at
    } = payload || {};

    if (!business_id || !source || !event_type) {
      return NextResponse.json(
        { error: "business_id, source, and event_type are required" },
        { status: 400 }
      );
    }

    if (external_id) {
      const existingEvent = await sql`
        SELECT id
        FROM integration_events
        WHERE business_id = ${business_id}
          AND source = ${source}
          AND external_id = ${external_id}
        LIMIT 1
      `;
      if (existingEvent.length > 0) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
    }

    await sql`
      INSERT INTO integration_events (
        business_id, source, event_type, external_id, raw_payload, processed_at
      )
      VALUES (
        ${business_id},
        ${source},
        ${event_type},
        ${external_id || null},
        ${JSON.stringify(payload)},
        now()
      )
    `;

    if (
      (event_type === "appointment.completed" || event_type === "booking.completed") &&
      visited_at
    ) {
      await createVisit({
        business_id,
        customer_name,
        customer_email,
        customer_phone,
        service_name,
        visited_at,
        source,
        external_id
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process webhook", details: String(error) },
      { status: 500 }
    );
  }
}
