import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const GridIcon = (p: IconProps) => <svg {...base} {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
export const SoundIcon = (p: IconProps) => <svg {...base} {...p}><path d="M4 15V9h4l5-4v14l-5-4H4Z"/><path d="M17 9a4 4 0 0 1 0 6"/><path d="M19.5 6.5a8 8 0 0 1 0 11"/></svg>;
export const WorldIcon = (p: IconProps) => <svg {...base} {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>;
export const PlayIcon = (p: IconProps) => <svg {...base} {...p} fill="currentColor" stroke="none"><path d="m8 5 11 7-11 7V5Z"/></svg>;
export const PauseIcon = (p: IconProps) => <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M7 5h4v14H7zM14 5h4v14h-4z"/></svg>;
export const HeartIcon = (p: IconProps) => <svg {...base} {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>;
export const ShareIcon = (p: IconProps) => <svg {...base} {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg>;
export const MoreIcon = (p: IconProps) => <svg {...base} {...p}><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>;
