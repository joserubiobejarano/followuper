"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { FollowupsNav } from "@/components/followups/followups-nav";
import { PageHeader } from "@/components/followups/page-header";

export default function NewVisitPage() {
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_name: "",
    visited_at: ""
  });
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaved(false);

    const res = await fetch("/api/followups/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to save visit");
      return;
    }

    setForm({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      service_name: "",
      visited_at: ""
    });
    setMessage("Visit saved as pending follow-up.");
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <FollowupsNav />
      <PageHeader title="Add Completed Visit" backToOverview />
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Customer name</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" placeholder="Jane Smith" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Customer email</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" placeholder="jane@example.com" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Customer phone (optional)</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" placeholder="+1..." value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Service name</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" placeholder="Haircut" value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Visit date and time</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" type="datetime-local" value={form.visited_at} onChange={(e) => setForm({ ...form, visited_at: e.target.value })} required />
          <span className="text-xs text-slate-500">For testing, choose a visit time more than 23 hours ago so it becomes eligible.</span>
        </label>
        <button
          className="rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          type="submit"
        >
          Save Visit
        </button>
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        {saved ? (
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setMessage("");
                setSaved(false);
              }}
            >
              Add another visit
            </button>
            <Link href="/dashboard/followups" className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100">
              Back to overview
            </Link>
          </div>
        ) : null}
      </form>
    </div>
  );
}
