import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell";
import { PlayerProvider } from "@/components/player-provider";
import { BottomPlayer } from "@/components/bottom-player";

export const metadata: Metadata = {
  title: "NVLL CLICK — Identità in ascolto",
  description: "Archivio sonoro e visivo di NVLL CLICK.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body><PlayerProvider><Shell>{children}</Shell><BottomPlayer/></PlayerProvider></body></html>;
}
