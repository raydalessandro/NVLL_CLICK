"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, TRACKS, WORLD_COPY, type Product, type Track } from "@/lib/nvll-world-content";
import { usePlayer } from "@/components/player-provider";
import styles from "./nvll-world-game.module.css";

type Direction = "up" | "down" | "left" | "right";
type Place = "world" | "store" | "sound";
type DialogState = { lines: string[]; page: number } | null;
type GameState = {
  place: Place;
  x: number;
  y: number;
  direction: Direction;
  moving: boolean;
  step: number;
  signal: number;
  visitedStore: boolean;
  visitedSound: boolean;
  introSeen: boolean;
};

const WIDTH = 160;
const HEIGHT = 144;
const TILE = 16;
const SAVE_KEY = "nvll-click-world-00";
const DIRECTIONS: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

function createWorld() {
  const width = 38;
  const height = 28;
  const grid: string[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => (x < 2 || y < 2 || x >= width - 2 || y >= height - 2 ? "#" : ".")),
  );

  for (let y = 2; y < height - 2; y += 1) {
    for (let x = 17; x <= 20; x += 1) grid[y][x] = "=";
  }
  for (let x = 2; x < width - 2; x += 1) {
    for (let y = 13; y <= 15; y += 1) grid[y][x] = "=";
  }

  for (let y = 3; y <= 9; y += 1) {
    for (let x = 25; x <= 34; x += 1) grid[y][x] = "~";
  }
  for (let y = 4; y <= 9; y += 1) {
    for (let x = 5; x <= 13; x += 1) grid[y][x] = "B";
  }
  grid[9][8] = "D";
  grid[10][8] = "=";
  grid[10][7] = "s";

  for (let y = 18; y <= 24; y += 1) {
    for (let x = 24; x <= 33; x += 1) grid[y][x] = "B";
  }
  grid[18][28] = "D";
  grid[17][28] = "=";
  grid[17][27] = "s";

  [[4, 20], [5, 20], [6, 20], [8, 23], [9, 23], [13, 6], [23, 5], [32, 12], [34, 16], [4, 8]].forEach(
    ([x, y]) => { grid[y][x] = "#"; },
  );
  [[16, 7], [21, 10], [16, 20], [21, 23], [11, 12], [31, 16]].forEach(([x, y]) => { grid[y][x] = "l"; });

  return grid.map((row) => row.join(""));
}

const MAPS: Record<Place, string[]> = {
  world: createWorld(),
  store: [
    "##############",
    "#............#",
    "#.1..SS..2...#",
    "#............#",
    "#....####....#",
    "#............#",
    "#.3..SS..4...#",
    "#............#",
    "#.....E......#",
    "##############",
  ],
  sound: [
    "##############",
    "#............#",
    "#..RRRRRRRR..#",
    "#..R......R..#",
    "#..R..J...R..#",
    "#..R......R..#",
    "#..RRRRRRRR..#",
    "#............#",
    "#.....E......#",
    "##############",
  ],
};

const SOLID = new Set(["#", "B", "~", "s", "l", "S", "R", "J", "1", "2", "3", "4"]);

const START: GameState = {
  place: "world",
  x: 19,
  y: 16,
  direction: "up",
  moving: false,
  step: 0,
  signal: 0,
  visitedStore: false,
  visitedSound: false,
  introSeen: false,
};

function splitDialog(lines: string[]) {
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += 4) pages.push(lines.slice(index, index + 4));
  return pages;
}

/** La casella sotto il giocatore esiste ed è calpestabile. */
function isStandable(state: GameState) {
  const map = MAPS[state.place];
  if (!map) return false;
  const tile = map[state.y]?.[state.x];
  return Boolean(tile) && !SOLID.has(tile);
}

function persist(state: GameState) {
  try {
    const { moving: _moving, step: _step, ...stable } = state;
    void _moving;
    void _step;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(stable));
  } catch {
    /* storage negato: la partita resta valida in memoria */
  }
}

