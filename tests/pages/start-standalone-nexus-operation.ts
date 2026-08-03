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
  readonly editPoliciesButton: Locator;
  readonly endpointInputError: Locator;
  readonly serviceInputError: Locator;
  readonly operationNameInputError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.operationIdInput = page.locator('#operationId');
    this.endpointInput = page.locator('#endpoint');
    this.serviceInput = page.locator('#service');
    this.operationNameInput = page.locator('#operation');
    this.startToCloseTimeoutInput = page.locator('#drawer-startToCloseTimeout');
    this.scheduleToCloseTimeoutInput = page.locator(
      '#drawer-scheduleToCloseTimeout',
    );
    this.submitButton = page.getByTestId(
      'start-standalone-nexus-operation-submit-button',
    );
    this.editPoliciesButton = page.getByText('Edit Operation Policies');
    this.endpointInputError = page.getByText(
      'Target endpoint name is required.',
    );
    this.serviceInputError = page.getByText(
      'Nexus Service Name from the handler Namespace is required.',
    );
    this.operationNameInputError = page.getByText(
      "Operation Name from the handler Namespace's services is required.",
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
