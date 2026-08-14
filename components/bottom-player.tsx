"use client";

import Image from "next/image";
import { PauseIcon, PlayIcon } from "@/components/icons";
import { formatTime } from "@/lib/catalog";
import { usePlayer } from "@/components/player-provider";

export function BottomPlayer() {
  const { track, playing, toggle, currentTime, duration, seek, progress } = usePlayer();
  return (
    <aside className="bottom-player" aria-label="Player audio">
      <div className="player-progress" style={{ "--progress": `${progress * 100}%` } as React.CSSProperties}>
        <input aria-label="Posizione brano" type="range" min="0" max={duration || track.duration} step="0.1" value={currentTime} onChange={(e) => seek(Number(e.target.value))}/>
      </div>
      <Image src={track.cover} alt="" width={48} height={48}/>
      <div className="player-copy"><strong>{track.title}</strong><span>{formatTime(currentTime)} / {formatTime(duration)}</span></div>
      <button className="round-control" onClick={toggle} aria-label={playing ? "Pausa" : "Riproduci"}>{playing ? <PauseIcon/> : <PlayIcon/>}</button>
    </aside>
  );
}
