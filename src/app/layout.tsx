import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post-Visit Follow-Up Agent",
  description: "MVP follow-up agent for post-visit thank-you and review requests"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
