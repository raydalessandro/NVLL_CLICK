"use client";

import Image from "next/image";
import Link from "next/link";
import { PauseIcon, PlayIcon, SpinnerIcon } from "@/components/icons";
import { formatTime } from "@/lib/catalog";
import { usePlayer } from "@/components/player-provider";

export function BottomPlayer() {
  const { track, status, playing, toggle, currentTime, duration, seek, setScrubbing, progress, error } =
    usePlayer();

  const loading = status === "loading";
  const label = playing ? "Pausa" : "Riproduci";

  return (
    <aside className="bottom-player" aria-label="Player audio">
      <div className="player-progress" style={{ "--progress": `${progress * 100}%` } as React.CSSProperties}>
        <input
          type="range"
          aria-label="Posizione brano"
          min={0}
          max={duration || track.duration}
          step={0.1}
          value={currentTime}
          onChange={(event) => seek(Number(event.target.value))}
          // La soppressione serve solo al trascinamento col puntatore: da
          // tastiera ogni modifica è già discreta e passa da `seek`.
          // `blur` e `pointercancel` sono le reti di sicurezza contro uno
          // scrub che resta appeso e congela il tempo mostrato.
          onPointerDown={() => setScrubbing(true)}
          onPointerUp={() => setScrubbing(false)}
          onPointerCancel={() => setScrubbing(false)}
          onLostPointerCapture={() => setScrubbing(false)}
          onBlur={() => setScrubbing(false)}
        />
      </div>

      <Image src={track.cover} alt="" width={48} height={48} />

      <Link href="/listen" className="player-copy">
        <strong>{track.title}</strong>
        <span>
          {error ? error : `${formatTime(currentTime)} / ${formatTime(duration)}`}
        </span>
      </Link>

      <button
        type="button"
        className="round-control"
        onClick={toggle}
        aria-label={label}
        aria-busy={loading}
      >
        {loading ? <SpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/*
        Il player è su ogni pagina, ma il tempo che scorre non può stare in una
        regione live: annuncerebbe di continuo. Qui va solo l'errore.
      */}
      <p className="sr-only" role="status">
        {error}
      </p>
    </aside>
  );
}
