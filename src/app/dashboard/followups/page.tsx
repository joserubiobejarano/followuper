import Link from "next/link";
import { getFirstBusiness, getFollowupStats, getRecentVisits } from "@/server/services/followups";
import { FollowupsNav } from "@/components/followups/followups-nav";
import { StatusBadge } from "@/components/followups/status-badge";
import { SummaryCard } from "@/components/followups/summary-card";
import { PageHeader } from "@/components/followups/page-header";
import { RunFollowupsButton } from "@/components/followups/run-followups-button";

export default async function FollowupsDashboardPage() {
  const business = await getFirstBusiness();
  const stats = await getFollowupStats(business?.id);
  const recentVisits = await getRecentVisits(20, business?.id);

  const settingsIncomplete = !business || !business.google_review_url;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <FollowupsNav />
      <PageHeader title="Post-Visit Follow-Ups">
        <Link
          className="rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          href="/dashboard/followups/new"
        >
          Add Visit
        </Link>
      </PageHeader>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        Upload completed visits and automatically send warm thank-you emails with a Google review
        request.
      </div>

      {settingsIncomplete ? (
        <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Business settings are incomplete. Add at least a Google review URL before follow-up emails can be sent.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <SummaryCard label="Pending" value={stats.pending} />
        <SummaryCard label="Sent" value={stats.sent} />
        <SummaryCard label="Failed" value={stats.failed} />
        <SummaryCard label="Skipped" value={stats.skipped} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <RunFollowupsButton />
      </div>

      <div className="rounded border">
        <div className="border-b p-4">
          <h2 className="font-medium">Recent Visits</h2>
        </div>
        {recentVisits.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No visits yet. Upload a CSV or add a visit manually to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3">Customer</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Visited At</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Error Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit: any) => (
                  <tr key={visit.id} className="border-t">
                    <td className="p-3">{visit.customer_name || "-"}</td>
                    <td className="p-3">{visit.customer_email || "-"}</td>
                    <td className="p-3">{visit.service_name || "-"}</td>
                    <td className="p-3">{new Date(visit.visited_at).toLocaleString()}</td>
                    <td className="p-3 capitalize">{visit.source || "-"}</td>
                    <td className="p-3"><StatusBadge status={visit.followup_status} /></td>
                    <td className="p-3">{visit.followup_error_reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
