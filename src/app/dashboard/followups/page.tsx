import Link from "next/link";
import { getFirstBusiness, getFollowupStats, getRecentVisits } from "@/server/services/followups";

export default async function FollowupsDashboardPage() {
  const business = await getFirstBusiness();
  const stats = await getFollowupStats(business?.id);
  const recentVisits = await getRecentVisits(20, business?.id);

  const settingsIncomplete = !business || !business.google_review_url;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Post-Visit Follow-Ups</h1>
        <div className="flex gap-2">
          <Link className="rounded bg-black px-4 py-2 text-sm text-white" href="/dashboard/followups/new">
            Add Visit
          </Link>
          <Link className="rounded border px-4 py-2 text-sm" href="/dashboard/followups/upload">
            Upload CSV
          </Link>
          <Link className="rounded border px-4 py-2 text-sm" href="/dashboard/followups/settings">
            Settings
          </Link>
        </div>
      </div>

      {settingsIncomplete ? (
        <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Business settings are incomplete. Add at least a Google review URL before follow-up emails can be sent.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-semibold">{stats.pending}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Sent</p>
          <p className="text-2xl font-semibold">{stats.sent}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-semibold">{stats.failed}</p>
        </div>
      </div>

      <div className="rounded border">
        <div className="border-b p-4">
          <h2 className="font-medium">Recent Visits</h2>
        </div>
        {recentVisits.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No visits yet. Add one manually or upload a CSV to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3">Customer</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Visited At</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit: any) => (
                  <tr key={visit.id} className="border-t">
                    <td className="p-3">{visit.customer_name || "-"}</td>
                    <td className="p-3">{visit.customer_email || "-"}</td>
                    <td className="p-3">{visit.service_name || "-"}</td>
                    <td className="p-3">{new Date(visit.visited_at).toLocaleString()}</td>
                    <td className="p-3 capitalize">{visit.followup_status}</td>
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
