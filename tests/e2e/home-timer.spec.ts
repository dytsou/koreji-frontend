import { test, expect } from '@playwright/test';
import { HOME_SCREEN_STRINGS } from '@/constants/strings/home';

test.describe('Home screen timer', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
  });

  test('reflects default values and supports adjustments', async ({ page }) => {
    const { headerTitle, actions } = HOME_SCREEN_STRINGS;
    await expect(page.getByTestId('home-header-title')).toHaveText(headerTitle);

    const hoursValue = page.getByTestId('hours-value');
    const minutesValue = page.getByTestId('minutes-value');
    const incrementHoursButton = page.getByTestId('increment-hours');
    const decrementHoursButton = page.getByTestId('decrement-hours');
    const incrementMinutesButton = page.getByTestId('increment-minutes');
    const decrementMinutesButton = page.getByTestId('decrement-minutes');
    const recommendButton = page.getByTestId('recommend-button');

    await expect(hoursValue).toHaveText('00');
    await expect(minutesValue).toHaveText('20');

    // Wait for button to be actionable, then click
    await expect(incrementHoursButton).toBeEnabled();
    await incrementHoursButton.click();
    // Wait for state update with polling - WebKit may need more time
    await expect.poll(async () => {
      const text = await hoursValue.textContent();
      return text;
    }, { timeout: 10000 }).toBe('01');

    await expect(incrementMinutesButton).toBeEnabled();
    await incrementMinutesButton.click();
    await incrementMinutesButton.click();
    await expect.poll(async () => {
      const text = await minutesValue.textContent();
      return text;
    }, { timeout: 10000 }).toBe('22');

    await expect(decrementHoursButton).toBeEnabled();
    await decrementHoursButton.click();
    await expect.poll(async () => {
      const text = await hoursValue.textContent();
      return text;
    }, { timeout: 10000 }).toBe('00');

    await expect(decrementMinutesButton).toBeEnabled();
    await decrementMinutesButton.click();
    await expect.poll(async () => {
      const text = await minutesValue.textContent();
      return text;
    }, { timeout: 10000 }).toBe('21');

    await expect(recommendButton).toContainText(actions.recommendButton);

    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await recommendButton.click();
    await expect(recommendButton).toBeVisible();
    await expect.poll(
      () => consoleLogs.some((log) => log.includes(actions.recommendLog)),
    ).toBeTruthy();
  });

  test('validates "Other" place input with character limit and warning', async ({ page }) => {
    const MAX_INPUT_LENGTH = 30;
    
    // Find and click the Place filter dropdown
    const placeDropdown = page.getByTestId('filter-dropdown-place');
    await expect(placeDropdown).toBeVisible();
    
    // Wait for element to be actionable before clicking
    await expect(placeDropdown).toBeEnabled();
    
    // Click and wait for the click to complete
    await placeDropdown.click();
    
    // Wait for modal to appear - use a more reliable approach
    // First wait for any modal content to appear (check for modal title or modal content)
    const modalTitle = page.getByTestId('filter-modal-title');
    
    // Use polling to wait for the modal to appear, which is more reliable
    // than just waiting for visibility. Check if element exists in DOM first.
    // Also check for the "Other" text as a fallback indicator that modal is open
    await expect.poll(
      async () => {
        try {
          // First check if modal title exists and is visible
          const titleCount = await modalTitle.count();
          if (titleCount > 0) {
            const isTitleVisible = await modalTitle.isVisible();
            if (isTitleVisible) {
              // Verify it has the expected text to ensure it's fully rendered
              const text = await modalTitle.textContent();
              if (text?.includes('Select')) {
                return true;
              }
            }
          }
          // Fallback: check if "Other" option is visible (indicates modal is open)
          const otherOption = page.getByText('Other');
          const otherCount = await otherOption.count();
          if (otherCount > 0) {
            return await otherOption.isVisible();
          }
          return false;
        } catch {
          return false;
        }
      },
      { timeout: 15000, intervals: [200, 300, 500] }
    ).toBe(true);
    
    // Verify the text content - this also acts as an additional wait
    await expect(modalTitle).toHaveText('Select Place', { timeout: 5000 });
    
    // Now wait for the "Other" option to be visible within the modal
    const otherOption = page.getByText('Other');
    await expect(otherOption).toBeVisible({ timeout: 5000 });
    
    // Select "Other" option
    await otherOption.click();
    
    // Verify input field appears
    const inputField = page.getByTestId('filter-other-input');
    await expect(inputField).toBeVisible();
    
    // Test typing within limit
    const validText = 'My Custom Place';
    await inputField.fill(validText);
    await expect(inputField).toHaveValue(validText);
    
    // Verify no warning appears for valid input
    const warningText = page.getByTestId('input-warning-text');
    await expect(warningText).not.toBeVisible();
    
    // Test typing up to the limit
    const textAtLimit = 'A'.repeat(MAX_INPUT_LENGTH);
    await inputField.fill(textAtLimit);
    await expect(inputField).toHaveValue(textAtLimit);
    
    // Verify warning message appears when at limit
    await expect(warningText).toBeVisible();
    await expect(warningText).toHaveText('Maximum length reached');
    
    // Test that input cannot exceed limit
    const textOverLimit = 'A'.repeat(MAX_INPUT_LENGTH + 10);
    await inputField.fill(textOverLimit);
    // Input should be truncated to max length
    await expect(inputField).toHaveValue(textAtLimit);
    await expect(warningText).toBeVisible();
    
    // Verify Done button is enabled when input is valid
    const doneButton = page.getByTestId('filter-modal-done-button');
    await expect(doneButton).toBeEnabled();
    
    // Close modal by clicking Done
    await doneButton.click();
    
    // Verify modal is closed - wait for it to disappear
    await expect(modalTitle).not.toBeVisible({ timeout: 3000 });
    
    // Verify the custom value is displayed in the dropdown
    await expect(placeDropdown).toContainText(textAtLimit);
  });
});