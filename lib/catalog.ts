export type Track = {
  id: string;
  title: string;
  version: string;
  duration: number;
  audio: string;
  cover: string;
  status: "master-source" | "candidate";
};

export type Visual = {
  id: string;
  src: string;
  alt: string;
  format: "vertical" | "wide";
  caption: string;
};

export const artist = {
  name: "NVLL CLICK",
  handle: "@nvll.click",
  bio: "Corpi variabili. Identità NULL. La materia ricorda quello che la faccia nasconde.",
  location: "00°00′00″ / FUORI CAMPO",
};

export const visuals: Visual[] = [
  { id: "v01", src: "/media/visuals/VIS_01_GRID_PLANE_VERTICAL.png", alt: "Tre figure mascherate divise da un piano geometrico trasparente", format: "vertical", caption: "La distanza è una misura, non un'assenza." },
  { id: "v02", src: "/media/visuals/VIS_02_CARBON_FACE_VERTICAL.png", alt: "Volto mascherato che si dissolve in particelle di grafite", format: "vertical", caption: "Nessun volto. Nessun centro." },
  { id: "v03", src: "/media/visuals/VIS_03_COORDINATE_SHADOWS_VERTICAL.png", alt: "Figure viste dall'alto con ombre e coordinate", format: "vertical", caption: "Coordinate per luoghi che non esistono." },
  { id: "v04", src: "/media/visuals/VIS_04_GRID_PLANE_WIDE.png", alt: "Spazio di cemento attraversato da un piano geometrico", format: "wide", caption: "MEZZI IMMAGINARI / frame 04" },
  { id: "v05", src: "/media/visuals/VIS_05_DIVIDED_FIGURES_WIDE.png", alt: "Due figure separate da una linea luminosa verde", format: "wide", caption: "La linea non separa. Registra." },
  { id: "v06", src: "/media/visuals/VIS_06_COORDINATE_SHADOWS_WIDE.png", alt: "Ombre coordinate in un ambiente di cemento", format: "wide", caption: "Ogni ombra ha un indirizzo provvisorio." },
  { id: "v07", src: "/media/visuals/VIS_07_GRAPHITE_STRUCTURE_WIDE.png", alt: "Struttura di grafite nell'oscurità", format: "wide", caption: "Quello che tocchi resta nel materiale." },
  { id: "v08", src: "/media/visuals/VIS_08_GRAPHITE_STRUCTURE_VERTICAL.png", alt: "Mani nere lavorano una struttura trasparente", format: "vertical", caption: "Costruzione 08 / nessuna istruzione." },
];

export const tracks: Track[] = [
  {
    id: "mezzi-immaginari",
    title: "Mezzi immaginari",
    version: "Master source / 2026",
    duration: 176.448,
    audio: "/media/audio/mezzi-immaginari.mp3",
    cover: visuals[1].src,
    status: "master-source",
  },
];

export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};
