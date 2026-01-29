import type { Locator, Page } from '@playwright/test';

export class StartStandaloneActivityPage {
  readonly page: Page;
  readonly activityIdInput: Locator;
  readonly activityTypeInput: Locator;
  readonly taskQueueInput: Locator;
  readonly startToCloseTimeoutInput: Locator;
  readonly scheduleToCloseTimeoutInput: Locator;
  readonly submitButton: Locator;
  readonly activityIdInputError: Locator;
  readonly activityTypeInputError: Locator;
  readonly taskQueueInputError: Locator;
  readonly timeoutError: Locator;
  readonly moreOptionsButton: Locator;
  readonly addSearchAttributesCard: Locator;
  readonly addMetadataCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.activityIdInput = page.locator('#activityId');
    this.activityTypeInput = page.locator('#activityType');
    this.taskQueueInput = page.locator('#taskQueue');
    this.startToCloseTimeoutInput = page.locator('#startToCloseTimeout');
    this.scheduleToCloseTimeoutInput = page.locator('#scheduleToCloseTimeout');
    this.submitButton = page.getByTestId(
      'start-standalone-activity-submit-button',
    );
    this.activityIdInputError = page.getByText('Activity ID is required.');
    this.activityTypeInputError = page.getByText('Activity Type is required.');
    this.taskQueueInputError = page.getByText('Task Queue is required.');
    this.timeoutError = page.getByText(
      'Either "Start to Close Timeout" or "Schedule to Close Timeout" is required.',
    );

    this.moreOptionsButton = page.getByTestId(
      'start-standalone-activity-more-options',
    );
    this.addSearchAttributesCard = page.getByTestId(
      'start-standalone-activity-add-search-attributes',
    );
    this.addMetadataCard = page.getByTestId(
      'start-standalone-activity-add-metadata',
    );
  }

  public goto = async (params: Record<string, string> = {}) => {
    const paramsString = Object.entries(params).reduce(
      (queryString, [key, value]) => {
        return `${queryString}&${key}=${value}`;
      },
      '',
    );

    const path = paramsString
      ? `/namespaces/default/activities/start?${paramsString}`
      : '/namespaces/default/activities/start';

    await this.page.goto(path);
  };
}
