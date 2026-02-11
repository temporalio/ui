import type { Locator, Page } from '@playwright/test';

export class WorkflowPausePage {
  readonly page: Page;
  readonly pauseButton: Locator;
  readonly unpauseButton: Locator;
  readonly pauseModal: Locator;
  readonly unpauseModal: Locator;
  readonly pauseReasonInput: Locator;
  readonly unpauseReasonInput: Locator;
  readonly pauseConfirmButton: Locator;
  readonly unpauseConfirmButton: Locator;
  readonly pauseCancelButton: Locator;
  readonly unpauseCancelButton: Locator;
  readonly pausedAlert: Locator;
  readonly pausedAlertReason: Locator;
  readonly pausedStatus: Locator;
  readonly moreActionsButton: Locator;
  readonly updateMenuItem: Locator;
  readonly resetMenuItem: Locator;
  readonly signalMenuItem: Locator;
  readonly terminateMenuItem: Locator;
  readonly requestCancellationButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pauseButton = page.getByRole('button', { name: 'Pause Workflow' });
    this.unpauseButton = page.getByRole('button', {
      name: 'Unpause Workflow',
    });
    this.pauseModal = page
      .getByTestId('workflow-pause-confirmation-modal')
      .locator('visible=true');
    this.unpauseModal = page
      .getByTestId('workflow-unpause-confirmation-modal')
      .locator('visible=true');
    this.pauseReasonInput = page
      .locator('#workflow-pause-details')
      .locator('visible=true');
    this.unpauseReasonInput = page
      .locator('#workflow-unpause-details')
      .locator('visible=true');
    this.pauseConfirmButton = this.pauseModal.getByRole('button', {
      name: 'Pause Workflow',
    });
    this.unpauseConfirmButton = this.unpauseModal.getByRole('button', {
      name: 'Unpause Workflow',
    });
    this.pauseCancelButton = this.pauseModal.getByRole('button', {
      name: 'Cancel',
    });
    this.unpauseCancelButton = this.unpauseModal.getByRole('button', {
      name: 'Cancel',
    });
    this.pausedAlert = page.getByTestId('workflow-paused-alert');
    this.pausedAlertReason = page.getByText('Reason this Workflow is paused');
    this.pausedStatus = page.getByTestId('workflow-status');
    this.moreActionsButton = page.getByRole('button', { name: 'More Actions' });
    this.updateMenuItem = page
      .getByTestId('update-button')
      .locator('visible=true')
      .first();
    this.resetMenuItem = page.getByRole('menuitem', { name: 'Reset' });
    this.signalMenuItem = page.getByRole('menuitem', { name: 'Send a Signal' });
    this.terminateMenuItem = page.getByRole('menuitem', { name: 'Terminate' });
    this.requestCancellationButton = page.getByRole('button', {
      name: 'Request Cancellation',
    });
  }

  public goto = async (params: {
    namespace?: string;
    workflowId: string;
    runId: string;
  }) => {
    const namespace = params.namespace || 'default';
    const path = `/namespaces/${namespace}/workflows/${params.workflowId}/${params.runId}`;
    await this.page.goto(path);
  };

  async openPauseModal() {
    await this.pauseButton.click();
  }

  async openUnpauseModal() {
    await this.unpauseButton.click();
  }

  async pauseWorkflow(reason: string) {
    await this.openPauseModal();
    await this.pauseReasonInput.fill(reason);
    await this.pauseConfirmButton.click();
  }

  async unpauseWorkflow(reason: string) {
    await this.openUnpauseModal();
    await this.unpauseReasonInput.fill(reason);
    await this.unpauseConfirmButton.click();
  }

  async cancelPause() {
    await this.pauseCancelButton.click();
  }

  async cancelUnpause() {
    await this.unpauseCancelButton.click();
  }

  async openMoreActionsMenu() {
    await this.moreActionsButton.click();
  }

  async isPauseButtonVisible(): Promise<boolean> {
    return await this.pauseButton.isVisible();
  }

  async isUnpauseButtonVisible(): Promise<boolean> {
    return await this.unpauseButton.isVisible();
  }

  async isPausedAlertVisible(): Promise<boolean> {
    return await this.pausedAlert.isVisible();
  }
}
