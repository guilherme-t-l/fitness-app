import { test, expect } from '@playwright/test';

/** Seeds/guest workouts use names like "Lower Body Focus" in v0-fitness. */
test.describe('Guest workout edit flow', () => {
  test('can be found, edited, and persists changes', async ({ page }) => {
    await page.goto('/workouts');

    const workoutName = 'Lower Body Focus';
    const workoutCard = page.getByText(workoutName, { exact: true });
    await expect(workoutCard).toBeVisible();

    const card = workoutCard.locator('xpath=ancestor::*[contains(@class,"card-glow")][1]');
    const editButton = card.getByRole('button', { name: /edit workout/i });
    await editButton.click();

    // Wait for the edit dialog to appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Change the description
    const descriptionInput = dialog.getByLabel('Description');
    const newDescription = 'Updated by Playwright E2E test';
    await descriptionInput.fill(newDescription);

    // Save changes
    const saveButton = dialog.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Wait for dialog to close
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'My Workouts' })).toBeVisible();
    const cardAfter = page.locator('.card-glow').filter({ hasText: workoutName });
    await expect(cardAfter).toBeVisible({ timeout: 15_000 });
    await expect(cardAfter.getByText(newDescription)).toBeVisible();
  });
}); 