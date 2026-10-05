import { test, expect } from "@playwright/test";

/**
 * /pixee-admin doit repondre un vrai statut 404 aux non-admins (controle dans
 * src/proxy.ts, avant le streaming ouvert par le loading.tsx racine).
 */
test("pixee-admin renvoie un statut 404 a un visiteur anonyme", async ({ page }) => {
  const response = await page.goto("/pixee-admin");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Analytics", { exact: true })).toHaveCount(0);
});
