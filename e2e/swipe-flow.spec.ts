import { test, expect, type Page } from "@playwright/test";

/**
 * Swipe a card via button click, retrying if the animation guard blocks it.
 * The SwipeStack uses an `isAnimating` ref that silently drops clicks.
 */
async function swipeCard(page: Page, direction: "keep" | "cut") {
  const label =
    direction === "keep"
      ? "Valider cette dépense"
      : "Remettre en question cette dépense";

  const progressSpan = page.locator("text=/\\d+\\/10/").first();
  const beforeText = await progressSpan.textContent();
  const isLast = beforeText === "10/10";

  // Retry clicking until the state changes (animation guard may silently drop clicks)
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.getByRole("button", { name: label }).click();

    if (isLast) {
      // Last card — wait for navigation
      try {
        await expect(page).toHaveURL("/resultats", { timeout: 2_000 });
        return;
      } catch {
        // Retry click
        continue;
      }
    }

    // Wait for progress counter to change
    try {
      await expect(progressSpan).not.toHaveText(beforeText!, {
        timeout: 1_500,
      });
      return;
    } catch {
      // Click was dropped by isAnimating guard, wait a bit and retry
      await page.waitForTimeout(300);
    }
  }

  throw new Error(`Failed to advance from ${beforeText} after 5 attempts`);
}

test.describe("Swipe -> Results flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("trnc:onboarded", "true");
      localStorage.removeItem("game_sessions");
      sessionStorage.clear();
    });
  });

  test("L1: select a deck, swipe all cards, see results with archetype", async ({
    page,
  }) => {
    await page.goto("/jeu");

    await expect(
      page.getByRole("heading", { name: "Catégories" })
    ).toBeVisible();

    // Select the first deck card
    const deckButtons = page
      .locator("button")
      .filter({ has: page.locator("h3") });
    await deckButtons.first().click();

    const launchButton = page.getByRole("button", {
      name: /Lancer la session/i,
    });
    await expect(launchButton).toBeEnabled();
    await launchButton.click();

    await expect(page).toHaveURL(/\/jeu\/.+/);
    await expect(page.getByText(/1\/10/)).toBeVisible({ timeout: 10_000 });

    // Swipe all 10 cards
    for (let i = 0; i < 10; i++) {
      await swipeCard(page, i % 2 === 0 ? "keep" : "cut");
    }

    // Should be on results page with archetype and stats
    await expect(page).toHaveURL("/resultats", { timeout: 5_000 });
    await expect(page.getByText(/%/).first()).toBeVisible({ timeout: 5_000 });
  });

  test("L1 random mode: toggle random, swipe all, see results", async ({
    page,
  }) => {
    await page.goto("/jeu");

    await expect(
      page.getByRole("heading", { name: "Catégories" })
    ).toBeVisible();

    // Click the toggle label to enable random mode
    await page
      .locator("label")
      .filter({ has: page.getByLabel("Mode aléatoire") })
      .click();

    const launchButton = page.getByRole("button", {
      name: /Lancer la session/i,
    });
    await expect(launchButton).toBeEnabled();
    await launchButton.click();

    await expect(page).toHaveURL(/\/jeu\/random/);
    await expect(page.getByText(/1\/10/)).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 10; i++) {
      await swipeCard(page, i % 2 === 0 ? "keep" : "cut");
    }

    await expect(page).toHaveURL("/resultats", { timeout: 5_000 });
    await expect(page.getByText(/%/).first()).toBeVisible();
  });

  test("navigation: quit session returns to /jeu", async ({ page }) => {
    await page.goto("/jeu");

    await expect(
      page.getByRole("heading", { name: "Catégories" })
    ).toBeVisible();

    const deckButtons = page
      .locator("button")
      .filter({ has: page.locator("h3") });
    await deckButtons.first().click();
    await page.getByRole("button", { name: /Lancer la session/i }).click();
    await expect(page).toHaveURL(/\/jeu\/.+/);
    await expect(page.getByText(/1\/10/)).toBeVisible({ timeout: 10_000 });

    // Swipe one card so quit dialog appears
    await swipeCard(page, "keep");

    // Accept the confirm dialog and quit
    page.on("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Quitter la session" })
      .click();

    await expect(page).toHaveURL("/jeu", { timeout: 5_000 });
  });
});
