import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
      <div className="rounded border bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold">Post-Visit Follow-Up Agent</h1>
        <p className="mt-2 text-sm text-gray-600">
          Open the follow-up dashboard to manage visits and settings.
        </p>
        <Link
          href="/dashboard/followups"
          className="mt-4 inline-block rounded bg-[#0f172b] px-4 py-2 text-white transition hover:opacity-90"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
