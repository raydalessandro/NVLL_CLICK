"use client";

import Image from "next/image";
import { PauseIcon, PlayIcon, SpinnerIcon } from "@/components/icons";
import { formatTime, getVisual, tracks } from "@/lib/catalog";
import { usePlayer } from "@/components/player-provider";

const relatedVisual = getVisual("v07");

// Profilo d'onda fisso: decorativo, ma stabile tra render e tra server e client.
const WAVE = Array.from({ length: 44 }, (_, i) => 18 + ((i * 37) % 76));

export default function ListenPage() {
  const { playing, status, error, toggle, progress } = usePlayer();
  const track = tracks[0];
  const loading = status === "loading";

  const playLabel = loading ? "CARICAMENTO" : playing ? "IN RIPRODUZIONE" : "ASCOLTA";

  return (
    <div className="listen-page">
      <section className="release-hero section-pad">
        <div className="release-cover">
          <Image
            src={track.cover}
            alt="Copertina Mezzi immaginari"
            fill
            priority
            sizes="(max-width: 700px) 82vw, 420px"
          />
          <div className="cover-stamp">
            <b>NVLL</b>
            <span>
              CLICK
              <i aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="release-copy">
          <span className="eyebrow">RELEASE PROTOTYPE / 001</span>
          <h1>
            MEZZI
            <br />
            IMMAGINARI
          </h1>
          <p>Un primo corpo sonoro dentro il sistema. Versione sorgente, non ancora una conclusione.</p>
          <div className="release-meta">
            <span>2026</span>
            <span>{tracks.length} BRANO</span>
            <span>{formatTime(track.duration)}</span>
          </div>
          <button type="button" className="big-play" onClick={toggle} aria-busy={loading}>
            {loading ? <SpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
            <span>{playLabel}</span>
          </button>
          {error && (
            <p className="player-error" role="status">
              {error}
            </p>
          )}
        </div>
      </section>

      <section className="track-section section-pad">
        <div className="track-head">
          <span>#</span>
          <span>TITOLO</span>
          <span>STATO</span>
          <span>DURATA</span>
        </div>

        <button
          type="button"
          className="track-row active"
          onClick={toggle}
          aria-label={playing ? `Metti in pausa ${track.title}` : `Riproduci ${track.title}`}
        >
          <span>{playing ? <PauseIcon width={13} height={13} /> : "01"}</span>
          <span>
            <b>{track.title}</b>
            <small>
              NVLL CLICK · {track.version}
            </small>
          </span>
          <span>
            <i /> SOURCE
          </span>
          <span>{formatTime(track.duration)}</span>
        </button>

        <div className="track-row locked" aria-disabled="true">
          <span>02</span>
          <span>
            <b>VERSIONE ALTERNATIVA</b>
            <small>Nessun file caricato</small>
          </span>
          <span>VUOTO</span>
          <span>—:—</span>
        </div>

        <div className="track-row locked" aria-disabled="true">
          <span>03</span>
          <span>
            <b>STEM / STRUMENTALE</b>
            <small>Nessun file caricato</small>
          </span>
          <span>VUOTO</span>
          <span>—:—</span>
        </div>
      </section>

      <section className="listening-notes section-pad">
        <span>NOTE DI ASCOLTO / 001</span>
        <blockquote>
          “Il master qui non è una statua. È una versione che può ancora scegliere che cosa diventare.”
        </blockquote>
        <div className="wave-bars" aria-hidden="true">
          {WAVE.map((height, i) => (
            <i
              key={i}
              className={i / WAVE.length <= progress ? "played" : ""}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </section>

      <section className="related-visual">
        <Image src={relatedVisual.src} alt={relatedVisual.alt} fill sizes="100vw" />
        <div>
          <span>CAMPO VISIVO</span>
          <h2>
            LA MATERIA
            <br />
            TIENE IL TEMPO
          </h2>
        </div>
      </section>
    </div>
  );
}
