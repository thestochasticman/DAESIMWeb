import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DAESIM",
  description: "DAESIM crop simulation for a site and season",
};

// Bare root layout: the (app) route group owns the full-screen query bar +
// map/results chrome, and /about keeps its simple card.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
