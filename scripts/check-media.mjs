/**
 * Integrità dei binari in public/media.
 *
 * Nasce da un caso reale: l'MP3 del debutto era troncato al 61% e si fermava
 * a metà brano. Build, lint, typecheck e test passavano tutti senza dire nulla.
 * Un file multimediale dichiara quanto è lungo nel proprio header: qui si
 * confronta quella dichiarazione con quello che il file contiene davvero.
 */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("../public/media", import.meta.url).pathname;

const problems = [];
const checked = [];

/* --- MP3 ------------------------------------------------------------------ */

const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const RATES = [44100, 48000, 32000];

function frameLength(buf, offset) {
  if (offset + 4 > buf.length) return null;
  if (buf[offset] !== 0xff || (buf[offset + 1] & 0xe0) !== 0xe0) return null;

  const version = (buf[offset + 1] >> 3) & 3;
  const layer = (buf[offset + 1] >> 1) & 3;
  const bitrateIndex = (buf[offset + 2] >> 4) & 0xf;
  const rateIndex = (buf[offset + 2] >> 2) & 3;
  const padding = (buf[offset + 2] >> 1) & 1;

  // Solo MPEG-1 Layer III: è quello che usiamo, e restringere evita falsi positivi.
  if (version !== 3 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) {
    return null;
  }
  const size = Math.floor((144 * BITRATES[bitrateIndex] * 1000) / RATES[rateIndex]) + padding;
  return { size, rate: RATES[rateIndex] };
}

function checkMp3(name, buf) {
  if (buf.subarray(0, 3).toString() !== "ID3") {
    problems.push(`${name}: manca il tag ID3, formato inatteso`);
    return;
  }
  const tagSize = (buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9];
  const audioStart = 10 + tagSize;

  const xing = buf.indexOf("Xing", audioStart, "latin1");
  if (xing === -1 || xing > audioStart + 2000) {
    problems.push(`${name}: header Xing assente, impossibile verificare la durata`);
    return;
  }

  const flags = buf.readUInt32BE(xing + 4);
  let cursor = xing + 8;
  const declaredFrames = flags & 1 ? buf.readUInt32BE((cursor += 4) - 4) : null;
  const declaredBytes = flags & 2 ? buf.readUInt32BE((cursor += 4) - 4) : null;

  let offset = audioStart;
  let frames = 0;
  let rate = 44100;
  while (offset < buf.length - 4) {
    const frame = frameLength(buf, offset);
    if (!frame) {
      offset += 1;
      continue;
    }
    frames += 1;
    rate = frame.rate;
    offset += frame.size;
  }

  const actualBytes = buf.length - audioStart;
  // Il frame che ospita l'header Xing non conta come audio.
  const audioFrames = frames - 1;
  const seconds = (audioFrames * 1152) / rate;

  if (declaredBytes !== null && actualBytes < declaredBytes) {
    problems.push(
      `${name}: TRONCATO — dichiarati ${declaredBytes} byte audio, presenti ${actualBytes} ` +
        `(${((actualBytes / declaredBytes) * 100).toFixed(1)}%)`,
    );
    return;
  }
  if (declaredFrames !== null && audioFrames < declaredFrames) {
    problems.push(
      `${name}: TRONCATO — dichiarati ${declaredFrames} frame, presenti ${audioFrames}`,
    );
    return;
  }
  checked.push(`${name}: ${audioFrames} frame a ${rate} Hz, ${seconds.toFixed(2)}s`);
}

/* --- Immagini ------------------------------------------------------------- */

function checkPng(name, buf) {
  const signature = buf.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    problems.push(`${name}: firma PNG non valida`);
    return;
  }
  // Un PNG completo finisce sempre col chunk IEND.
  if (buf.subarray(-8, -4).toString("latin1") !== "IEND") {
    problems.push(`${name}: TRONCATO — manca il chunk IEND finale`);
    return;
  }
  checked.push(`${name}: PNG completo, ${buf.length} byte`);
}

function checkWebp(name, buf) {
  if (buf.subarray(0, 4).toString() !== "RIFF" || buf.subarray(8, 12).toString() !== "WEBP") {
    problems.push(`${name}: firma WebP non valida`);
    return;
  }
  // Il campo RIFF dichiara la lunghezza del file meno gli 8 byte di intestazione.
  const declared = buf.readUInt32LE(4) + 8;
  if (buf.length < declared) {
    problems.push(`${name}: TRONCATO — dichiarati ${declared} byte, presenti ${buf.length}`);
    return;
  }
  checked.push(`${name}: WebP completo, ${buf.length} byte`);
}

/* --- Percorso ------------------------------------------------------------- */

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    const buf = await readFile(path);
    const name = path.slice(ROOT.length + 1);
    if (entry.name.endsWith(".mp3")) checkMp3(name, buf);
    else if (entry.name.endsWith(".png")) checkPng(name, buf);
    else if (entry.name.endsWith(".webp")) checkWebp(name, buf);
  }
}

await walk(ROOT);

for (const line of checked) console.log(`  ok   ${line}`);
for (const line of problems) console.error(`  FAIL ${line}`);

if (problems.length) {
  console.error(`\n${problems.length} file multimediali non integri.`);
  process.exit(1);
}
console.log(`\n${checked.length} file multimediali integri.`);
