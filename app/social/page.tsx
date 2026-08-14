"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  artist,
  feedTabs,
  formatTime,
  getVisual,
  posts,
  postsForTab,
  tracks,
  type FeedTab,
} from "@/lib/catalog";
import { HeartIcon, MoreIcon } from "@/components/icons";
import { PostModal } from "@/components/post-modal";
import { useStoredFlag, useStoredSet } from "@/lib/use-stored-state";

const avatar = getVisual("v02");

const stories = [
  { label: "NULL_01", visual: getVisual("v02") },
  { label: "FRAMES", visual: getVisual("v07") },
  { label: "SOUND", visual: getVisual("v05") },
  { label: "PROCESS", visual: getVisual("v08") },
];

export default function SocialPage() {
  const [tab, setTab] = useState<FeedTab>("griglia");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liked, toggleLike] = useStoredSet("liked-posts");
  const [following, setFollowing] = useStoredFlag("following", true);

  const visible = postsForTab(tab);
  const index = visible.findIndex((post) => post.id === selectedId);
  const selected = index >= 0 ? visible[index] : null;

  // Una voce di cronologia per il post aperto: il tasto indietro del sistema
  // chiude il post invece di uscire dall'app (fondamentale in standalone).
  const openPost = (id: string) => {
    setSelectedId(id);
    window.history.pushState({ nvllPost: id }, "");
  };

  const closePost = () => {
    const state = window.history.state as { nvllPost?: string } | null;
    if (state?.nvllPost) window.history.back();
    else setSelectedId(null);
  };

  const goToIndex = (next: number) => {
    const post = visible[next];
    if (!post) return;
    setSelectedId(post.id);
    window.history.replaceState({ nvllPost: post.id }, "");
  };

  useEffect(() => {
    const onPopState = () => setSelectedId(null);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const selectTab = (next: FeedTab) => {
    if (selectedId) closePost();
    setTab(next);
  };

  // `role="tab"` promette le frecce ai lettori di schermo: qui vengono mantenute,
  // con tabindex mobile così il gruppo occupa una sola tappa di tabulazione.
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = feedTabs.findIndex((entry) => entry.id === tab);
    const last = feedTabs.length - 1;
    let next = current;

    if (event.key === "ArrowRight") next = current === last ? 0 : current + 1;
    else if (event.key === "ArrowLeft") next = current === 0 ? last : current - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;

    event.preventDefault();
    selectTab(feedTabs[next].id);
    event.currentTarget.querySelectorAll("button")[next]?.focus();
  };

  return (
    <div className="social-page section-pad">
      <section className="social-profile">
        <div className="avatar">
          <Image src={avatar.src} alt="Avatar NVLL CLICK" fill sizes="140px" priority />
        </div>
        <div className="profile-main">
          <div className="handle-row">
            <h1>{artist.handle}</h1>
            <button
              type="button"
              className={following ? "following" : ""}
              onClick={() => setFollowing(!following)}
              aria-pressed={following}
            >
              {following ? "SEGUITO" : "SEGUI"}
            </button>
            <MoreIcon className="handle-more" />
          </div>
          <div className="stats">
            <span>
              <b>{posts.length}</b> post
            </span>
            <span>
              <b>Ø</b> volti
            </span>
            <span>
              <b>{tracks.length}</b> segnale
            </span>
          </div>
          <h2>{artist.name}</h2>
          <p>{artist.bio}</p>
          <small>{artist.location}</small>
        </div>
      </section>

      <section className="stories" aria-label="Raccolte in evidenza">
        {stories.map((story) => (
          <button
            type="button"
            key={story.label}
            onClick={() => openPost(`post-${story.visual.id}`)}
            aria-label={`Apri ${story.label}`}
          >
            <span className="story-ring">
              <Image src={story.visual.src} alt="" fill sizes="76px" />
            </span>
            <span>{story.label}</span>
          </button>
        ))}
      </section>

      <div
        className="social-tabs"
        role="tablist"
        aria-label="Sezioni del profilo"
        onKeyDown={onTabKeyDown}
      >
        {feedTabs.map((entry) => (
          <button
            type="button"
            key={entry.id}
            role="tab"
            id={`tab-${entry.id}`}
            aria-selected={tab === entry.id}
            aria-controls="feed-panel"
            tabIndex={tab === entry.id ? 0 : -1}
            className={tab === entry.id ? "active" : ""}
            onClick={() => selectTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <section id="feed-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {visible.length === 0 ? (
          <p className="empty-state">
            Nessun elemento in archivio. Niente viene promosso qui finché non è chiuso a monte.
          </p>
        ) : (
          <div className="post-grid">
            {visible.map((post, position) => (
              <button
                type="button"
                key={post.id}
                onClick={() => openPost(post.id)}
                className={post.kind === "track" ? "type-post" : ""}
                aria-label={
                  post.kind === "track"
                    ? `Apri il post del brano ${post.track.title}`
                    : `Apri il post ${position + 1}`
                }
              >
                {post.kind === "track" ? (
                  <>
                    <span>{String(position + 1).padStart(2, "0")}</span>
                    <strong>
                      {post.track.title.split(" ").map((word) => (
                        <span key={word}>{word.toUpperCase()}</span>
                      ))}
                    </strong>
                    <i>{formatTime(post.track.duration)}</i>
                  </>
                ) : (
                  <>
                    <Image
                      src={post.visual.src}
                      alt={post.visual.alt}
                      fill
                      sizes="(max-width: 700px) 33vw, 300px"
                    />
                    <span>{String(position + 1).padStart(2, "0")}</span>
                  </>
                )}
                {liked.has(post.id) && (
                  <i className="grid-like" aria-hidden="true">
                    <HeartIcon width={13} height={13} />
                  </i>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <PostModal
        post={selected}
        liked={selected ? liked.has(selected.id) : false}
        onToggleLike={toggleLike}
        onClose={closePost}
        onPrev={index > 0 ? () => goToIndex(index - 1) : undefined}
        onNext={index >= 0 && index < visible.length - 1 ? () => goToIndex(index + 1) : undefined}
      />
    </div>
  );
}
