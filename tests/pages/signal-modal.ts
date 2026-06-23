import type { Locator, Page } from '@playwright/test';

export class SignalModalPage {
  readonly page: Page;
  readonly moreActionsButton: Locator;
  readonly sendSignalMenuItem: Locator;
  readonly modal: Locator;
  readonly signalSelectButton: Locator;
  readonly payloadInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.moreActionsButton = page.getByRole('button', { name: 'More Actions' });
    this.sendSignalMenuItem = page.getByRole('menuitem', {
      name: 'Send a Signal',
    });
    this.modal = page.getByTestId('signal-confirmation-modal').nth(1);
    this.signalSelectButton = this.modal.getByTestId('signal-select-button');
    this.payloadInput = this.modal.getByRole('textbox').nth(1);
    this.submitButton = this.modal.locator(
      '[data-testid="confirm-modal-button"]',
    );
  }

  async open() {
    await this.moreActionsButton.click();
    await this.sendSignalMenuItem.click();
  }

  async selectSignal(name: string) {
    await this.signalSelectButton.click();
    await this.modal.getByRole('option', { name }).click();
  }

  async fillPayload(json: string) {
    await this.payloadInput.fill(json);
  }

  async submit() {
    await this.submitButton.focus();
    await this.submitButton.click();
  }
}
