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

  const progressSpan = page.getByTestId("progress-counter");
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

type L2Direction = "keep" | "cut" | "reinforce" | "unjustified";

const L2_LABELS: Record<L2Direction, string> = {
  keep: "Valider cette dépense",
  cut: "Réduire cette dépense",
  reinforce: "Renforcer cette dépense",
  unjustified: "Marquer comme injustifié",
};

/**
 * Swipe a card using Level 2 (4-direction) buttons, retrying if animation guard blocks it.
 */
async function swipeCardL2(page: Page, direction: L2Direction) {
  const label = L2_LABELS[direction];
  const progressSpan = page.getByTestId("progress-counter");
  const beforeText = await progressSpan.textContent();
  const isLast = beforeText === "10/10";

  for (let attempt = 0; attempt < 5; attempt++) {
    await page.getByRole("button", { name: label }).click();

    if (isLast) {
      try {
        await expect(page).toHaveURL("/resultats", { timeout: 2_000 });
        return;
      } catch {
        continue;
      }
    }

    try {
      await expect(progressSpan).not.toHaveText(beforeText!, {
        timeout: 1_500,
      });
      return;
    } catch {
      await page.waitForTimeout(300);
    }
  }

  throw new Error(
    `L2: Failed to advance from ${beforeText} after 5 attempts`
  );
}

/**
 * Swipe a card in Level 3 (micro-audit) mode.
 * After the swipe button click, the audit screen appears.
 * We answer diagnostics and pick a recommendation, then submit.
 */
async function swipeCardL3(
  page: Page,
  direction: L2Direction,
  recommendation: string = "Maintenir le budget"
) {
  const label = L2_LABELS[direction];
  const progressSpan = page.getByTestId("progress-counter");
  const beforeText = await progressSpan.textContent();
  const isLast = beforeText === "10/10";

  // Click the vote button to trigger the audit screen
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.getByRole("button", { name: label }).click();

    // Wait for the audit screen to appear
    try {
      await expect(page.getByText("Audit")).toBeVisible({ timeout: 2_000 });
      break;
    } catch {
      await page.waitForTimeout(300);
      if (attempt === 4) {
        throw new Error(
          `L3: Audit screen did not appear from ${beforeText} after 5 attempts`
        );
      }
    }
  }

  // Answer diagnostic questions — click "OUI" for each
  const ouiButtons = page.getByRole("button", { name: "OUI" });
  const count = await ouiButtons.count();
  for (let i = 0; i < count; i++) {
    await ouiButtons.nth(i).click();
  }

  // Pick a recommendation
  await page.getByRole("button", { name: recommendation }).click();

  // Submit the audit
  await page.getByRole("button", { name: /Valider mon audit/i }).click();

  if (isLast) {
    await expect(page).toHaveURL("/resultats", { timeout: 5_000 });
  } else {
    // Wait for the swipe stack to reappear and progress to advance
    await expect(progressSpan).not.toHaveText(beforeText!, {
      timeout: 3_000,
    });
  }
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
    await expect(page.getByTestId("progress-counter")).toBeVisible({ timeout: 10_000 });

    // Swipe all 10 cards
    for (let i = 0; i < 10; i++) {
      await swipeCard(page, i % 2 === 0 ? "keep" : "cut");
    }

    // Should be on results page with archetype and stats
    await expect(page).toHaveURL("/resultats", { timeout: 5_000 });
    await expect(page.getByTestId("result-stats")).toBeVisible({ timeout: 5_000 });
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
    await expect(page.getByTestId("progress-counter")).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 10; i++) {
      await swipeCard(page, i % 2 === 0 ? "keep" : "cut");
    }

    await expect(page).toHaveURL("/resultats", { timeout: 5_000 });
    await expect(page.getByTestId("result-stats")).toBeVisible();
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
    await expect(page.getByTestId("progress-counter")).toBeVisible({ timeout: 10_000 });

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

