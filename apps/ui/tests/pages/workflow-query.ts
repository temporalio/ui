import type { Locator, Page } from '@playwright/test';

export class WorkflowQueryPage {
  readonly page: Page;
  readonly querySelectButton: Locator;
  readonly queryInput: Locator;
  readonly queryResult: Locator;
  readonly runQueryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.querySelectButton = page.getByTestId('query-select-button');
    this.queryInput = page.getByTestId('query-input').getByRole('textbox');
    this.queryResult = page.getByTestId('query-result').getByRole('textbox');
    this.runQueryButton = page.getByRole('button', { name: /query/i });
  }

  async selectQueryType(name: string) {
    await this.querySelectButton.click();
    await this.page.getByRole('option', { name }).click();
  }

  async fillQueryArg(value: string) {
    await this.queryInput.focus();
    await this.queryInput.fill(value);
  }

  async run() {
    await this.runQueryButton.click();
  }
}
