import Image from "next/image";
import Link from "next/link";
import { artist, getVisual, tracks, visuals } from "@/lib/catalog";

const heroVisual = getVisual("v04");
const ribbon = visuals.slice(0, 5);

export default function WorldPage() {
  return (
    <div className="world-page">
      <section className="world-hero">
        <Image src={heroVisual.src} alt={heroVisual.alt} fill priority sizes="100vw" />
        <div className="world-shade" />
        <div className="world-grid" />

        <div className="world-hero-copy">
          <span className="eyebrow">ARCHIVIO / 0001</span>
          <h1>
            IDENTITÀ
            <br />
            <em>IN ASCOLTO</em>
          </h1>
          <p>{artist.bio}</p>
          <div className="hero-actions">
            <Link href="/listen" className="primary-cta">
              ASCOLTA ORA
            </Link>
            <Link href="/social" className="ghost-cta">
              APRI IL FEED
            </Link>
          </div>
        </div>

        {/* Coerente con `artist.location`: il progetto non dichiara una posizione. */}
        <div className="coordinate">{artist.location}</div>
      </section>

      <section className="module-strip">
        <article>
          <span>01</span>
          <b>SOUND ARCHIVE</b>
          <small>{tracks.length.toString().padStart(2, "0")} traccia attiva</small>
        </article>
        <article>
          <span>02</span>
          <b>VISUAL FIELD</b>
          <small>{visuals.length.toString().padStart(2, "0")} frame canonici</small>
        </article>
        <article>
          <span>03</span>
          <b>NULL ROOM</b>
          <small>spazio in costruzione</small>
        </article>
      </section>

      <section className="world-editorial section-pad">
        <div className="section-heading">
          <span>MANIFESTO / A</span>
          <h2>
            Non c’è un frontman.
            <br />
            C’è un campo.
          </h2>
        </div>
        <div className="editorial-copy">
          <p>
            NVLL CLICK non nasconde un’identità: la distribuisce. Ogni corpo è temporaneo. Ogni voce
            lascia una pressione diversa sullo stesso materiale.
          </p>
          <p>
            Questo spazio non imita una piattaforma. È il punto in cui musica, immagine e presenza
            cominciano a coincidere.
          </p>
        </div>
      </section>

      <section className="visual-ribbon" aria-label="Archivio visivo">
        {ribbon.map((item, i) => (
          <figure key={item.id}>
            <Image src={item.src} alt={item.alt} fill sizes="(max-width: 700px) 70vw, 28vw" />
            <figcaption>
              {String(i + 1).padStart(2, "0")} / {item.caption}
            </figcaption>
          </figure>
        ))}
      </section>
    </div>
  );
}
