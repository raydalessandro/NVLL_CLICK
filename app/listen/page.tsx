"use client";

import Image from "next/image";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { formatTime, tracks, visuals } from "@/lib/catalog";
import { usePlayer } from "@/components/player-provider";

export default function ListenPage() {
  const { playing, toggle } = usePlayer();
  const track = tracks[0];
  return (
    <div className="listen-page">
      <section className="release-hero section-pad">
        <div className="release-cover"><Image src={track.cover} alt="Copertina Mezzi immaginari" fill priority sizes="(max-width: 700px) 82vw, 420px"/><div className="cover-stamp">NVLL<br/>CLICK</div></div>
        <div className="release-copy"><span className="eyebrow">RELEASE PROTOTYPE / 001</span><h1>MEZZI<br/>IMMAGINARI</h1><p>Un primo corpo sonoro dentro il sistema. Versione sorgente, non ancora una conclusione.</p><div className="release-meta"><span>2026</span><span>1 BRANO</span><span>2:56</span></div><button className="big-play" onClick={toggle}>{playing ? <PauseIcon/> : <PlayIcon/>}<span>{playing ? "IN RIPRODUZIONE" : "ASCOLTA"}</span></button></div>
      </section>

      <section className="track-section section-pad">
        <div className="track-head"><span>#</span><span>TITOLO</span><span>STATO</span><span>DURATA</span></div>
        <button className="track-row active" onClick={toggle}><span>{playing ? <PauseIcon/> : "01"}</span><span><b>{track.title}</b><small>NVLL CLICK · {track.version}</small></span><span><i/> SOURCE</span><span>{formatTime(track.duration)}</span></button>
        <div className="track-row locked"><span>02</span><span><b>VERSIONE ALTERNATIVA</b><small>Nessun file caricato</small></span><span>VUOTO</span><span>—:—</span></div>
        <div className="track-row locked"><span>03</span><span><b>STEM / STRUMENTALE</b><small>Nessun file caricato</small></span><span>VUOTO</span><span>—:—</span></div>
      </section>

      <section className="listening-notes section-pad">
        <span>NOTE DI ASCOLTO / 001</span><blockquote>“Il master qui non è una statua. È una versione che può ancora scegliere che cosa diventare.”</blockquote>
        <div className="wave-bars" aria-hidden="true">{Array.from({length: 44}, (_, i) => <i key={i} style={{height: `${18 + ((i * 37) % 76)}%`}}/> )}</div>
      </section>

      <section className="related-visual"><Image src={visuals[6].src} alt={visuals[6].alt} fill sizes="100vw"/><div><span>CAMPO VISIVO</span><h2>LA MATERIA<br/>TIENE IL TEMPO</h2></div></section>
    </div>
  );
}
