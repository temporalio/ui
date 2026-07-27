import type { Locator, Page } from '@playwright/test';

export class DataEncoderSettingsPage {
  readonly page: Page;
  readonly statusButton: Locator;
  readonly statusConfiguredButton: Locator;
  readonly mobileStatusButton: Locator;
  readonly mobileStatusConfiguredButton: Locator;
  readonly title: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly useLocalEndpointRadio: Locator;
  readonly useConfigurationEndpointRadio: Locator;
  readonly endpointInput: Locator;
  readonly errorMessage: Locator;
  readonly passAccessTokenLabel: Locator;
  readonly includeCredentialsLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statusButton = page.getByTestId('data-encoder-status');
    this.statusConfiguredButton = page.getByTestId(
      'data-encoder-status-configured',
    );
    this.mobileStatusButton = page.getByTestId('mobile-data-encoder-status');
    this.mobileStatusConfiguredButton = page.getByTestId(
      'mobile-data-encoder-status-configured',
    );
    this.title = page.getByTestId('data-encoder-title');
    this.confirmButton = page.locator(
      '#data-encoder-settings >> [data-testid="confirm-modal-button"]',
    );
    this.cancelButton = page.locator(
      '#data-encoder-settings >> [data-testid="cancel-modal-button"]',
    );
    this.useLocalEndpointRadio = page.getByTestId('use-local-endpoint-input');
    this.useConfigurationEndpointRadio = page.getByTestId(
      'use-configuration-endpoint-input',
    );
    this.endpointInput = page.locator('#data-encoder-endpoint-input');
    this.errorMessage = page.locator('.error-msg');
    this.passAccessTokenLabel = page
      .locator('label')
      .filter({ hasText: 'Pass the user access token' });
    this.includeCredentialsLabel = page
      .locator('label')
      .filter({ hasText: 'Include cross-origin credentials' });
  }

  async openSettings() {
    await this.statusButton.click();
  }

  async openConfiguredSettings() {
    await this.statusConfiguredButton.click();
  }

  async openMobileSettings() {
    await this.mobileStatusButton.click();
  }

  async openMobileConfiguredSettings() {
    await this.mobileStatusConfiguredButton.click();
  }

  async selectLocalEndpoint() {
    await this.useLocalEndpointRadio.click();
  }

  async selectConfigurationEndpoint() {
    await this.useConfigurationEndpointRadio.click();
  }

  async setEndpoint(endpoint: string) {
    await this.endpointInput.fill(endpoint);
  }

  async enablePassAccessToken() {
    await this.passAccessTokenLabel.click();
  }

  async enableIncludeCredentials() {
    await this.includeCredentialsLabel.click();
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getTitle(): Promise<string> {
    return await this.title.innerText();
  }

  async getEndpointValue(): Promise<string> {
    return (await this.endpointInput.inputValue()) || '';
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.innerText();
  }
}
