/**
 * Service worker NVLL CLICK.
 *
 * Strategie:
 * - navigazioni e payload RSC: network-first con ricaduta sulla cache, poi /offline;
 * - build asset di Next (`/_next/static`, hash immutabile): cache-first;
 * - immagini e icone: cache-first con aggiornamento in background;
 * - audio: sempre rete. Le richieste Range restituiscono 206 e la Cache API
 *   non le gestisce in modo affidabile, quindi non vengono mai intercettate.
 *
 * Alzare VERSION invalida tutte le cache precedenti.
 */

const VERSION = "nvll-v4";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

const OFFLINE_URL = "/offline";

const PRECACHE = [
  "/",
  "/listen",
  "/social",
  "/merch",
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll fallisce in blocco: si aggiunge una risorsa per volta così una
      // rotta momentaneamente non raggiungibile non annulla l'installazione.
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch {
            /* risorsa saltata: verrà presa a runtime */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

const isRscRequest = (request, url) =>
  request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");

const isImmutableAsset = (url) =>
  url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");

const isImage = (request, url) =>
  request.destination === "image" ||
  url.pathname.startsWith("/media/visuals/") ||
  url.pathname.startsWith("/media/merch/");

const isAudio = (request, url) =>
  request.destination === "audio" || url.pathname.startsWith("/media/audio/");

/*
 * Le immagini passano da /_next/image con query diverse per ogni larghezza:
 * senza un tetto la cache crescerebbe a ogni build. La Cache API conserva
 * l'ordine di inserimento, quindi si eliminano le voci più vecchie.
 */
const ASSET_CACHE_LIMIT = 160;

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
    await trim(cacheName, ASSET_CACHE_LIMIT);
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      /*
       * Si reindirizza invece di servire /offline sotto l'URL richiesto:
       * l'App Router confronta URL e contenuto durante l'idratazione e
       * sostituirebbe la pagina con il 404, dicendo "non esiste" a chi in
       * realtà è soltanto senza rete.
       */
      if (new URL(request.url).pathname !== OFFLINE_URL) {
        return Response.redirect(new URL(OFFLINE_URL, self.location.origin).href, 302);
      }
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isAudio(request, url)) return;

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (isImage(request, url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (request.mode === "navigate" || isRscRequest(request, url)) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
  }
});
