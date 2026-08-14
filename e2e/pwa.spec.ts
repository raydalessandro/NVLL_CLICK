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

test("le pagine visitate restano leggibili offline", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.goto("/social");
  await page.waitForLoadState("networkidle");

  await context.setOffline(true);

  await page.goto("/social");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("@nvll.click");
  await expect(page.locator(".signal")).toContainText("OFFLINE");

  /*
   * Una rotta mai scaricata deve comunque dare una pagina dell'app, mai
   * l'errore di rete del browser. Su un dispositivo davvero offline il
   * service worker reindirizza a /offline; qui l'emulazione di Chromium non
   * raggiunge sempre il worker, che riesce a raggiungere il server e serve il
   * 404 reale. Entrambi gli esiti sono nostri: è questo che il test protegge.
   */
  const response = await page.goto("/rotta-mai-vista");
  expect(response?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /FUORI\s*RETE|COORDINATA\s*INESISTENTE/,
  );

  await context.setOffline(false);
});
