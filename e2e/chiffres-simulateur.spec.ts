import { test, expect, type Page } from "@playwright/test";

/** Graphiques recharts de /chiffres (barres x5, aire de la dette, anneau des recettes). */
const RECHARTS_COUNT = 7;

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("/chiffres", () => {
  test("les graphiques sont rendus avec une taille non nulle", async ({ page }) => {
    await page.goto("/chiffres");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const surfaces = page.locator("figure svg.recharts-surface");
    await expect(surfaces).toHaveCount(RECHARTS_COUNT, { timeout: 15_000 });
    for (const surface of await surfaces.all()) {
      await surface.scrollIntoViewIfNeeded();
      const box = await surface.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(100);
      expect(box?.height ?? 0).toBeGreaterThan(100);
    }
  });

  test("chaque graphique a un tableau alternatif qu'on peut ouvrir", async ({ page }) => {
    await page.goto("/chiffres");
    const figures = page.locator("figure[aria-describedby]");
    const count = await figures.count();
    expect(count).toBeGreaterThanOrEqual(RECHARTS_COUNT);

    for (const figure of await figures.all()) {
      const table = figure.locator("table");
      await expect(table).toBeHidden();
      await figure.getByText("Données et méthode").click();
      await expect(table).toBeVisible();
      expect(await table.locator("tbody tr").count()).toBeGreaterThan(0);
    }
  });

  test.describe("à 390 px", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("pas de défilement horizontal, tableaux ouverts compris", async ({ page }) => {
      await page.goto("/chiffres");
      await expect(page.locator("figure svg.recharts-surface")).toHaveCount(RECHARTS_COUNT, { timeout: 15_000 });
      await expectNoHorizontalScroll(page);

      for (const summary of await page.locator("figure summary").all()) {
        await summary.click();
      }
      await expectNoHorizontalScroll(page);
    });
  });
});

test.describe("/simulateur", () => {
  test.beforeEach(async ({ page }) => {
    // Partage déterministe : pas de feuille de partage native, presse-papiers simulé.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
      const store = window as unknown as { __copied?: string };
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text: string) => {
            store.__copied = text;
          },
        },
        configurable: true,
      });
    });
  });

  test("la saisie met à jour l'estimation et l'URL", async ({ page }) => {
    await page.goto("/simulateur");
    const gross = page.getByLabel("Salaire annuel brut", { exact: true });
    const total = page.locator("p.kicker", { hasText: "Prélèvements estimés" }).locator("xpath=following-sibling::p[1]");

    const before = await total.textContent();
    await gross.fill("60000");
    await expect(total).not.toHaveText(before ?? "");
    await expect.poll(() => new URL(page.url()).searchParams.get("brut")).toBe("60000");
    await expect(page.getByText(/Soit 5\s000\s€ brut par mois/)).toBeVisible();
  });

  test("vue par mois, puis lien de partage avec ?vue=mois", async ({ page, browser }) => {
    await page.goto("/simulateur");
    await page.getByLabel("Salaire annuel brut", { exact: true }).fill("36000");

    await page.getByRole("button", { name: "Par mois" }).click();
    await expect(page.getByRole("button", { name: "Par mois" })).toHaveAttribute("aria-pressed", "true");
    const monthly = page.getByLabel("Salaire mensuel brut", { exact: true });
    await expect(monthly).toHaveValue("3000");
    await expect(page.getByRole("heading", { name: "Estimation par mois" })).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get("vue")).toBe("mois");

    await page.getByRole("button", { name: "Partager cette simulation" }).click();
    await expect(page.getByRole("button", { name: "Lien copié" })).toBeVisible();
    const copied = await page.evaluate(() => (window as unknown as { __copied?: string }).__copied ?? "");
    const shared = new URL(copied);
    expect(shared.pathname).toBe("/simulateur");
    expect(shared.searchParams.get("vue")).toBe("mois");
    expect(shared.searchParams.get("brut")).toBe("36000");

    // Le lien partagé rouvre la même simulation, en vue mensuelle.
    const context = await browser.newContext();
    const other = await context.newPage();
    await other.goto(shared.pathname + shared.search);
    await expect(other.getByRole("button", { name: "Par mois" })).toHaveAttribute("aria-pressed", "true");
    await expect(other.getByLabel("Salaire mensuel brut", { exact: true })).toHaveValue("3000");
    await context.close();
  });
});
