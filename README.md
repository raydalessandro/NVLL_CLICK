# NVLL CLICK

Archivio sonoro e visivo in Next.js 16, installabile come PWA. Tre superfici condividono lo stesso catalogo:

- `/social` — profilo e feed;
- `/listen` — player e catalogo musicale;
- `/merch` — capi allo stadio di render, nulla in vendita;
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

Il catalogo musicale legacy (~50 MP3 nella cartella Drive `NULL CLICK`) **non** è nel progetto:
l'uscita dichiarata è *Mezzi immaginari* e nient'altro viene nominato o classificato.

### Merch

`public/media/merch/` contiene sei render provenienti dalla cartella Drive legacy `MERCH`,
ritagliati per rimuovere il watermark del generatore. Sono immagini di studio, non fotografie
di capi prodotti: la pagina lo dichiara e non espone prezzi, taglie o pulsanti d'acquisto.
Il capo "ERROR 404" della stessa serie è escluso perché in contrasto con la regola 5.

## Struttura

```
app/
  layout.tsx        metadati, viewport, provider
  page.tsx          world
  listen/           release e player
  social/           profilo e feed
  merch/            render dei capi
  offline/          fallback del service worker
  manifest.ts       manifest PWA generato
  error.tsx  global-error.tsx  not-found.tsx
  globals.css       importa app/styles/*
  styles/           base, shell, player, world, social, listen, merch, mobile
components/         shell, player, post-modal, icone
lib/                catalogo, hook di storage e PWA
public/
  icons/            icone PWA (generate)
  media/            visuals, audio, merch
  sw.js             service worker
scripts/
  make-icons.mjs    rigenera le icone dal monogramma Ø
```

## Marchio

Il lockup è **NVLL** in peso pesante, **CLICK** in peso leggero e un solo punto verde
(`--acid`). Il monogramma **Ø** è il marchio ridotto e alimenta le icone PWA.

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

## Accessibilità

Le pagine passano axe-core su WCAG 2.1 AA senza violazioni. Il contrasto va misurato
sui pixel resi: il velo di grana su `body::before` copre tutta l'app e sposta i valori
rispetto al colore dichiarato in CSS. `--dim` è il grigio più scuro che regge 4.5:1
su ogni fondo dell'app; sotto quello si esce da AA.

## Verifiche

```bash
npm run check   # typecheck + lint + build
```

Per i binari conviene un controllo a parte: confrontare dimensione e, per l'audio,
i frame dichiarati nell'header Xing contro quelli realmente presenti. Un file troncato
supera build, lint e typecheck senza segnalare nulla.
