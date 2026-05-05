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

    let res: Response;
    try {
      res = await fetch("/api/followups/upload", {
        method: "POST",
        body: formData
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Network error while uploading CSV.");
      return;
    }

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
      setMessage(data?.error || "Upload failed");
      return;
    }

    setResult(data);
    setMessage("CSV processed.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Upload Completed Visits</h1>
      <div className="rounded border bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium text-gray-900">Expected CSV columns</p>
        <p className="mt-1 font-mono">
          customer_name, customer_email, customer_phone, service_name, visited_at
        </p>
        <a className="mt-2 inline-block text-black underline" href="/visits-example.csv" download>
          Download example CSV
        </a>
      </div>
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
        <div className="space-y-3 rounded border p-4 text-sm">
          <p className="font-medium">Import summary</p>
          <p>Rows processed: {result.rows_processed}</p>
          <p>Visits inserted: {result.visits_inserted}</p>
          <p>Rows skipped: {result.rows_skipped}</p>
          <p>Duplicates skipped: {result.duplicates_skipped}</p>
          <p>Error rows: {result.errors?.length || 0}</p>
          {result.errors?.length ? (
            <div className="rounded border bg-gray-50 p-3">
              <p className="mb-2 font-medium">Errors by row</p>
              <ul className="space-y-1">
                {result.errors.map((error: { row: number; reason: string }, idx: number) => (
                  <li key={`${error.row}-${idx}`}>
                    Row {error.row}: {error.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
