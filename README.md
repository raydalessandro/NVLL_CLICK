# NVLL CLICK

Archivio sonoro e visivo in Next.js 16. Tre superfici condividono lo stesso catalogo:

- `/social` — profilo social sperimentale;
- `/listen` — player e catalogo musicale;
- `/` — nucleo del sito/app NVLL CLICK.

## Avvio

```bash
npm install
npm run dev
```

## Fonte dei dati

`lib/catalog.ts` è il catalogo unico per brani e immagini. I binari vivono sotto `public/media/` e sono richiamati da tutte le superfici senza duplicazioni.

La prima versione contiene gli otto frame canonici di *Mezzi immaginari* e il master source MP3. Nessun asset legacy viene promosso automaticamente.

## Verifiche

```bash
npm run typecheck
npm run lint
npm run build
```
