import { formatTime, tracks } from "@/lib/catalog";

export type Product = {
  id: string;
  name: string;
  edition: string;
  image: string;
  copy: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  source: string;
  duration: string;
  status: "available" | "locked";
};

/**
 * Prototipi di WORLD 00. Sono oggetti di finzione dentro il gioco, disegnati
 * come SVG: non hanno prezzo perché non esiste ancora nulla di vendibile
 * (AGENTS.md #13). Il merchandising reale sta su /merch.
 */
export const PRODUCTS: Product[] = [
  {
    id: "signal-tee",
    name: "SIGNAL TEE",
    edition: "WORLD 00 / 001",
    image: "/game/merch/signal-tee.svg",
    copy: "Cotone nero. Punto acido sul cuore. Il segnale rimane anche a schermo spento.",
  },
  {
    id: "null-hoodie",
    name: "NULL HOODIE",
    edition: "WORLD 00 / 002",
    image: "/game/merch/null-hoodie.svg",
    copy: "Felpa pesante grafite. Cappuccio profondo. Coordinate di Monzoro sulla schiena.",
  },
  {
    id: "mask-01",
    name: "MASK 01",
    edition: "WORLD 00 / 003",
    image: "/game/merch/mask-01.svg",
    copy: "Passamontagna nero, trama fitta e ricamo NVLL CLICK color cemento.",
  },
  {
    id: "archive-pack",
    name: "ARCHIVE PACK",
    edition: "WORLD 00 / 004",
    image: "/game/merch/archive-pack.svg",
    copy: "Card, adesivi e cassetta fantasma. Un oggetto fisico per una traccia che vive online.",
  },
];

/**
 * La traccia suonabile viene dal catalogo del sito: titolo, file e durata non
 * possono divergere da /listen (AGENTS.md #1 e #4). Le altre sono segnaposto
 * dichiarati come tali.
 */
export const TRACKS: Track[] = [
  ...tracks.map<Track>((track) => ({
    id: track.id,
    title: track.title.toUpperCase(),
    artist: "NVLL CLICK",
    source: track.audio,
    duration: formatTime(track.duration),
    status: "available",
  })),
  {
    id: "archive-02",
    title: "ARCHIVE 02",
    artist: "NVLL CLICK",
    source: "",
    duration: "--:--",
    status: "locked",
  },
  {
    id: "archive-03",
    title: "ARCHIVE 03",
    artist: "NVLL CLICK",
    source: "",
    duration: "--:--",
    status: "locked",
  },
];

export const WORLD_COPY = {
  title: "WORLD 00",
  subtitle: "MONZORO / SEGNALE ATTIVO",
  firstTransmission: [
    "IL SEGNALE E' TORNATO.",
    "DUE PORTE SONO APERTE:",
    "NVLL SUPPLY E SOUND ROOM.",
    "ENTRA. GUARDA. ASCOLTA.",
  ],
};
