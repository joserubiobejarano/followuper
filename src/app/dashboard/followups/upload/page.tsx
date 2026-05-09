"use client";

import { DragEvent, FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { FollowupsNav } from "@/components/followups/followups-nav";
import { PageHeader } from "@/components/followups/page-header";
import { SummaryCard } from "@/components/followups/summary-card";
import { RunFollowupsButton } from "@/components/followups/run-followups-button";

export default function UploadVisitsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setIsUploading(true);
      res = await fetch("/api/followups/upload", {
        method: "POST",
        body: formData
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Network error while uploading CSV.");
      setIsUploading(false);
      return;
    }

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
      setMessage(data?.error || "Upload failed");
      setIsUploading(false);
      return;
    }

    setResult(data);
    setMessage("CSV processed.");
    setIsUploading(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0] || null;
    if (droppedFile) {
      setFile(droppedFile);
      setMessage("");
      setResult(null);
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <FollowupsNav />
      <PageHeader
        title="Upload Completed Visits"
        description="Import completed visits from CSV so follow-ups can be created automatically with the same validation and dedupe safeguards."
        backToOverview
      >
        <a
          className="inline-flex items-center justify-center rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          href="/visits-example.csv"
          download
        >
          Download template
        </a>
      </PageHeader>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-700">
          <li>1. Step 1: Download the template</li>
          <li>2. Step 2: Fill in completed visits</li>
          <li>3. Step 3: Upload the CSV</li>
          <li>4. Step 4: Follow-ups send automatically</li>
        </ol>
        <p className="mt-3 text-xs text-slate-500 sm:text-sm">
          Manual/CSV visits can trigger follow-ups if the visit happened between 23 hours and 7 days ago.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-slate-900">Expected CSV columns</p>
        <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700 sm:text-sm">
          customer_name, customer_email, customer_phone, service_name, visited_at
        </p>
      </section>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={[
            "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
            isDragging
              ? "border-[#0f172b] bg-slate-100"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
          ].join(" ")}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="mb-3 h-10 w-10 rounded-full bg-[#0f172b] p-2 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden="true">
              <path
                d="M12 16V4M12 4l-4 4M12 4l4 4M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900">
            Drag and drop your CSV file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-slate-500">CSV files only</p>
          {file ? (
            <p className="mt-4 rounded-md bg-[#0f172b] px-3 py-1.5 text-xs font-medium text-white">
              Selected file: {file.name}
            </p>
          ) : null}
        </label>

        <button
          className="inline-flex min-w-36 items-center justify-center rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Uploading...
            </span>
          ) : (
            "Upload CSV"
          )}
        </button>
      </form>

      {message ? (
        <div
          className={[
            "rounded-xl border px-4 py-3 text-sm",
            result
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          ].join(" ")}
        >
          {message}
        </div>
      ) : null}

      {result ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Import Summary</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Rows Processed" value={result.rows_processed} />
            <SummaryCard label="Inserted" value={result.visits_inserted} />
            <SummaryCard label="Skipped" value={result.rows_skipped} />
            <SummaryCard label="Duplicates" value={result.duplicates_skipped} />
            <SummaryCard label="Errors" value={result.errors?.length || 0} />
          </div>

          {result.errors?.length ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 sm:p-5">
              <p className="mb-3 text-sm font-semibold text-rose-900">Row-by-row Errors</p>
              <ul className="space-y-2">
                {result.errors.map((error: { row: number; reason: string }, idx: number) => (
                  <li
                    key={`${error.row}-${idx}`}
                    className="rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm text-rose-800"
                  >
                    <span className="font-medium">Row {error.row}:</span> {error.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <RunFollowupsButton />
          </div>
          <div>
            <Link
              href="/dashboard/followups"
              className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to overview
            </Link>
          </div>
        </section>
      ) : null}

      {isUploading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#0f172b]" />
          </div>
          <p className="mt-2 text-xs text-slate-500">Processing rows and checking duplicates...</p>
        </div>
      ) : null}
    </div>
  );
}
