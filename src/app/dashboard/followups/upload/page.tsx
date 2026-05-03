"use client";

import { FormEvent, useState } from "react";

export default function UploadVisitsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setResult(null);

    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/followups/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Upload failed");
      return;
    }

    setResult(data);
    setMessage("CSV processed.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Upload Completed Visits</h1>
      <p className="text-sm text-gray-600">
        Expected columns: customer_name, customer_email, customer_phone, service_name, visited_at
      </p>
      <form onSubmit={onSubmit} className="space-y-3 rounded border p-4">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Upload CSV
        </button>
      </form>
      {message ? <p className="text-sm">{message}</p> : null}
      {result ? (
        <div className="rounded border p-4 text-sm">
          <p>Inserted: {result.inserted}</p>
          <p>Skipped: {result.skipped}</p>
          <p>Errors: {result.errors?.length || 0}</p>
        </div>
      ) : null}
    </div>
  );
}
