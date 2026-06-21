import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VaayuMitra — India\'s AI Carbon Companion',
  description: 'Track, understand and reduce your carbon footprint. Built for Indian lifestyles with CEA grid data, India GHG Program factors, and Gemini AI.',
  keywords: 'carbon footprint, India, climate, CO2, sustainability, VaayuMitra',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#111009" />
      </head>
      <body>{children}</body>
    </html>
  );
}
