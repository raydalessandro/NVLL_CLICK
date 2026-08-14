# Regole operative NVLL CLICK

1. Il catalogo in `lib/catalog.ts` è la fonte unica per asset e metadati.
2. Non inventare crediti, versioni, date di pubblicazione o stato master.
3. Un file legacy resta legacy finché Ray non lo promuove esplicitamente.
4. Social, listen e world devono consumare gli stessi oggetti catalogo.
5. L'identità visiva canonica usa nero, cemento, grafite, piani geometrici e un solo segnale verde. Evitare cyberpunk, neon decorativo e gangster cliché.
6. Ogni nuova superficie deve restare mobile-first e funzionare come export/deploy Vercel.
7. Uno stato vuoto esplicito è sempre preferibile a un contenuto inventato per riempire la UI.
8. Nessun controllo finto: se un elemento è visibile e sembra cliccabile, deve fare qualcosa o dichiararsi disabilitato.
9. Gli stili vivono in `app/styles/` divisi per superficie, non minificati. `globals.css` si limita agli import.
10. Toccando `public/sw.js` va alzata `VERSION`, altrimenti i client restano su cache vecchie.
11. Prima di consegnare: `npm run check` (typecheck + lint + build) deve passare pulito.
12. Il lockup è NVLL pesante + CLICK leggero + un punto verde; il marchio ridotto è Ø. Non invertire i pesi.
13. Il merch resta dichiarato come render finché non esistono fornitore e pagamento: niente prezzi, taglie o pulsanti d'acquisto.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
