"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { artist, tracks, type Track } from "@/lib/catalog";

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

type PlayerValue = {
  track: Track;
  status: PlayerStatus;
  playing: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  error: string | null;
  toggle: () => void;
  seek: (value: number) => void;
  /** Da chiamare quando l'utente prende/rilascia lo slider di posizione. */
  setScrubbing: (scrubbing: boolean) => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const track = tracks[0];
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrubbingRef = useRef(false);

  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.duration);

  const playing = status === "playing";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      // Durante lo scrub la posizione la comanda l'utente, non il media.
      if (!scrubbingRef.current) setCurrentTime(audio.currentTime);
    };
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onPlaying = () => {
      setError(null);
      setStatus("playing");
    };
    const onWaiting = () => setStatus("loading");
    const onPause = () => setStatus((prev) => (prev === "error" ? prev : "paused"));
    const onEnded = () => {
      setStatus("paused");
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    const onError = () => {
      setStatus("error");
      // L'audio non viene mai messo in cache dal service worker: senza rete
      // il motivo è quello, e vale la pena dirlo invece di dare la colpa al file.
      setError(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "Sei offline: l’ascolto richiede la connessione."
          : "Audio non disponibile. Riprova tra poco.",
      );
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setStatus("loading");
      audio.play().catch(() => {
        setStatus("error");
        setError("Riproduzione bloccata dal browser. Tocca di nuovo per avviarla.");
      });
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const limit = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : Infinity;
    const next = clamp(value, limit);
    if (!Number.isFinite(next)) return;
    setCurrentTime(next);
    audio.currentTime = next;
  }, []);

  const setScrubbing = useCallback((scrubbing: boolean) => {
    scrubbingRef.current = scrubbing;
  }, []);

  // Controlli di sistema: schermata di blocco, cuffie, tasti media.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;

    session.metadata = new MediaMetadata({
      title: track.title,
      artist: artist.name,
      album: track.version,
      artwork: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    });

    const play = () => audioRef.current?.play().catch(() => setStatus("error"));
    const pause = () => audioRef.current?.pause();
    session.setActionHandler("play", play);
    session.setActionHandler("pause", pause);
    session.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") seek(details.seekTime);
    });
    // Salti rapidi dai comandi di sistema e dalle cuffie.
    session.setActionHandler("seekbackward", (details) => {
      const audio = audioRef.current;
      if (audio) seek(audio.currentTime - (details.seekOffset ?? 10));
    });
    session.setActionHandler("seekforward", (details) => {
      const audio = audioRef.current;
      if (audio) seek(audio.currentTime + (details.seekOffset ?? 10));
    });

    return () => {
      session.setActionHandler("play", null);
      session.setActionHandler("pause", null);
      session.setActionHandler("seekto", null);
      session.setActionHandler("seekbackward", null);
      session.setActionHandler("seekforward", null);
    };
  }, [track, seek]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  const value = useMemo<PlayerValue>(
    () => ({
      track,
      status,
      playing,
      currentTime,
      duration,
      progress: duration > 0 ? clamp(currentTime / duration, 1) : 0,
      error,
      toggle,
      seek,
      setScrubbing,
    }),
    [track, status, playing, currentTime, duration, error, toggle, seek, setScrubbing],
  );

  return (
    <PlayerContext.Provider value={value}>
      <audio ref={audioRef} src={track.audio} preload="metadata" playsInline />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer richiede PlayerProvider");
  return value;
}
