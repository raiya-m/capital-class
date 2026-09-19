import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Capital Class",
  description: "Classroom tokens, rewards, and a kid-safe stock market.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} h-full antialiased`}>
      <body className="dot-grid min-h-full font-sans text-ink">{children}</body>
    </html>
  );
}
