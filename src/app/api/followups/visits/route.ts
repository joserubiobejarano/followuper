import { NextResponse } from "next/server";
import { createVisit, getFirstBusiness } from "@/server/services/followups";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const business = await getFirstBusiness();

    if (!business) {
      return NextResponse.json(
        { error: "Please configure business settings first." },
        { status: 400 }
      );
    }

    if (!body?.visited_at) {
      return NextResponse.json({ error: "visited_at is required" }, { status: 400 });
    }

    if (!body.customer_email && !body.customer_phone) {
      return NextResponse.json(
        { error: "At least one contact method is required (email or phone)." },
        { status: 400 }
      );
    }

    const visit = await createVisit({
      business_id: business.id,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      service_name: body.service_name,
      visited_at: body.visited_at,
      source: "manual"
    });

    return NextResponse.json({ visit }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create visit", details: String(error) },
      { status: 500 }
    );
  }
}
