import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { merch } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Merch",
  description: "Capi NVLL CLICK allo stadio di render. Nessun capo è ancora in vendita.",
};

export default function MerchPage() {
  return (
    <div className="merch-page">
      <section className="merch-head section-pad">
        <span className="eyebrow">MERCH / RENDER 001</span>
        <h1>
          CORPI
          <br />
          VESTITI
        </h1>
        <p>
          Sei capi allo stadio di studio. Nero su nero, un solo segnale verde, nessun volto: la
          stessa regola che tiene insieme il resto dell’archivio.
        </p>
      </section>

      {/*
        Nessun prezzo, nessuna taglia, nessun pulsante d'acquisto: non esiste
        ancora un fornitore né un pagamento, e un controllo finto sarebbe peggio
        di un'assenza dichiarata.
      */}
      <p className="merch-notice section-pad">
        Nessuno di questi capi è in vendita. Sono render di studio, non fotografie di prodotti
        esistenti: forme, stampe e materiali possono ancora cambiare.
      </p>

      <section className="merch-grid section-pad" aria-label="Capi allo stadio di render">
        {merch.map((item, index) => (
          <article key={item.id}>
            <div className="merch-shot">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                priority={index < 2}
              />
              <span className="merch-badge">RENDER</span>
            </div>
            <h2>{item.name}</h2>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="merch-foot section-pad">
        <p>
          Quando i capi diventeranno reali, questa superficie ospiterà taglie, disponibilità e
          pagamento. Fino ad allora resta un campo visivo.
        </p>
        <Link href="/listen" className="ghost-cta">
          TORNA ALL’ASCOLTO
        </Link>
      </section>
    </div>
  );
}
