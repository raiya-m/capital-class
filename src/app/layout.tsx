import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CapitalClass",
  description: "Classroom tokens, a live practice market, and kid-safe news incidents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${sans.className} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-ink">{children}</body>
    </html>
  );
}
