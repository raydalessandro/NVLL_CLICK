"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GridIcon,
  InstallIcon,
  MerchIcon,
  MonogramIcon,
  SoundIcon,
  WorldIcon,
} from "@/components/icons";
import { useInstallPrompt, useOnline, useServiceWorker } from "@/lib/use-pwa";

// Il tasto centrale spezza la fila: due voci per lato, WORLD 00 in mezzo.
const navigationLeft = [
  { href: "/social", label: "FEED", icon: GridIcon },
  { href: "/listen", label: "LISTEN", icon: SoundIcon },
];

const navigationRight = [
  { href: "/merch", label: "MERCH", icon: MerchIcon },
  { href: "/", label: "WORLD", icon: WorldIcon },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const online = useOnline();
  const { canInstall, install } = useInstallPrompt();

  useServiceWorker();

  /*
   * Il gioco occupa lo schermo e porta i propri comandi: qui la shell si
   * toglie di mezzo. Il provider del player resta montato più in alto, così
   * la musica avviata nella Sound Room continua tornando sul sito.
   * Si esce da WORLD 00 col tasto SELECT o col link in alto.
   */
  if (pathname.startsWith("/game")) return <>{children}</>;

  const renderLink = ({ href, label, icon: Icon }: (typeof navigationLeft)[number]) => {
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
  };

  return (
    <div className="app-shell">
      {/* Topbar e dock sono fissi: senza questo salto la tastiera li riattraversa
          a ogni cambio pagina prima di arrivare al contenuto. */}
      <a className="skip-link" href="#contenuto">
        SALTA AL CONTENUTO
      </a>

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

      <main id="contenuto" tabIndex={-1}>
        {children}
      </main>

      <nav className="dock" aria-label="Navigazione principale">
        {navigationLeft.map(renderLink)}

        <Link href="/game" className="dock-core" aria-label="Entra in WORLD 00, il gioco">
          <MonogramIcon width={26} height={26} />
          <span>WORLD 00</span>
        </Link>

        {navigationRight.map(renderLink)}
      </nav>
    </div>
  );
}
