"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, InstallIcon, MerchIcon, SoundIcon, WorldIcon } from "@/components/icons";
import { useInstallPrompt, useOnline, useServiceWorker } from "@/lib/use-pwa";

const navigation = [
  { href: "/social", label: "FEED", icon: GridIcon },
  { href: "/listen", label: "LISTEN", icon: SoundIcon },
  { href: "/merch", label: "MERCH", icon: MerchIcon },
  { href: "/", label: "WORLD", icon: WorldIcon },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const online = useOnline();
  const { canInstall, install } = useInstallPrompt();

  useServiceWorker();

  return (
    <div className="app-shell">
      <header className="topbar">
        {/* Lockup del brand: NVLL pesante, CLICK leggero, un solo punto verde. */}
        <Link href="/" className="brand" aria-label="NVLL CLICK home">
          <b>NVLL</b>
          <span>CLICK</span>
          <i aria-hidden="true" />
        </Link>

        <div className="topbar-end">
          {canInstall && (
            <button type="button" className="install-button" onClick={install}>
              <InstallIcon width={14} height={14} />
              INSTALLA
            </button>
          )}
          <p className={online ? "signal" : "signal offline"} role="status">
            <i />
            {online ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
          </p>
        </div>
      </header>

      <main>{children}</main>

      <nav className="dock" aria-label="Navigazione principale">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
