import { expect, test } from '@playwright/test';

import { EventHistoryPage } from '../pages/event-history';
import { SignalModalPage } from '../pages/signal-modal';
import { WorkflowDetailPage } from '../pages/workflow-detail';
import { WorkflowQueryPage } from '../pages/workflow-query';

const WORKFLOW_ID = 'payload-coverage-workflow';

test.describe('Payload Decoder', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await page.getByRole('link', { name: WORKFLOW_ID, exact: true }).click();
  });

  test('workflow input is decoded', async ({ page }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    await expect(workflowDetail.inputAndResult).toContainText('hello world');
    await expect(workflowDetail.inputAndResult).toContainText('numberField');
    await expect(workflowDetail.inputAndResult).toContainText('3.14159');
    await expect(workflowDetail.inputAndResult).toContainText('arrayOfStrings');
  });

  test('memo payloads are decoded', async ({ page }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    await workflowDetail.openMemo();
    await expect(workflowDetail.main).toContainText(
      'Payload coverage test workflow',
    );
    await expect(workflowDetail.main).toContainText('e2e');
    await expect(workflowDetail.main).toContainText('coverage');
    await expect(workflowDetail.main).toContainText('testData');
  });

  test('search attributes are decoded', async ({ page }) => {
    const workflowDetail = new WorkflowDetailPage(page);
    await workflowDetail.openSearchAttributes();
    await expect(workflowDetail.main).toContainText('payload-coverage');
    await expect(workflowDetail.main).toContainText('CustomKeywordField');
  });

  test('event history WorkflowExecutionStarted shows decoded input', async ({
    page,
  }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    const eventHistory = new EventHistoryPage(page);
    await workflowDetail.openHistory();
    await eventHistory.switchToFeed();
    await eventHistory.expandEvent('Workflow Execution Started');
    const editor = eventHistory.expandedEditor('first', 0);
    await expect(editor).toContainText('hello world');
    await expect(editor).toContainText('stringField');
    await expect(editor).toContainText('arrayOfStrings');
  });

  test('event history ActivityTaskCompleted shows decoded result', async ({
    page,
  }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    const eventHistory = new EventHistoryPage(page);
    await workflowDetail.openHistory();
    await eventHistory.switchToFeed();
    await eventHistory.expandEvent('Activity Task Completed');
    const input = eventHistory.expandedEditor('first', 0);
    await expect(input).toContainText('alpha');
    await expect(input).toContainText('beta');
    await expect(input).toContainText('gamma');
    const result = eventHistory.expandedEditor('first', 1);
    await expect(result).toContainText('processed');
  });

  test('event history ActivityTaskFailed shows expanded event details', async ({
    page,
  }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    const eventHistory = new EventHistoryPage(page);
    await workflowDetail.openHistory();
    await eventHistory.switchToFeed();
    await eventHistory.expandEvent('Activity Task Failed');
    const expandedRow = eventHistory.expandedRow('first');
    await expect(expandedRow).toBeVisible();
    await expect(expandedRow).toContainText('Activity Task Failed');
  });

  test('event history StartChildWorkflowExecutionInitiated shows decoded input', async ({
    page,
  }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    const eventHistory = new EventHistoryPage(page);
    await workflowDetail.openHistory();
    await eventHistory.switchToFeed();
    await eventHistory.expandEvent('Start Child Workflow Execution Initiated');
    const editor = eventHistory.expandedEditor('first', 0);
    await expect(editor).toContainText('hello from PayloadCoverageWorkflow');
  });

  test('event history ChildWorkflowExecutionCompleted shows decoded result', async ({
    page,
  }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    const eventHistory = new EventHistoryPage(page);
    await workflowDetail.openHistory();
    await eventHistory.switchToFeed();
    await eventHistory.expandEvent('Child Workflow Execution Completed');
    const input = eventHistory.expandedEditor('first', 0);
    await expect(input).toContainText('hello from PayloadCoverageWorkflow');
    const result = eventHistory.expandedEditor('first', 1);
    await expect(result).toContainText(
      'child echoed: hello from PayloadCoverageWorkflow',
    );
  });

  test('query get-status returns decoded result', async ({ page }) => {
    const workflowDetail = new WorkflowDetailPage(page);
    const workflowQuery = new WorkflowQueryPage(page);
    await workflowDetail.openQueries();
    await workflowQuery.selectQueryType('get-status');
    await workflowQuery.run();
    await expect(workflowQuery.queryResult).toContainText('status');
    await expect(workflowQuery.queryResult).toContainText('count');
    await expect(workflowQuery.queryResult).toContainText('data');
  });

  test('query get-field returns decoded field value', async ({ page }) => {
    const workflowDetail = new WorkflowDetailPage(page);
    const workflowQuery = new WorkflowQueryPage(page);
    await workflowDetail.openQueries();
    await workflowQuery.selectQueryType('get-field');
    await workflowQuery.fillQueryArg('"stringField"');
    await workflowQuery.run();
    await expect(workflowQuery.queryResult).toContainText('hello world');
  });

  test('send signal and verify decoded signal payload in history', async ({
    page,
  }) => {
    test.slow();
    const workflowDetail = new WorkflowDetailPage(page);
    const signalModal = new SignalModalPage(page);
    const eventHistory = new EventHistoryPage(page);
    await signalModal.open();
    await expect(signalModal.modal).toBeVisible();
    await signalModal.selectSignal('add-data');
    await signalModal.fillPayload('{"key":"testKey","value":{"nested":true}}');
    await signalModal.submit();
    await workflowDetail.openHistory();
    await eventHistory.switchToFeed();
    await eventHistory.expandEvent('Workflow Execution Signaled', 'last');
    const editor = eventHistory.expandedEditor('last', 0);
    await expect(editor).toContainText('testKey');
    await expect(editor).toContainText('nested');
  });

  test('call stack shows stack trace', async ({ page }) => {
    const workflowDetail = new WorkflowDetailPage(page);
    await workflowDetail.openCallStack();
    await expect(workflowDetail.callStackEditor).toContainText('at workflow');
  });
});
