import { test, expect } from '@playwright/test';

test.describe('Sat: Chest + Triceps + Shoulders workout', () => {
  test('can be found, edited, and persists changes', async ({ page }) => {
    await page.goto('/workouts');

    // Find the workout card by name
    const workoutCard = page.getByText('Sat: Chest + Triceps + Shoulders', { exact: true });
    await expect(workoutCard).toBeVisible();

    // Find and click the edit button (pencil icon) on the card
    const card = await workoutCard.locator('..').first();
    const editButton = card.getByRole('button', { name: /edit/i });
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

    // Reload and verify the change persists
    await page.reload();
    const updatedCard = page.getByText('Sat: Chest + Triceps + Shoulders', { exact: true });
    await expect(updatedCard).toBeVisible();
    const updatedDescription = updatedCard.locator('..').getByText(newDescription);
    await expect(updatedDescription).toBeVisible();
  });
}); 