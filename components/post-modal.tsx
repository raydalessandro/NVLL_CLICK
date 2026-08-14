"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  HeartIcon,
  MoreIcon,
  PauseIcon,
  PlayIcon,
  ShareIcon,
} from "@/components/icons";
import { artist, formatTime, getVisual, type Post } from "@/lib/catalog";
import { usePlayer } from "@/components/player-provider";

type PostModalProps = {
  post: Post | null;
  liked: boolean;
  onToggleLike: (id: string) => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

const avatar = getVisual("v02");

export function PostModal({ post, liked, onToggleLike, onClose, onPrev, onNext }: PostModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // La nota è legata al post che l'ha generata: cambiando post sparisce da sé,
  // senza un effetto che azzeri lo stato.
  const [shareNote, setShareNote] = useState<{ postId: string; text: string } | null>(null);
  const { track, playing, toggle } = usePlayer();

  const open = post !== null;
  const note = post && shareNote?.postId === post.id ? shareNote.text : null;

  // Il <dialog> nativo porta con sé Esc, focus trap e inerzia dello sfondo:
  // chiudere non dipende dalla posizione del pulsante.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onPrev, onNext]);

  const share = async () => {
    if (!post) return;
    const url = window.location.href;
    const data = { title: artist.name, text: post.caption, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote({ postId: post.id, text: "LINK COPIATO" });
    } catch {
      // L'utente ha annullato o il browser ha negato: nessun errore da mostrare.
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="post-modal"
      aria-label="Post NVLL CLICK"
      // Solo `close`: `cancel` (Esc) ha come azione predefinita la chiusura e
      // sfocia comunque in `close`. Gestirli entrambi chiuderebbe due volte.
      onClose={onClose}
      onClick={(event) => {
        // Chiude solo se il click cade sullo sfondo, non dentro l'articolo.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {post && (
        <article>
          <header className="modal-bar">
            <div className="mini-avatar">
              <Image src={avatar.src} alt="" fill sizes="36px" />
            </div>
            <b>{artist.handle}</b>
            <MoreIcon className="modal-more" />
            <button type="button" className="modal-close" onClick={onClose} aria-label="Chiudi post">
              <CloseIcon />
            </button>
          </header>

          <div className="modal-media">
            <Image src={post.visual.src} alt={post.visual.alt} fill sizes="90vw" priority />
            {post.kind === "track" && (
              <button type="button" className="modal-play" onClick={toggle}>
                {playing ? <PauseIcon /> : <PlayIcon />}
                <span>
                  {post.track.title} · {formatTime(post.track.duration)}
                </span>
              </button>
            )}
            {onPrev && (
              <button type="button" className="modal-nav prev" onClick={onPrev} aria-label="Post precedente">
                <ChevronLeftIcon />
              </button>
            )}
            {onNext && (
              <button type="button" className="modal-nav next" onClick={onNext} aria-label="Post successivo">
                <ChevronRightIcon />
              </button>
            )}
          </div>

          <div className="modal-copy">
            <div className="post-actions">
              <button
                type="button"
                onClick={() => onToggleLike(post.id)}
                className={liked ? "liked" : ""}
                aria-pressed={liked}
                aria-label={liked ? "Togli il like" : "Metti like"}
              >
                <HeartIcon />
              </button>
              <button type="button" onClick={share} aria-label="Condividi il post">
                <ShareIcon />
              </button>
              {note && <span className="share-note">{note}</span>}
            </div>
            <p>
              <b>{artist.handle}</b> {post.caption}
            </p>
            <small>
              {post.kind === "track"
                ? `${track.version.toUpperCase()} · NESSUNA POSIZIONE`
                : "ARCHIVIO 2026 · NESSUNA POSIZIONE"}
            </small>
          </div>
        </article>
      )}
    </dialog>
  );
}