test.describe("L2 (4 directions) flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("trnc:onboarded", "true");
      localStorage.removeItem("game_sessions");
      sessionStorage.clear();
    });
  });

  test("L2: select a deck, choose level 2, swipe all cards with 4 directions, see results", async ({
    page,
  }) => {
    // Navigate to deck selection with level=2 query param to unlock L2
    await page.goto("/jeu?level=2");

    await expect(
      page.getByRole("heading", { name: "Catégories" })
    ).toBeVisible();

    // Click Niveau 2 in the level selector
    await page.getByRole("button", { name: "Niveau 2" }).click();

    // Select the first deck
    const deckButtons = page
      .locator("button")
      .filter({ has: page.locator("h3") });
    await deckButtons.first().click();

    // Launch button should show "(N2)"
    const launchButton = page.getByRole("button", {
      name: /Lancer la session/i,
    });
    await expect(launchButton).toBeEnabled();
    await expect(launchButton).toContainText("N2");
    await launchButton.click();

    // Should navigate to /jeu/{deckId}?level=2
    await expect(page).toHaveURL(/\/jeu\/.+\?level=2/);
    await expect(page.getByTestId("progress-counter")).toBeVisible({ timeout: 10_000 });

    // Verify L2 buttons are visible (4-direction layout)
    await expect(
      page.getByRole("button", { name: "Valider cette dépense" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Réduire cette dépense" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Renforcer cette dépense" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Marquer comme injustifié" })
    ).toBeVisible();

    // Swipe all 10 cards cycling through all 4 directions
    const directions: L2Direction[] = [
      "keep",
      "cut",
      "reinforce",
      "unjustified",
    ];
    for (let i = 0; i < 10; i++) {
      await swipeCardL2(page, directions[i % 4]);
    }

    // Should be on results page with archetype and stats
    await expect(page).toHaveURL("/resultats", { timeout: 5_000 });
    await expect(page.getByTestId("result-stats")).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("L3 (micro-audit) flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("trnc:onboarded", "true");
      localStorage.removeItem("game_sessions");
      sessionStorage.clear();
    });
  });

  test("L3: select a deck, choose level 3, swipe and complete audit for all cards, see results", async ({
    page,
  }) => {
    // Navigate to deck selection with level=3 query param to unlock L3
    await page.goto("/jeu?level=3");

    await expect(
      page.getByRole("heading", { name: "Catégories" })
    ).toBeVisible();

    // Click Niveau 3 in the level selector
    await page.getByRole("button", { name: "Niveau 3" }).click();

    // Select the first deck
    const deckButtons = page
      .locator("button")
      .filter({ has: page.locator("h3") });
    await deckButtons.first().click();

    // Launch button should show "(N3)"
    const launchButton = page.getByRole("button", {
      name: /Lancer la session/i,
    });
    await expect(launchButton).toBeEnabled();
    await expect(launchButton).toContainText("N3");
    await launchButton.click();

    // Should navigate to /jeu/{deckId}?level=3
    await expect(page).toHaveURL(/\/jeu\/.+\?level=3/);
    await expect(page.getByTestId("progress-counter")).toBeVisible({ timeout: 10_000 });

    // Swipe all 10 cards with audit flow
    // Cycle through directions and recommendations for variety
    const directions: L2Direction[] = [
      "keep",
      "cut",
      "reinforce",
      "unjustified",
    ];
    const recommendations = [
      "Maintenir le budget",
      "Reduire de moitie",
      "Externaliser",
      "Fusionner avec un autre poste",
      "Renforcer (+15%)",
      "Supprimer",
    ];

    for (let i = 0; i < 10; i++) {
      await swipeCardL3(
        page,
        directions[i % 4],
        recommendations[i % recommendations.length]
      );
    }

    // Should be on results page with archetype and stats
    await expect(page).toHaveURL("/resultats", { timeout: 5_000 });
    await expect(page.getByTestId("result-stats")).toBeVisible({ timeout: 5_000 });
  });

  test("L3: audit back button returns to swipe without recording vote", async ({
    page,
  }) => {
    await page.goto("/jeu?level=3");

    await expect(
      page.getByRole("heading", { name: "Catégories" })
    ).toBeVisible();

    // Click Niveau 3
    await page.getByRole("button", { name: "Niveau 3" }).click();

    // Select the first deck and launch
    const deckButtons = page
      .locator("button")
      .filter({ has: page.locator("h3") });
    await deckButtons.first().click();
    await page.getByRole("button", { name: /Lancer la session/i }).click();

    await expect(page).toHaveURL(/\/jeu\/.+\?level=3/);
    await expect(page.getByTestId("progress-counter")).toBeVisible({ timeout: 10_000 });

    // Click a vote button to trigger audit screen
    await page
      .getByRole("button", { name: "Valider cette dépense" })
      .click();
    await expect(page.getByText("Audit")).toBeVisible({ timeout: 3_000 });

    // Click back button — should return to swipe with same card (1/10)
    await page.getByRole("button", { name: "Retour" }).click();
    await expect(page.getByTestId("progress-counter")).toHaveText("1/10", { timeout: 3_000 });
  });
});
