import type { Locator, Page } from '@playwright/test';

export class StandaloneActivityCommandsPage {
  readonly page: Page;
  readonly pauseButton: Locator;
  readonly unpauseButton: Locator;
  readonly moreActionsButton: Locator;
  readonly updateMenuItem: Locator;
  readonly resetMenuItem: Locator;
  readonly pauseModal: Locator;
  readonly unpauseModal: Locator;
  readonly resetModal: Locator;
  readonly updateDrawer: Locator;
  readonly pauseReasonInput: Locator;
  readonly resetHeartbeatCheckbox: Locator;
  readonly taskQueueInput: Locator;
  readonly pauseConfirmButton: Locator;
  readonly unpauseConfirmButton: Locator;
  readonly resetConfirmButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pauseButton = page
      .getByRole('button', { name: 'Pause', exact: true })
      .first();
    this.unpauseButton = page
      .getByRole('button', { name: 'Unpause', exact: true })
      .first();
    this.moreActionsButton = page
      .getByRole('button', { name: 'More Actions' })
      .first();
    this.updateMenuItem = page.getByTestId('update-button');
    this.resetMenuItem = page.getByTestId('reset-button');
    this.pauseModal = page
      .getByTestId('activity-pause-confirmation-modal')
      .locator('visible=true');
    this.unpauseModal = page
      .getByTestId('activity-unpause-confirmation-modal')
      .locator('visible=true');
    this.resetModal = page
      .getByTestId('activity-reset-confirmation-modal')
      .locator('visible=true');
    this.updateDrawer = page
      .locator('#activity-options-update-drawer')
      .locator('visible=true');
    this.pauseReasonInput = page
      .locator('#activity-pause-reason')
      .locator('visible=true');
    this.resetHeartbeatCheckbox = this.resetModal.getByTestId(
      'reset-heartbeat-details',
    );
    this.taskQueueInput = page
      .locator('#task-queue-name')
      .locator('visible=true');
    this.pauseConfirmButton = this.pauseModal.getByRole('button', {
      name: 'Pause',
    });
    this.unpauseConfirmButton = this.unpauseModal.getByRole('button', {
      name: 'Unpause',
    });
    this.resetConfirmButton = this.resetModal.getByRole('button', {
      name: 'Reset',
    });
    this.saveButton = this.updateDrawer.getByRole('button', { name: 'Save' });
  }

  public goto = async (params: {
    namespace?: string;
    activityId: string;
    runId: string;
  }) => {
    const namespace = params.namespace || 'default';
    const path = `/namespaces/${namespace}/activities/${params.activityId}/${params.runId}/details`;
    await this.page.goto(path);
  };
}
