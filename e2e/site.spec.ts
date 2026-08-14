import { expect, test } from "@playwright/test";

test.describe("post aperto", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/social");
  });

  // Il pulsante di chiusura stava fuori dall'articolo e su mobile finiva oltre
  // il bordo dello schermo: il post non si chiudeva più.
  test("il pulsante di chiusura resta dentro il viewport", async ({ page }) => {
    await page.getByRole("button", { name: "Apri il post 3" }).click();

    const close = page.getByRole("button", { name: "Chiudi post" });
    await expect(close).toBeVisible();

    const box = (await close.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  });

  test("si chiude con Esc, col pulsante e col tasto indietro", async ({ page }) => {
    const dialog = page.locator("dialog.post-modal");
    const open = () => page.getByRole("button", { name: "Apri il post 3" }).click();
    const isOpen = () => dialog.evaluate((node: HTMLDialogElement) => node.open);

    await open();
    await expect.poll(isOpen).toBe(true);
    await page.keyboard.press("Escape");
    await expect.poll(isOpen).toBe(false);

    await open();
    await page.getByRole("button", { name: "Chiudi post" }).click();
    await expect.poll(isOpen).toBe(false);

    // In standalone il gesto indietro è l'unica uscita disponibile.
    await open();
    await page.goBack();
    await expect.poll(isOpen).toBe(false);
    await expect(page).toHaveURL(/\/social$/);
  });
});

test.describe("schede del feed", () => {
  test("filtrano i post e dichiarano l'archivio vuoto", async ({ page }) => {
    await page.goto("/social");
    const tiles = page.locator(".post-grid > button");

    await expect(tiles).toHaveCount(9);

    await page.getByRole("tab", { name: "TRACCE" }).click();
    await expect(tiles).toHaveCount(1);

    await page.getByRole("tab", { name: "ARCHIVIO" }).click();
    await expect(page.locator(".empty-state")).toBeVisible();
    await expect(tiles).toHaveCount(0);

    await page.getByRole("tab", { name: "GRIGLIA" }).click();
    await expect(tiles).toHaveCount(9);
  });

  test("rispondono alle frecce come impone role=tab", async ({ page }) => {
    await page.goto("/social");
    await page.getByRole("tab", { name: "GRIGLIA" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { selected: true })).toHaveText("TRACCE");

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { selected: true })).toHaveText("ARCHIVIO");

    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { selected: true })).toHaveText("GRIGLIA");

    // Il gruppo deve occupare una sola tappa di tabulazione.
    const indexes = await page.locator("[role=tab]").evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).tabIndex),
    );
    expect(indexes).toEqual([0, -1, -1]);
  });
});

test.describe("persistenza", () => {
  test("like e follow sopravvivono a una nuova visita", async ({ page }) => {
    await page.goto("/social");

    await page.getByRole("button", { name: "Apri il post 1" }).click();
    await page.getByRole("button", { name: "Metti like" }).click();
    await page.keyboard.press("Escape");
    // Esc chiude il post facendo un passo indietro nella cronologia: navigare
    // prima che sia concluso annullerebbe la richiesta.
    await expect
      .poll(() => page.locator("dialog.post-modal").evaluate((node: HTMLDialogElement) => node.open))
      .toBe(false);

    await page.goto("/social");
    await expect(page.locator(".grid-like")).toHaveCount(1);

    await page.getByRole("button", { name: "SEGUITO" }).click();
    await page.goto("/social");
    await expect(page.locator(".handle-row button")).toHaveText("SEGUI");
  });
});

test.describe("player", () => {
  test("riproduce, mette in pausa e mostra la durata del file", async ({ page }) => {
    await page.goto("/listen");

    const duration = await page.locator("audio").evaluate(
      (audio: HTMLAudioElement) =>
        new Promise<number>((resolve) => {
          if (audio.readyState >= 1) resolve(audio.duration);
          else audio.addEventListener("loadedmetadata", () => resolve(audio.duration), { once: true });
        }),
    );
    // Il brano completo dura 2:56. Un file troncato si vedrebbe qui.
    expect(duration).toBeGreaterThan(170);

    await page.locator(".big-play").click();
    await expect(page.locator(".big-play span")).toHaveText("IN RIPRODUZIONE");
    await expect
      .poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime))
      .toBeGreaterThan(0.2);

    await page.locator(".big-play").click();
    await expect
      .poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.paused))
      .toBe(true);
  });

  test("dichiara l'assenza di rete invece di incolpare il file", async ({ page, context }) => {
    await page.goto("/listen");
    await context.setOffline(true);
    await page.locator("audio").evaluate((audio: HTMLAudioElement) => {
      audio.src = `/media/audio/mezzi-immaginari.mp3?offline=${Date.now()}`;
      audio.load();
      void audio.play().catch(() => {});
    });

    await expect(page.locator(".player-error")).toContainText("offline");
    await context.setOffline(false);
  });
});

test.describe("merch", () => {
  test("mostra i render senza alcun controllo d'acquisto", async ({ page }) => {
    await page.goto("/merch");

    await expect(page.locator(".merch-grid article")).toHaveCount(6);
    await expect(page.locator(".merch-badge")).toHaveCount(6);
    await expect(page.locator(".merch-notice")).toContainText("Nessuno di questi capi è in vendita");

    // Finché non esistono fornitore e pagamento, niente prezzi o carrelli.
    const commerce = page
      .locator("button, [role=button]")
      .filter({ hasText: /acquist|carrell|compra|€|prezzo/i });
    await expect(commerce).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("€");
  });
});

test.describe("metadati", () => {
  // Il layout radice compone i titoli con il template `%s — NVLL CLICK`:
  // se una pagina aggiunge il brand a mano, il nome compare due volte.
  const TITLES: [string, string][] = [
    ["/", "NVLL CLICK — Identità in ascolto"],
    ["/merch", "Merch — NVLL CLICK"],
    ["/game", "WORLD 00 — NVLL CLICK"],
    ["/offline", "Fuori rete — NVLL CLICK"],
  ];

  for (const [route, title] of TITLES) {
    test(`il titolo di ${route} nomina il brand una volta sola`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveTitle(title);
    });
  }
});
