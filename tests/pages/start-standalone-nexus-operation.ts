import type { Locator, Page } from '@playwright/test';

export class StartStandaloneNexusOperationPage {
  readonly page: Page;
  readonly operationIdInput: Locator;
  readonly endpointInput: Locator;
  readonly serviceInput: Locator;
  readonly operationNameInput: Locator;
  readonly startToCloseTimeoutInput: Locator;
  readonly scheduleToCloseTimeoutInput: Locator;
  readonly submitButton: Locator;
  readonly operationIdInputError: Locator;
  readonly endpointInputError: Locator;
  readonly serviceInputError: Locator;
  readonly operationNameInputError: Locator;
  readonly timeoutError: Locator;
  readonly moreOptionsButton: Locator;
  readonly addSearchAttributesCard: Locator;
  readonly addMetadataCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.operationIdInput = page.locator('#operationId');
    this.endpointInput = page.locator('#endpoint');
    this.serviceInput = page.locator('#service');
    this.operationNameInput = page.locator('#operation');
    this.startToCloseTimeoutInput = page.locator('#startToCloseTimeout');
    this.scheduleToCloseTimeoutInput = page.locator('#scheduleToCloseTimeout');
    this.submitButton = page.getByTestId(
      'start-standalone-nexus-operation-submit-button',
    );
    this.operationIdInputError = page.getByText('Operation ID is required.');
    this.endpointInputError = page.getByText('Endpoint is required.');
    this.serviceInputError = page.getByText('Service is required.');
    this.operationNameInputError = page.getByText(
      'Operation Name is required.',
    );
    this.timeoutError = page.getByText(
      'At least one timeout (Start To Close or Schedule To Close) is required.',
    );
    this.moreOptionsButton = page.getByTestId(
      'start-standalone-nexus-operation-more-options',
    );
    this.addSearchAttributesCard = page.getByTestId(
      'start-standalone-nexus-operation-add-search-attributes',
    );
    this.addMetadataCard = page.getByTestId(
      'start-standalone-nexus-operation-add-metadata',
    );
  }

  public goto = async (params: Record<string, string> = {}) => {
    const paramsString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const path = paramsString
      ? `/namespaces/default/nexus-operations/start?${paramsString}`
      : '/namespaces/default/nexus-operations/start';

    await this.page.goto(path);
  };
}
