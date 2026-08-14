import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

const ROUTES = ["/", "/social", "/listen", "/merch", "/game", "/offline", "/rotta-inesistente"];

for (const route of ROUTES) {
  test(`nessuna violazione di accessibilità su ${route}`, async ({ page }) => {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

    expect(
      violations.map((violation) => `${violation.id} @ ${violation.nodes[0]?.target.join(" ")}`),
    ).toEqual([]);
  });
}

test("il post aperto resta accessibile", async ({ page }) => {
  await page.goto("/social");
  await page.getByRole("button", { name: "Apri il post 3" }).click();
  await expect(page.getByRole("button", { name: "Chiudi post" })).toBeVisible();

  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations.map((violation) => violation.id)).toEqual([]);
});

test("lo skip link è la prima tappa di tabulazione", async ({ page }) => {
  await page.goto("/social");
  await page.keyboard.press("Tab");

  const focused = await page.evaluate(() => document.activeElement?.className ?? "");
  expect(focused).toContain("skip-link");

  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("contenuto");
});
