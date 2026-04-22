import type { Locator, Page } from '@playwright/test';

export class EventHistoryPage {
  readonly page: Page;
  readonly feedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.feedButton = page.getByTestId('feed');
  }

  async switchToFeed() {
    await this.feedButton.click();
  }

  eventRow(eventTypeText: string, nth: 'first' | 'last' = 'first'): Locator {
    const rows = this.page
      .getByTestId('event-summary-row')
      .filter({ hasText: eventTypeText });
    return nth === 'last' ? rows.last() : rows.first();
  }

  expandedRow(nth: 'first' | 'last' = 'first'): Locator {
    const rows = this.page.getByTestId('event-summary-row-expanded');
    return nth === 'last' ? rows.last() : rows.first();
  }

  expandedEditor(rowNth: 'first' | 'last' = 'first', editorNth = 0): Locator {
    return this.expandedRow(rowNth).getByRole('textbox').nth(editorNth);
  }

  async expandEvent(eventTypeText: string, nth: 'first' | 'last' = 'first') {
    await this.eventRow(eventTypeText, nth).click();
  }
}
