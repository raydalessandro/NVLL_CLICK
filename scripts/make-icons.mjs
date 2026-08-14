import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const INK = "#070806";
const PAPER = "#d8d8cf";
const ACID = "#b8ff35";
const LINE = "#2a2c28";

/**
 * Marca geometrica: piano quadrato attraversato da una linea, un solo punto verde.
 * `inset` lascia la safe zone per la variante maskable.
 */
function mark({ size = 512, inset = 0.16, background = INK } = {}) {
  const s = size;
  const pad = s * inset;
  const box = s - pad * 2;
  const stroke = Math.max(2, s * 0.018);
  const grid = s / 8;

  const gridLines = Array.from({ length: 7 }, (_, i) => {
    const p = grid * (i + 1);
    return `<line x1="${p}" y1="0" x2="${p}" y2="${s}"/><line x1="0" y1="${p}" x2="${s}" y2="${p}"/>`;
  }).join("");

  const cx = pad + box * 0.5;
  const cy = pad + box * 0.62;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="${background}"/>
  <g stroke="${LINE}" stroke-width="${Math.max(1, s * 0.004)}" opacity="0.85">${gridLines}</g>
  <rect x="${pad}" y="${pad}" width="${box}" height="${box}"
        fill="none" stroke="${PAPER}" stroke-width="${stroke}"/>
  <path d="M${pad} ${pad + box * 0.62} L${pad + box} ${pad + box * 0.28}"
        stroke="${PAPER}" stroke-width="${stroke}" opacity="0.55"/>
  <circle cx="${cx}" cy="${cy}" r="${s * 0.055}" fill="${ACID}"/>
</svg>`;
}

const out = new URL("../public/icons", import.meta.url).pathname;
await mkdir(out, { recursive: true });

const render = async (svg, name, size) => {
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(`${out}/${name}`);
  console.log("wrote", name, size);
};

await render(mark({ size: 512, inset: 0.16 }), "icon-192.png", 192);
await render(mark({ size: 512, inset: 0.16 }), "icon-512.png", 512);
// Maskable: contenuto entro il 60% centrale, il resto è area di ritaglio sicura.
await render(mark({ size: 512, inset: 0.27 }), "maskable-512.png", 512);
await render(mark({ size: 512, inset: 0.14 }), "apple-touch-icon.png", 180);

// Sorgente vettoriale, utile per rigenerare o esportare altrove.
await writeFile(`${out}/icon.svg`, mark({ size: 512, inset: 0.16 }));
console.log("done");
