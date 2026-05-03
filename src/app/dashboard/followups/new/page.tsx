"use client";

import { FormEvent, useState } from "react";

export default function NewVisitPage() {
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_name: "",
    visited_at: ""
  });
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

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
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Add Completed Visit</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded border p-4">
        <input className="w-full rounded border p-2" placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Customer email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Customer phone (optional)" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Service name" value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} />
        <input className="w-full rounded border p-2" type="datetime-local" value={form.visited_at} onChange={(e) => setForm({ ...form, visited_at: e.target.value })} required />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Save Visit
        </button>
        {message ? <p className="text-sm">{message}</p> : null}
      </form>
    </div>
  );
}
