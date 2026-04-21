import type { Locator, Page } from '@playwright/test';

export class WorkflowDetailPage {
  readonly page: Page;
  readonly inputAndResult: Locator;
  readonly main: Locator;
  readonly memoTab: Locator;
  readonly searchAttributesTab: Locator;
  readonly historyTab: Locator;
  readonly callStackTab: Locator;
  readonly queriesTab: Locator;
  readonly callStackEditor: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inputAndResult = page.getByTestId('input-and-result');
    this.main = page.locator('main');
    this.memoTab = page.getByTestId('memo-tab');
    this.searchAttributesTab = page.getByTestId('search-attributes-tab');
    this.historyTab = page.getByTestId('history-tab');
    this.callStackTab = page.getByTestId('call-stack-tab');
    this.queriesTab = page.getByTestId('queries-tab');
    this.callStackEditor = page.getByRole('textbox');
  }

  async navigate(baseURL: string, workflowId: string) {
    await this.page.goto(baseURL);
    await this.page
      .getByRole('link', { name: workflowId, exact: true })
      .click();
  }

  async openMemo() {
    await this.memoTab.click();
  }

  async openSearchAttributes() {
    await this.searchAttributesTab.click();
  }

  async openHistory() {
    await this.historyTab.click();
  }

  async openCallStack() {
    await this.callStackTab.click();
  }

  async openQueries() {
    await this.queriesTab.click();
  }
}
