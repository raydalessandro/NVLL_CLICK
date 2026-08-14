"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, SoundIcon, WorldIcon } from "@/components/icons";

const navigation = [
  { href: "/social", label: "FEED", icon: GridIcon },
  { href: "/listen", label: "LISTEN", icon: SoundIcon },
  { href: "/", label: "WORLD", icon: WorldIcon },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="NVLL CLICK home"><span>NVLL</span><b>CLICK</b></Link>
        <div className="signal"><i /> SYSTEM ONLINE</div>
      </header>
      <main>{children}</main>
      <nav className="dock" aria-label="Navigazione principale">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return <Link key={href} href={href} className={active ? "active" : ""}><Icon/><span>{label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
