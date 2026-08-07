import { test, expect } from '@playwright/test';

/** Seeds/guest workouts use names like "Lower Body Focus" in v0-fitness. */
test.describe('Guest workout edit flow', () => {
  test('can be found, edited, and persists changes', async ({ page }) => {
    await page.goto('/workouts');

    const workoutName = 'Lower Body Focus';
    const workoutHeading = page.getByRole('heading', { name: workoutName, exact: true });
    await expect(workoutHeading).toBeVisible();

    const article = workoutHeading.locator('xpath=ancestor::article[1]');
    const editButton = article.getByRole('button', { name: /edit workout/i });
    await editButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const descriptionInput = dialog.getByLabel('Description');
    const newDescription = 'Updated by Playwright E2E test';
    await descriptionInput.fill(newDescription);

    const saveButton = dialog.getByRole('button', { name: /save/i });
    await saveButton.click();

    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();
    const articleAfter = page.getByRole('heading', { name: workoutName, exact: true }).locator('xpath=ancestor::article[1]');
    await expect(articleAfter).toBeVisible({ timeout: 15_000 });
    await expect(articleAfter.getByText(newDescription)).toBeVisible();
  });
});
