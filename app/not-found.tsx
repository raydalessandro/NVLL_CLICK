import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coordinata inesistente",
};

export default function NotFound() {
  return (
    <div className="system-page section-pad">
      <span className="eyebrow">404 / NULL</span>
      <h1>
        COORDINATA
        <br />
        INESISTENTE
      </h1>
      <p>Questa superficie non è mai stata registrata nell’archivio.</p>
      <Link href="/" className="primary-cta">
        TORNA AL CAMPO
      </Link>
    </div>
  );
}
