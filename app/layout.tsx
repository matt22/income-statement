import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Income Statement",
  description: "A readable income statement for a selected date range.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
