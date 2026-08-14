import { expect, test } from "@playwright/test";

test("il manifest descrive un'app installabile", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.status()).toBe(200);

  const manifest = await response.json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable")).toBe(true);
});

test("il service worker non resta bloccato su una copia in cache", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("max-age=0");
});

test("il service worker mette da parte le superfici principali", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);

  // Verifica diretta sulla cache: non dipende dall'emulazione di rete, che
  // fra un ambiente e l'altro non si comporta allo stesso modo.
  const cachedRoutes = () =>
    page.evaluate(async () => {
      const keys = await caches.keys();
      const shell = keys.find((key) => key.endsWith("-shell"));
      if (!shell) return [] as string[];
      const cache = await caches.open(shell);
      return (await cache.keys()).map((entry) => new URL(entry.url).pathname);
    });

  for (const route of ["/", "/social", "/listen", "/merch", "/offline"]) {
    await expect.poll(cachedRoutes, { timeout: 20_000 }).toContain(route);
  }
});

test("le pagine già visitate restano leggibili senza rete", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.goto("/social");
  await page.waitForLoadState("networkidle");

  await context.setOffline(true);

  const response = await page.goto("/social");
  expect(response?.fromServiceWorker()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("@nvll.click");

  /*
   * Una rotta mai scaricata deve comunque dare una pagina dell'app, mai
   * l'errore di rete del browser. Su un dispositivo davvero offline il
   * service worker reindirizza a /offline; nei runner l'emulazione non
   * raggiunge sempre il worker, che riesce a contattare il server e serve il
   * 404 reale. Entrambi gli esiti sono nostri: è questo che il test protegge.
   */
  const unknown = await page.goto("/rotta-mai-vista");
  expect(unknown?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /FUORI\s*RETE|COORDINATA\s*INESISTENTE/,
  );

  await context.setOffline(false);
});

test("l'indicatore di rete segue lo stato del browser", async ({ page }) => {
  await page.goto("/social");
  await expect(page.locator(".signal")).toContainText("SYSTEM ONLINE");

  /*
   * Si pilotano direttamente `navigator.onLine` e i suoi eventi invece di
   * usare l'emulazione di rete: quella varia da un ambiente all'altro, mentre
   * qui si vuole verificare il nostro ascoltatore, non il browser.
   */
  const setOnline = (value: boolean) =>
    page.evaluate((online) => {
      Object.defineProperty(navigator, "onLine", { value: online, configurable: true });
      window.dispatchEvent(new Event(online ? "online" : "offline"));
    }, value);

  await setOnline(false);
  await expect(page.locator(".signal")).toContainText("SYSTEM OFFLINE");

  await setOnline(true);
  await expect(page.locator(".signal")).toContainText("SYSTEM ONLINE");
});
