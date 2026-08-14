"use client";

import Image from "next/image";
import { useState } from "react";
import { artist, visuals, type Visual } from "@/lib/catalog";
import { HeartIcon, MoreIcon, ShareIcon } from "@/components/icons";

const storyLabels = ["NULL_01", "FRAMES", "SOUND", "PROCESS"];

export default function SocialPage() {
  const [selected, setSelected] = useState<Visual | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const toggleLike = (id: string) => setLiked(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  return (
    <div className="social-page section-pad">
      <section className="social-profile">
        <div className="avatar"><Image src={visuals[1].src} alt="Avatar NVLL CLICK" fill sizes="120px"/></div>
        <div className="profile-main">
          <div className="handle-row"><h1>{artist.handle}</h1><button>SEGUITO</button><MoreIcon/></div>
          <div className="stats"><span><b>8</b> post</span><span><b>Ø</b> volti</span><span><b>1</b> segnale</span></div>
          <h2>{artist.name}</h2><p>{artist.bio}</p><small>{artist.location}</small>
        </div>
      </section>

      <section className="stories" aria-label="Raccolte in evidenza">
        {storyLabels.map((label, i) => <div key={label}><div className="story-ring"><Image src={visuals[[1, 6, 4, 7][i]].src} alt="" fill sizes="76px"/></div><span>{label}</span></div>)}
      </section>

      <div className="social-tabs"><span className="active">GRIGLIA</span><span>TRACCE</span><span>ARCHIVIO</span></div>

      <section className="post-grid">
        {visuals.map((item, index) => <button key={item.id} onClick={() => setSelected(item)} className={item.format === "wide" ? "wide-crop" : ""} aria-label={`Apri post ${index + 1}`}><Image src={item.src} alt={item.alt} fill sizes="(max-width: 700px) 33vw, 300px"/><span>0{index + 1}</span></button>)}
        <button className="type-post" onClick={() => setSelected(visuals[0])}><span>09</span><strong>MEZZI<br/>IMMAGINARI</strong><i>02:56</i></button>
      </section>

      {selected && <div className="post-modal" role="dialog" aria-modal="true" aria-label="Post NVLL CLICK" onClick={() => setSelected(null)}>
        <article onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelected(null)}>CHIUDI ×</button>
          <div className="modal-media"><Image src={selected.src} alt={selected.alt} fill sizes="90vw"/></div>
          <div className="modal-copy">
            <header><div className="mini-avatar"><Image src={visuals[1].src} alt="" fill sizes="36px"/></div><b>{artist.handle}</b><MoreIcon/></header>
            <div className="post-actions"><button onClick={() => toggleLike(selected.id)} className={liked.has(selected.id) ? "liked" : ""}><HeartIcon/></button><button><ShareIcon/></button></div>
            <p><b>{artist.handle}</b> {selected.caption}</p><small>ARCHIVIO 2026 · NESSUNA POSIZIONE</small>
          </div>
        </article>
      </div>}
    </div>
  );
}