export function NvllWorldGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>({ ...START });
  const keysRef = useRef<Record<Direction, boolean>>({ up: false, down: false, left: false, right: false });
  const actionRef = useRef({ a: false, b: false });
  const dialogRef = useRef<DialogState>(null);
  const frameRef = useRef(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const overlayOpenRef = useRef(false);

  /*
   * L'audio è quello del sito: il gioco non apre un secondo elemento.
   * Due sorgenti sullo stesso file suonerebbero insieme, e la musica
   * avviata qui prosegue tornando su /listen.
   */
  const { track: siteTrack, playing, status, toggle } = usePlayer();
  const activeTrack = TRACKS.find((entry) => entry.id === siteTrack.id) ?? null;
  const isPlaying = playing;

  // Il loop di disegno legge l'HUD da un ref: così non va ricostruito a ogni
  // cambio di stato della riproduzione.
  const hudRef = useRef({ isPlaying: false, title: "" });
  useEffect(() => {
    hudRef.current = { isPlaying, title: activeTrack?.title ?? "" };
  }, [isPlaying, activeTrack]);

  useEffect(() => {
    overlayOpenRef.current = Boolean(product) || musicOpen;
  }, [product, musicOpen]);

  useEffect(() => {
    const closeOverlay = (event: KeyboardEvent) => {
      if ((event.key.toLowerCase() === "x" || event.key === "Escape") && (product || musicOpen)) {
        event.preventDefault();
        setProduct(null);
        setMusicOpen(false);
      }
    };
    window.addEventListener("keydown", closeOverlay);
    return () => window.removeEventListener("keydown", closeOverlay);
  }, [product, musicOpen]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SAVE_KEY);
      if (saved) {
        const merged = { ...START, ...JSON.parse(saved), moving: false, step: 0 };
        // Un salvataggio corrotto o di una mappa precedente potrebbe piazzare
        // il giocatore dentro un muro: in quel caso si riparte dal centro.
        gameRef.current = isStandable(merged) ? merged : { ...START, introSeen: true };
      }
    } catch {
      gameRef.current = { ...START };
    }
    if (!gameRef.current.introSeen) {
      dialogRef.current = { lines: WORLD_COPY.firstTransmission, page: 0 };
      gameRef.current.introSeen = true;
      persist(gameRef.current);
    }
  }, []);

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      if (key === "arrowup" || key === "w") keysRef.current.up = true;
      if (key === "arrowdown" || key === "s") keysRef.current.down = true;
      if (key === "arrowleft" || key === "a") keysRef.current.left = true;
      if (key === "arrowright" || key === "d") keysRef.current.right = true;
      if (!event.repeat && (key === "z" || key === " " || key === "enter")) actionRef.current.a = true;
      if (!event.repeat && (key === "x" || key === "escape")) actionRef.current.b = true;
    };
    const onUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowup" || key === "w") keysRef.current.up = false;
      if (key === "arrowdown" || key === "s") keysRef.current.down = false;
      if (key === "arrowleft" || key === "a") keysRef.current.left = false;
      if (key === "arrowright" || key === "d") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onDown, { passive: false });
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let animation = 0;
    let lastMoveAt = 0;

    const tileAt = (place: Place, x: number, y: number) => MAPS[place][y]?.[x] ?? "#";
    const save = () => persist(gameRef.current);
    const openDialog = (lines: string[]) => { dialogRef.current = { lines, page: 0 }; };
    const warp = (place: Place, x: number, y: number, direction: Direction) => {
      const state = gameRef.current;
      state.place = place;
      state.x = x;
      state.y = y;
      state.direction = direction;
      state.moving = false;
      state.step = 0;
      if (place === "store" && !state.visitedStore) {
        state.visitedStore = true;
        state.signal += 1;
        openDialog(["NVLL SUPPLY.", "QUATTRO OGGETTI,", "NESSUNA VETRINA.", "AVVICINATI E PREMI A."]);
      }
      if (place === "sound" && !state.visitedSound) {
        state.visitedSound = true;
        state.signal += 1;
        openDialog(["SOUND ROOM.", "LA MUSICA NON E'", "UNO SFONDO.", "E' LA MAPPA."]);
      }
      save();
    };
    const handleWarp = () => {
      const state = gameRef.current;
      const tile = tileAt(state.place, state.x, state.y);
      if (state.place === "world" && tile === "D") {
        if (state.y < 12) warp("store", 6, 7, "up");
        else warp("sound", 6, 7, "up");
      } else if (state.place === "store" && tile === "E") warp("world", 8, 10, "down");
      else if (state.place === "sound" && tile === "E") warp("world", 28, 17, "up");
    };
    const tryMove = (direction: Direction) => {
      const state = gameRef.current;
      state.direction = direction;
      const [dx, dy] = DIRECTIONS[direction];
      if (SOLID.has(tileAt(state.place, state.x + dx, state.y + dy))) return;
      state.moving = true;
      state.step = 0;
    };
    const interact = () => {
      const state = gameRef.current;
      const [dx, dy] = DIRECTIONS[state.direction];
      const tx = state.x + dx;
      const ty = state.y + dy;
      const tile = tileAt(state.place, tx, ty);
      if (state.place === "world" && tile === "s") {
        if (ty < 14) openDialog(["NVLL SUPPLY", "DROP 00 DISPONIBILE.", "ENTRA DALLA PORTA", "E TOCCA GLI OGGETTI."]);
        else openDialog(["MONDADORI / SOUND", "POSTAZIONE ATTIVA.", "SCEGLI UNA TRACCIA", "E PORTALA NEL MONDO."]);
      } else if (state.place === "world" && tile === "l") {
        openDialog(["UN PUNTO DI LUCE.", "NON ILLUMINA TUTTO.", "INDICA SOLO DOVE", "GUARDARE ADESSO."]);
      } else if (state.place === "store" && /^[1-4]$/.test(tile)) {
        setProduct(PRODUCTS[Number(tile) - 1]);
      } else if (state.place === "store" && tile === "S") {
        openDialog(["SCAFFALE ARCHIVIO.", "LE TAGLIE CAMBIANO.", "IL SEGNALE RESTA."]);
      } else if (state.place === "sound" && tile === "J") {
        setMusicOpen(true);
      } else if (state.place === "sound" && tile === "R") {
        openDialog(["CATALOGO IN ATTESA.", "OGNI NUOVO BRANO", "AGGIUNGERA' UNA", "STANZA AL MONDO."]);
      }
    };
    const handleA = () => {
      const current = dialogRef.current;
      if (current) {
        const pages = splitDialog(current.lines);
        if (current.page < pages.length - 1) current.page += 1;
        else dialogRef.current = null;
        return;
      }
      interact();
    };
    const handleB = () => {
      if (dialogRef.current) {
        dialogRef.current = null;
        return;
      }
      const state = gameRef.current;
      const location = state.place === "world" ? "MONZORO" : state.place === "store" ? "NVLL SUPPLY" : "SOUND ROOM";
      openDialog([
        "WORLD 00 / " + location,
        `SEGNALE ${state.signal}/2`,
        state.visitedStore ? "SUPPLY: TROVATO" : "SUPPLY: DA TROVARE",
        state.visitedSound ? "SOUND: TROVATO" : "SOUND: DA TROVARE",
      ]);
    };

    const drawTile = (tile: string, sx: number, sy: number, tick: number) => {
      const px = (color: string, x: number, y: number, w = 1, h = 1) => {
        ctx.fillStyle = color;
        ctx.fillRect(sx + x, sy + y, w, h);
      };
      if (tile === ".") {
        px("#203725", 0, 0, 16, 16);
        [[2, 4], [8, 2], [13, 7], [5, 12], [11, 14]].forEach(([x, y]) => px("#2f4d31", x, y, 2, 1));
      } else if (tile === "=" || tile === "D" || tile === "E") {
        px("#44484a", 0, 0, 16, 16);
        px("#2d3133", 0, 0, 16, 1);
        px("#2d3133", 0, 15, 16, 1);
        if (tile !== "=") {
          px("#c8ff35", 3, 4, 10, 8);
          px("#111611", 5, 6, 6, 6);
        } else {
          px("#777b78", 7, 3, 2, 5);
          px("#777b78", 7, 11, 2, 3);
        }
      } else if (tile === "#") {
        px("#102517", 0, 0, 16, 16);
        px("#183920", 2, 1, 12, 9);
        px("#24602f", 3, 2, 4, 2);
        px("#24602f", 9, 5, 4, 2);
        px("#2d2017", 6, 10, 4, 6);
      } else if (tile === "~") {
        px("#17364e", 0, 0, 16, 16);
        const offset = tick % 2 ? 2 : 0;
        px("#3b7195", 1 + offset, 4, 6, 1);
        px("#3b7195", 8 - offset, 10, 6, 1);
      } else if (tile === "B") {
        px("#323337", 0, 0, 16, 16);
        px("#202125", 0, 5, 16, 1);
        px("#202125", 0, 11, 16, 1);
        px("#c8ff35", 0, 0, 16, 1);
      } else if (tile === "l") {
        px("#203725", 0, 0, 16, 16);
        px("#3a3d42", 7, 3, 2, 13);
        px(tick % 2 ? "#c8ff35" : "#f4ff9b", 4, 1, 8, 4);
      } else if (tile === "s") {
        px("#203725", 0, 0, 16, 16);
        px("#191d1b", 2, 2, 12, 9);
        px("#c8ff35", 3, 3, 10, 2);
        px("#656d66", 7, 11, 2, 5);
      } else if (tile === "S" || /^[1-4]$/.test(tile)) {
        px("#242723", 0, 0, 16, 16);
        px("#4e544d", 1, 3, 14, 11);
        px("#111411", 2, 5, 12, 2);
        px(tile === "S" ? "#818980" : "#c8ff35", 4, 8, 8, 4);
        if (/^[1-4]$/.test(tile)) {
          ctx.fillStyle = "#111411";
          ctx.font = "bold 7px monospace";
          ctx.fillText(tile, sx + 6, sy + 10);
        }
      } else if (tile === "R" || tile === "J") {
        px("#222522", 0, 0, 16, 16);
        px(tile === "J" ? "#c8ff35" : "#555d56", 2, 2, 12, 12);
        px("#111411", 4, 4, 8, 5);
        if (tile === "J") px(tick % 2 ? "#ef5e43" : "#76a7ff", 6, 11, 4, 2);
      }
    };

    const drawPlayer = (x: number, y: number, direction: Direction, walking: boolean, tick: number) => {
      const bob = walking && tick % 2 ? 1 : 0;
      ctx.fillStyle = "#080a09";
      ctx.fillRect(x + 4, y + 1 + bob, 8, 4);
      ctx.fillRect(x + 3, y + 5 + bob, 10, 4);
      ctx.fillStyle = "#d1b18c";
      ctx.fillRect(x + 5, y + 5 + bob, 6, 4);
      ctx.fillStyle = "#181b19";
      ctx.fillRect(x + 3, y + 9 + bob, 10, 5);
      ctx.fillStyle = "#c8ff35";
      if (direction === "left") ctx.fillRect(x + 3, y + 9 + bob, 2, 3);
      else if (direction === "right") ctx.fillRect(x + 11, y + 9 + bob, 2, 3);
      else ctx.fillRect(x + 7, y + 10 + bob, 2, 3);
      ctx.fillStyle = "#080a09";
      ctx.fillRect(x + 4, y + 14, 3, 2);
      ctx.fillRect(x + 9, y + 14, 3, 2);
    };

    const drawDialog = () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const pages = splitDialog(dialog.lines);
      const lines = pages[dialog.page] ?? [];
      ctx.fillStyle = "#101410";
      ctx.fillRect(2, 94, 156, 48);
      ctx.strokeStyle = "#c8ff35";
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 95, 154, 46);
      ctx.fillStyle = "#eff3ea";
      ctx.font = "bold 8px monospace";
      ctx.textBaseline = "top";
      lines.forEach((line, index) => ctx.fillText(line, 8, 101 + index * 9));
      ctx.fillStyle = "#c8ff35";
      ctx.fillText("▼", 145, 130);
    };

    const render = (time: number) => {
      frameRef.current += 1;
      const state = gameRef.current;
      const map = MAPS[state.place];
      const [dx, dy] = DIRECTIONS[state.direction];
      const moveX = state.moving ? dx * state.step : 0;
      const moveY = state.moving ? dy * state.step : 0;
      const mapWidth = map[0].length * TILE;
      const mapHeight = map.length * TILE;
      const cameraX = Math.max(0, Math.min(state.x * TILE + moveX - 72, mapWidth - WIDTH));
      const cameraY = Math.max(0, Math.min(state.y * TILE + moveY - 64, mapHeight - HEIGHT));

      ctx.fillStyle = "#0d120e";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      const startX = Math.floor(cameraX / TILE);
      const startY = Math.floor(cameraY / TILE);
      for (let y = startY; y <= startY + 9; y += 1) {
        for (let x = startX; x <= startX + 10; x += 1) {
          drawTile(tileAt(state.place, x, y), x * TILE - cameraX, y * TILE - cameraY, Math.floor(frameRef.current / 24) % 2);
        }
      }

      if (state.place === "world") {
        ctx.fillStyle = "rgba(200,255,53,.08)";
        [[8, 9], [28, 18]].forEach(([x, y]) => ctx.fillRect(x * TILE - cameraX - 16, y * TILE - cameraY - 16, 48, 48));
      }

      drawPlayer(state.x * TILE + moveX - cameraX, state.y * TILE + moveY - cameraY - 2, state.direction, state.moving, Math.floor(frameRef.current / 8));

      ctx.fillStyle = "rgba(8,11,9,.88)";
      ctx.fillRect(2, 2, 74, 12);
      ctx.strokeStyle = "#c8ff35";
      ctx.lineWidth = 1;
      ctx.strokeRect(2.5, 2.5, 73, 11);
      ctx.fillStyle = "#c8ff35";
      ctx.font = "bold 7px monospace";
      ctx.textBaseline = "top";
      const placeLabel = state.place === "world" ? "MONZORO" : state.place === "store" ? "SUPPLY" : "SOUND";
      ctx.fillText(`${placeLabel}  SIG ${state.signal}/2`, 6, 5);

      const hud = hudRef.current;
      if (hud.isPlaying && hud.title) {
        ctx.fillStyle = "rgba(8,11,9,.9)";
        ctx.fillRect(82, 2, 76, 12);
        ctx.fillStyle = "#f4ff9b";
        ctx.fillText(`▶ ${hud.title.slice(0, 11)}`, 86, 5);
      }
      drawDialog();

      if (!overlayOpenRef.current) {
        if (actionRef.current.a) {
          actionRef.current.a = false;
          handleA();
        }
        if (actionRef.current.b) {
          actionRef.current.b = false;
          handleB();
        }
        if (!dialogRef.current) {
          if (state.moving) {
            state.step += 2;
            if (state.step >= TILE) {
              state.x += dx;
              state.y += dy;
              state.step = 0;
              state.moving = false;
              handleWarp();
              save();
            }
          } else if (time - lastMoveAt > 80) {
            const pressed = (Object.keys(keysRef.current) as Direction[]).find((key) => keysRef.current[key]);
            if (pressed) {
              tryMove(pressed);
              lastMoveAt = time;
            }
          }
        }
      } else {
        actionRef.current.a = false;
        actionRef.current.b = false;
      }
      animation = window.requestAnimationFrame(render);
    };

    animation = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animation);
  }, []);

  const pressDirection = (direction: Direction, pressed: boolean) => {
    keysRef.current[direction] = pressed;
  };
  const pressAction = (action: "a" | "b") => {
    if (action === "b" && product) {
      setProduct(null);
      return;
    }
    if (action === "b" && musicOpen) {
      setMusicOpen(false);
      return;
    }
    actionRef.current[action] = true;
  };

  const playTrack = (track: Track) => {
    if (track.status === "locked" || !track.source) return;
    if (track.id !== siteTrack.id) return;
    toggle();
  };

  const resetWorld = () => {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* storage negato: si azzera comunque lo stato in memoria */
    }
    gameRef.current = { ...START, introSeen: true };
    dialogRef.current = { lines: ["SEGNALE AZZERATO.", "WORLD 00 RIPARTE", "DAL CENTRO DI MONZORO."], page: 0 };
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.back}>← NVLL CLICK</Link>
        <span>WORLD 00 / BUILD 001</span>
        <button type="button" onClick={resetWorld} className={styles.reset}>RESET</button>
      </header>

      <section className={styles.stage} aria-label="NVLL CLICK World 00">
        <div className={styles.console}>
          <div className={styles.screenBezel}>
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className={styles.screen} aria-label="Mappa giocabile di Monzoro" />
            <div className={styles.brandline}><strong>NVLL</strong> CLICK <em>COLOR</em></div>
          </div>
          <div className={styles.controls}>
            <div className={styles.dpad} aria-label="Controlli direzionali">
              <button type="button" className={styles.up} aria-label="Su" onPointerDown={() => pressDirection("up", true)} onPointerUp={() => pressDirection("up", false)} onPointerLeave={() => pressDirection("up", false)}>▲</button>
              <button type="button" className={styles.left} aria-label="Sinistra" onPointerDown={() => pressDirection("left", true)} onPointerUp={() => pressDirection("left", false)} onPointerLeave={() => pressDirection("left", false)}>◀</button>
              <span className={styles.center} />
              <button type="button" className={styles.right} aria-label="Destra" onPointerDown={() => pressDirection("right", true)} onPointerUp={() => pressDirection("right", false)} onPointerLeave={() => pressDirection("right", false)}>▶</button>
              <button type="button" className={styles.down} aria-label="Giù" onPointerDown={() => pressDirection("down", true)} onPointerUp={() => pressDirection("down", false)} onPointerLeave={() => pressDirection("down", false)}>▼</button>
            </div>
            <div className={styles.actionButtons}>
              <button type="button" className={styles.buttonB} onPointerDown={() => pressAction("b")} aria-label="Pulsante B">B</button>
              <button type="button" className={styles.buttonA} onPointerDown={() => pressAction("a")} aria-label="Pulsante A">A</button>
            </div>
          </div>
          {/*
            START resta inerte finché non ha una funzione: è `disabled`, non
            un pulsante finto (AGENTS.md #8). SELECT è l'uscita dal gioco,
            l'unica via di ritorno oltre al link in alto.
          */}
          <div className={styles.systemButtons}>
            <span className={styles.systemKey}>
              <button type="button" disabled aria-label="START, non ancora attivo">
                START
              </button>
              <small>—</small>
            </span>
            <span className={styles.systemKey}>
              <Link href="/" aria-label="SELECT, esci dal gioco e torna al sito">
                SELECT
              </Link>
              <small>EXIT</small>
            </span>
          </div>

          <div className={styles.help}>FRECCE / WASD · Z/INVIO = A · X/ESC = B</div>
        </div>

        <aside className={styles.transmission}>
          <p className={styles.eyebrow}>TRANSMISSION 00</p>
          <h1>IL MONDO<br />NON È UN MENU.</h1>
          <p>È un posto. Entra nel negozio, guarda gli oggetti, raggiungi la sala d’ascolto e porta la traccia con te mentre attraversi Monzoro.</p>
          <div className={styles.legend}>
            <span><i className={styles.dotGreen} /> NVLL SUPPLY</span>
            <span><i className={styles.dotBlue} /> SOUND ROOM</span>
            <span><i className={styles.dotGray} /> ALTRE PORTE / PRESTO</span>
          </div>
        </aside>
      </section>

      {product && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={product.name}>
          <article className={styles.productCard}>
            {/* SVG assets are local, deterministic product mockups. */}
            <Image src={product.image} alt={product.name} width={640} height={640} priority />
            <div>
              <p className={styles.eyebrow}>{product.edition}</p>
              <h2>{product.name}</h2>
              <p>{product.copy}</p>
              {/* Nessun prezzo: non esiste ancora nulla di vendibile (AGENTS.md #13). */}
              <strong>PROTOTIPO</strong>
              <small>OGGETTO DI WORLD 00 — NON IN VENDITA</small>
            </div>
            <button type="button" onClick={() => setProduct(null)}>CHIUDI / B</button>
          </article>
        </div>
      )}

      {musicOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Sound Room">
          <article className={styles.musicPanel}>
            <header>
              <p className={styles.eyebrow}>MONDADORI / LISTENING POINT</p>
              <h2>SOUND ARCHIVE</h2>
            </header>
            <div className={styles.trackList}>
              {TRACKS.map((track, index) => (
                <button
                  type="button"
                  key={track.id}
                  disabled={track.status === "locked"}
                  className={activeTrack?.id === track.id ? styles.activeTrack : undefined}
                  onClick={() => playTrack(track)}
                >
                  <span>0{index + 1}</span>
                  <b>{track.title}</b>
                  <em>{track.duration}</em>
                  <small>{track.status === "locked" ? "LOCKED" : activeTrack?.id === track.id && isPlaying ? "PLAYING" : "PLAY"}</small>
                </button>
              ))}
            </div>
            <div className={styles.musicActions}>
              <button type="button" onClick={toggle} aria-busy={status === "loading"}>
                {isPlaying ? "PAUSA" : "RIPRENDI"}
              </button>
              <button type="button" onClick={() => setMusicOpen(false)}>TORNA AL MONDO</button>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
