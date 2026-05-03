import { NextResponse } from "next/server";
import { sql } from "@/server/db";
import {
  buildSubject,
  generateFollowupEmailBody
} from "@/server/services/followup-email-generator";
import { sendWithResend } from "@/server/services/email/resend-provider";

export async function POST(request: Request) {
  const rawAuth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV !== "production") {
    console.info("[cron/send-followups] CRON_SECRET loaded:", Boolean(cronSecret));
  }

  const [scheme, token] = rawAuth?.trim().split(/\s+/, 2) ?? [];
  const isBearer = typeof scheme === "string" && scheme.toLowerCase() === "bearer";
  const isAuthorized = Boolean(cronSecret) && isBearer && token === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const visits = await sql`
    SELECT v.*, b.name AS business_name, b.business_type, b.city, b.google_review_url, b.rebooking_url, b.tone, b.language, b.email_from_name
    FROM visits v
    JOIN businesses b ON b.id = v.business_id
    WHERE v.visited_at BETWEEN now() - interval '25 hours' AND now() - interval '23 hours'
      AND v.followup_status = 'pending'
      AND v.followup_sent_at IS NULL
      AND v.customer_email IS NOT NULL
      AND trim(v.customer_email) <> ''
    ORDER BY v.visited_at ASC
  `;

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const visit of visits) {
    const alreadySent = await sql`
      SELECT id
      FROM followup_messages
      WHERE visit_id = ${visit.id} AND status = 'sent'
      LIMIT 1
    `;
    if (alreadySent.length > 0) {
      skipped += 1;
      continue;
    }

    if (!visit.google_review_url) {
      skipped += 1;
      await sql`
        UPDATE visits
        SET followup_status = 'failed', updated_at = now()
        WHERE id = ${visit.id}
      `;
      await sql`
        INSERT INTO followup_messages (visit_id, business_id, subject, body, status, error_message)
        VALUES (
          ${visit.id},
          ${visit.business_id},
          ${buildSubject(visit.business_name)},
          '',
          'failed',
          'Missing google_review_url'
        )
      `;
      continue;
    }

    const subject = buildSubject(visit.business_name);
    const body = await generateFollowupEmailBody({
      business_name: visit.business_name,
      business_type: visit.business_type,
      city: visit.city,
      customer_name: visit.customer_name,
      service_name: visit.service_name,
      google_review_url: visit.google_review_url,
      rebooking_url: visit.rebooking_url,
      tone_setting: visit.tone,
      language: visit.language
    });

    try {
      const providerMessageId = await sendWithResend({
        email_from_name: visit.email_from_name,
        business_name: visit.business_name,
        customer_email: visit.customer_email,
        subject,
        body
      });

      await sql`
        INSERT INTO followup_messages (
          visit_id, business_id, subject, body, provider_message_id, status, sent_at
        )
        VALUES (
          ${visit.id},
          ${visit.business_id},
          ${subject},
          ${body},
          ${providerMessageId},
          'sent',
          now()
        )
      `;

      await sql`
        UPDATE visits
        SET followup_status = 'sent', followup_sent_at = now(), updated_at = now()
        WHERE id = ${visit.id}
      `;
      sent += 1;
    } catch (error) {
      const errorMessage = String(error);
      await sql`
        INSERT INTO followup_messages (
          visit_id, business_id, subject, body, status, error_message
        )
        VALUES (
          ${visit.id},
          ${visit.business_id},
          ${subject},
          ${body},
          'failed',
          ${errorMessage}
        )
      `;
      await sql`
        UPDATE visits
        SET followup_status = 'failed', updated_at = now()
        WHERE id = ${visit.id}
      `;
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: visits.length,
    sent,
    failed,
    skipped
  });
}
