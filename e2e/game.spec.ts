import { expect, test } from "@playwright/test";

test.describe("WORLD 00", () => {
  test("il tasto centrale del dock porta al gioco", async ({ page }) => {
    await page.goto("/social");

    const core = page.getByRole("link", { name: /WORLD 00/ });
    await expect(core).toBeVisible();

    const box = (await core.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);

    await core.click();
    await expect(page).toHaveURL(/\/game$/);
  });

  test("il gioco prende lo schermo senza annidare la shell", async ({ page }) => {
    await page.goto("/game");

    // Un solo <main>: il gioco ne porta uno proprio, la shell si toglie.
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator(".dock")).toHaveCount(0);
    await expect(page.locator(".bottom-player")).toHaveCount(0);
  });

  test("il canvas disegna davvero il mondo", async ({ page }) => {
    await page.goto("/game");

    const canvas = page.locator("canvas");
    await expect(canvas).toHaveAttribute("width", "160");
    await expect(canvas).toHaveAttribute("height", "144");

    // Un canvas nero o vuoto avrebbe pochissimi colori distinti.
    await expect
      .poll(
        () =>
          canvas.evaluate((node: HTMLCanvasElement) => {
            const pixels = node.getContext("2d")!.getImageData(0, 0, node.width, node.height).data;
            const colours = new Set<string>();
            for (let i = 0; i < pixels.length; i += 4) {
              colours.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
            }
            return colours.size;
          }),
        { timeout: 15_000 },
      )
      .toBeGreaterThan(20);
  });

  test("SELECT riporta al sito, START resta inerte", async ({ page }) => {
    await page.goto("/game");

    const start = page.getByRole("button", { name: /START/ });
    await expect(start).toBeDisabled();

    const select = page.getByRole("link", { name: /SELECT/ });
    await expect(select).toBeVisible();
    await select.click();

    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.locator(".dock")).toHaveCount(1);
  });

  test("il giocatore si muove e il mondo viene salvato", async ({ page }) => {
    await page.goto("/game");
    await page.locator("canvas").waitFor();

    // La prima trasmissione occupa la finestra di dialogo: si chiude con A.
    await page.getByRole("button", { name: "Pulsante A" }).click();
    await page.waitForTimeout(300);

    const readSave = () =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem("nvll-click-world-00");
        return raw ? (JSON.parse(raw) as { x: number; y: number }) : null;
      });

    const before = await readSave();
    expect(before).not.toBeNull();

    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(900);
    await page.keyboard.up("ArrowUp");
    await page.waitForTimeout(400);

    const after = await readSave();
    expect(after!.y).toBeLessThan(before!.y);
  });

  test("la sound room usa il player del sito, non un secondo audio", async ({ page }) => {
    await page.goto("/game");

    // Un solo elemento audio in pagina: due sorgenti suonerebbero insieme.
    await expect(page.locator("audio")).toHaveCount(1);

    const src = await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.src);
    expect(src).toContain("mezzi-immaginari.mp3");
  });

  test("i prototipi non espongono prezzi", async ({ page }) => {
    await page.goto("/game");
    await expect(page.locator("body")).not.toContainText("€");
  });
});
