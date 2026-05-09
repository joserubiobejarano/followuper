"use client";

import { FormEvent, useEffect, useState } from "react";
import { FollowupsNav } from "@/components/followups/followups-nav";
import { PageHeader } from "@/components/followups/page-header";

type Business = {
  name: string;
  business_type?: string;
  city?: string;
  google_review_url: string;
  rebooking_url?: string;
  tone?: string;
  language?: string;
  email_from_name?: string;
};

const EMPTY_BUSINESS: Business = {
  name: "",
  business_type: "",
  city: "",
  google_review_url: "",
  rebooking_url: "",
  tone: "warm and friendly",
  language: "en",
  email_from_name: ""
};

export default function FollowupSettingsPage() {
  const [form, setForm] = useState<Business>(EMPTY_BUSINESS);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/followups/settings");
      const data = await res.json();
      if (data.business) {
        setForm({
          ...EMPTY_BUSINESS,
          ...data.business
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setMessageType(null);

    const res = await fetch("/api/followups/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to save settings");
      setMessageType("error");
      return;
    }
    setMessage("Settings saved.");
    setMessageType("success");
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <FollowupsNav />
      <PageHeader title="Follow-Up Settings" backToOverview />
      {!form.google_review_url ? (
        <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Follow-ups cannot be sent until you add a Google review URL.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Business name</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Business type</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" value={form.business_type || ""} onChange={(e) => setForm({ ...form, business_type: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">City</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Google review URL</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" value={form.google_review_url} onChange={(e) => setForm({ ...form, google_review_url: e.target.value })} required />
          <span className="text-xs text-slate-500">Paste the link customers should use to leave a Google review.</span>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Rebooking URL</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" value={form.rebooking_url || ""} onChange={(e) => setForm({ ...form, rebooking_url: e.target.value })} />
          <span className="text-xs text-slate-500">Optional link customers can use to book again.</span>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Tone</span>
          <select className="w-full rounded-lg border border-slate-300 p-2.5" value={form.tone || "warm and friendly"} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
            <option value="warm and friendly">warm and friendly</option>
            <option value="professional">professional</option>
            <option value="casual">casual</option>
            <option value="elegant">elegant</option>
            <option value="short and direct">short and direct</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Language</span>
          <select className="w-full rounded-lg border border-slate-300 p-2.5" value={form.language || "en"} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option value="en">en</option>
            <option value="es">es</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-800">Reply-to email / owner email</span>
          <input className="w-full rounded-lg border border-slate-300 p-2.5" value={form.email_from_name || ""} onChange={(e) => setForm({ ...form, email_from_name: e.target.value })} />
          <span className="text-xs text-slate-500">Replies from customers can be directed here. The technical sender still uses the verified Resend domain.</span>
        </label>
        <button
          className="rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          type="submit"
        >
          Save
        </button>
        {message ? (
          <p
            className={[
              "rounded border px-3 py-2 text-sm",
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            ].join(" ")}
          >
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
