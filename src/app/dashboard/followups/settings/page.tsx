"use client";

import { FormEvent, useEffect, useState } from "react";

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

    const res = await fetch("/api/followups/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to save settings");
      return;
    }
    setMessage("Settings saved.");
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Follow-Up Settings</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded border p-4">
        <input className="w-full rounded border p-2" placeholder="Business name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full rounded border p-2" placeholder="Business type" value={form.business_type || ""} onChange={(e) => setForm({ ...form, business_type: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="City" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Google review URL" value={form.google_review_url} onChange={(e) => setForm({ ...form, google_review_url: e.target.value })} required />
        <input className="w-full rounded border p-2" placeholder="Rebooking URL" value={form.rebooking_url || ""} onChange={(e) => setForm({ ...form, rebooking_url: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Tone (example: warm and friendly)" value={form.tone || ""} onChange={(e) => setForm({ ...form, tone: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Language (example: en)" value={form.language || ""} onChange={(e) => setForm({ ...form, language: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Email from name" value={form.email_from_name || ""} onChange={(e) => setForm({ ...form, email_from_name: e.target.value })} />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Save
        </button>
        {message ? <p className="text-sm">{message}</p> : null}
      </form>
    </div>
  );
}
