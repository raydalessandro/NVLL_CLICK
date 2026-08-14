# NVLL CLICK

Archivio sonoro e visivo in Next.js 16, installabile come PWA. Tre superfici condividono lo stesso catalogo:

- `/social` — profilo e feed;
- `/listen` — player e catalogo musicale;
- `/` — nucleo del sito/app NVLL CLICK.

## Avvio

```bash
npm install
npm run dev
```

Il service worker è attivo **solo nelle build di produzione** (`npm run build && npm start`),
così in sviluppo non si servono mai risorse dalla cache.

## Fonte dei dati

`lib/catalog.ts` è il catalogo unico per brani, immagini e post. I binari vivono sotto
`public/media/` e sono richiamati da tutte le superfici senza duplicazioni.

La prima versione contiene gli otto frame canonici di *Mezzi immaginari* e il master source MP3.
Nessun asset legacy viene promosso automaticamente. La scheda `ARCHIVIO` del feed è vuota di
proposito: mostra uno stato vuoto esplicito finché non c'è qualcosa di davvero promosso.

## Struttura

```
app/
  layout.tsx        metadati, viewport, provider
  page.tsx          world
  listen/           release e player
  social/           profilo e feed
  offline/          fallback del service worker
  manifest.ts       manifest PWA generato
  error.tsx  global-error.tsx  not-found.tsx
  globals.css       importa app/styles/*
  styles/           base, shell, player, world, social, listen, mobile
components/         shell, player, post-modal, icone
lib/                catalogo, hook di storage e PWA
public/
  icons/            icone PWA (generate)
  media/            immagini e audio
  sw.js             service worker
scripts/
  make-icons.mjs    rigenera le icone dalla marca vettoriale
```

## PWA

- Manifest generato da `app/manifest.ts`, icone `any` + `maskable`.
- Service worker in `public/sw.js`: navigazioni e payload RSC in *network-first*,
  build asset e immagini in *cache-first*, audio sempre dalla rete
  (le richieste Range non sono memorizzabili in modo affidabile).
- Per invalidare tutte le cache dopo un cambio di strategia, alzare `VERSION` in `public/sw.js`.
- Rigenerare le icone: `npm run icons`.

## Configurazione

`NEXT_PUBLIC_SITE_URL` imposta il dominio pubblico usato dai metadati assoluti
(vedi `.env.example`). Su Vercel viene dedotto in automatico se assente.

## Verifiche

```bash
npm run check   # typecheck + lint + build
```
