import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuori rete — NVLL CLICK",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="system-page section-pad">
      <span className="eyebrow">SEGNALE ASSENTE</span>
      <h1>
        FUORI
        <br />
        RETE
      </h1>
      <p>
        Questa superficie non è ancora stata scaricata. Le pagine già visitate restano disponibili
        offline; l’audio richiede la connessione.
      </p>
      <Link href="/" className="primary-cta">
        TORNA AL CAMPO
      </Link>
    </div>
  );
}
