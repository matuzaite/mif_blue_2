import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VU MIF Naujienų Portalas",
  description: "Vilniaus universiteto Matematikos ir informatikos fakulteto naujienų informacinė sistema",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <head>
        {/* 1. Fixes the React 19 fatal crash by defining globalThis for Tizen 4.0 */}
        <script 
          dangerouslySetInnerHTML={{ 
            __html: `if (typeof globalThis === 'undefined') { window.globalThis = window; }` 
          }} 
        />
        {/* 2. Provides missing modern JavaScript functions (like replaceAll, flatMap) for old Chromium */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/core-js-bundle/3.38.1/minified.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
