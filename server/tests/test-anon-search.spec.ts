import { test, expect, type Page } from '@playwright/test';

test.describe('Anonymous user search', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });

  test('should show sitter cards when a location search is performed', async () => {
    // Enter a location and submit search
    await page.fill('.search-input', 'Seattle, WA');
    await page.click('.search-button');

    // URL should contain the search query
    expect(page.url()).toContain('location=Seattle');

    // Wait for API call to complete
    await page.waitForResponse(resp => resp.url().includes('/api/v1/sitters/search'));

    // There should be at least one sitter card
    const sitterCards = await page.locator('.sitter-card').count();
    expect(sitterCards).toBeGreaterThan(0);
  });

  test('should update filters and show filtered results', async () => {
    // Enter a location and submit search
    await page.fill('.search-input', 'Seattle, WA');
    await page.click('.search-button');
    
    // Wait for initial results
    await page.waitForResponse(resp => resp.url().includes('/api/v1/sitters/search'));
    
    // Get initial count of sitter cards
    const initialCount = await page.locator('.sitter-card').count();
    
    // Apply filters: dogs only
    await page.selectOption('#pet-type-filter', 'dogs');
    
    // Wait for filtered results
    await page.waitForResponse(resp => resp.url().includes('petType=dogs'));
    
    // Get count after filtering
    const filteredCount = await page.locator('.sitter-card').count();
    
    // There should be equal or fewer results after filtering
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Check that each sitter has dogs in their pet types
    const petTypeIcons = await page.locator('.pet-type-icon').allTextContents();
    for (const icon of petTypeIcons) {
      expect(icon).toContain('🐕');
    }
  });

  test('should show empty state when no results match filters', async () => {
    // Enter a location and submit search
    await page.fill('.search-input', 'Seattle, WA');
    await page.click('.search-button');
    
    // Wait for initial results
    await page.waitForResponse(resp => resp.url().includes('/api/v1/sitters/search'));
    
    // Apply impossible filter combination: very low price and perfect rating
    await page.fill('#price-filter', '20');
    await page.selectOption('#rating-filter', '5');
    
    // Wait for filtered results
    await page.waitForResponse(resp => resp.url().includes('maxPrice=20') && resp.url().includes('minRating=5'));
    
    // Empty state should be visible
    const emptyState = await page.locator('[data-cy="empty-state"]').isVisible();
    expect(emptyState).toBeTruthy();
  });
});