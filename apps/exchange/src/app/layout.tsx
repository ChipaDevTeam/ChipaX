import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChipaX Exchange',
  description: 'Advanced cryptocurrency trading platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="/charting_library/charting_library.standalone.js" 
          strategy="beforeInteractive"
        />
        <link rel="stylesheet" href="/tradingview-custom.css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
