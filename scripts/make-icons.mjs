import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const INK = "#070806";
const PAPER = "#d8d8cf";
const ACID = "#b8ff35";

/**
 * Monogramma Ø del brand: ellisse tagliata da una barra, più il singolo punto
 * verde del lockup. `inset` lascia la safe zone per la variante maskable.
 */
function mark({ size = 512, inset = 0.18, background = INK } = {}) {
  const s = size;
  const box = s * (1 - inset * 2);
  const cx = s / 2;
  const cy = s / 2;

  const rx = box * 0.27;
  const ry = box * 0.4;
  const stroke = box * 0.105;

  // La barra sborda dall'ellisse quanto basta a leggersi anche a 48px.
  const dx = rx * 1.34;
  const dy = ry * 0.86;

  const dot = box * 0.062;
  const dotX = cx + rx + stroke * 0.5 + dot * 1.5;
  const dotY = cy + ry - dot * 0.4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="${background}"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"
           fill="none" stroke="${PAPER}" stroke-width="${stroke}"/>
  <line x1="${cx - dx}" y1="${cy + dy}" x2="${cx + dx}" y2="${cy - dy}"
        stroke="${PAPER}" stroke-width="${stroke}" stroke-linecap="butt"/>
  <circle cx="${dotX}" cy="${dotY}" r="${dot}" fill="${ACID}"/>
</svg>`;
}

const out = new URL("../public/icons", import.meta.url).pathname;
await mkdir(out, { recursive: true });

const render = async (svg, name, size) => {
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(`${out}/${name}`);
  console.log("wrote", name, size);
};

await render(mark({ size: 512, inset: 0.18 }), "icon-192.png", 192);
await render(mark({ size: 512, inset: 0.18 }), "icon-512.png", 512);
// Maskable: contenuto entro il 60% centrale, il resto è area di ritaglio sicura.
await render(mark({ size: 512, inset: 0.29 }), "maskable-512.png", 512);
await render(mark({ size: 512, inset: 0.16 }), "apple-touch-icon.png", 180);

// Sorgente vettoriale, utile per rigenerare o esportare altrove.
await writeFile(`${out}/icon.svg`, mark({ size: 512, inset: 0.18 }));
console.log("done");
