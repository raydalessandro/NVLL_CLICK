import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";
import { PlayerProvider } from "@/components/player-provider";
import { BottomPlayer } from "@/components/bottom-player";
import { site } from "@/lib/catalog";

/**
 * Base assoluta per Open Graph e manifest. In produzione Vercel espone il
 * dominio come variabile; in locale si ricade su localhost.
 */
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: site.shortName,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: site.name }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Nessun blocco dello zoom: resta accessibile.
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <PlayerProvider>
          <Shell>{children}</Shell>
          <BottomPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
