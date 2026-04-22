import type { Metadata } from "next";
import { fontDisplay, fontBody, brand } from "@/lib/brand.config";
import "./globals.css";

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-studio-ivory text-ink">{children}</body>
    </html>
  );
}
