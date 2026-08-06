import { describe, expect, it, vi } from 'vitest';

import { createWorkflowCatalogExecutionLogger } from './workflow-execution-logger';

describe('createWorkflowCatalogExecutionLogger', () => {
  it('emits a whitelisted workflow execution event when a workflow starts', () => {
    const logger = createWorkflowCatalogExecutionLogger();
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.debug('Workflow started', {
      sdkComponent: 'worker',
      namespace: 'catalog-namespace',
      taskQueue: 'catalog-queue',
      workflowId: 'workflow-id',
      runId: 'run-id',
      workflowType: 'exampleWorkflow',
      input: { apiKey: 'secret' },
      startOptions: { credentials: 'secret' },
      payload: 'secret',
      error: new Error('secret'),
      unexpected: 'secret',
    });

    expect(output).toHaveBeenCalledWith(
      JSON.stringify({
        component: 'workflow-catalog',
        event: 'workflow-execution',
        status: 'started',
        namespace: 'catalog-namespace',
        taskQueue: 'catalog-queue',
        workflowId: 'workflow-id',
        runId: 'run-id',
        workflowType: 'exampleWorkflow',
      }),
    );
  });

  it('emits a workflow execution event when a workflow completes', () => {
    const logger = createWorkflowCatalogExecutionLogger();
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.debug('Workflow completed', { sdkComponent: 'worker' });

    expect(output).toHaveBeenCalledWith(
      JSON.stringify({
        component: 'workflow-catalog',
        event: 'workflow-execution',
        status: 'completed',
      }),
    );
  });

  it('emits a workflow execution event when a workflow fails', () => {
    const logger = createWorkflowCatalogExecutionLogger();
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.warn('Workflow failed', {
      sdkComponent: 'worker',
      error: new Error('secret'),
    });

    expect(output).toHaveBeenCalledWith(
      JSON.stringify({
        component: 'workflow-catalog',
        event: 'workflow-execution',
        status: 'failed',
      }),
    );
  });

  it('emits a workflow execution event when a workflow completes as cancelled', () => {
    const logger = createWorkflowCatalogExecutionLogger();
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.debug('Workflow completed as cancelled', {
      sdkComponent: 'worker',
    });

    expect(output).toHaveBeenCalledWith(
      JSON.stringify({
        component: 'workflow-catalog',
        event: 'workflow-execution',
        status: 'cancelled',
      }),
    );
  });

  it('emits a workflow execution event when a workflow continues as new', () => {
    const logger = createWorkflowCatalogExecutionLogger();
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.debug('Workflow continued as new', { sdkComponent: 'worker' });

    expect(output).toHaveBeenCalledWith(
      JSON.stringify({
        component: 'workflow-catalog',
        event: 'workflow-execution',
        status: 'continued-as-new',
      }),
    );
  });

  it('preserves ordinary SDK logs through the default INFO logger', () => {
    const defaultLogger = {
      log: vi.fn(),
      trace: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const logger = createWorkflowCatalogExecutionLogger(defaultLogger);
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const metadata = { state: 'RUNNING' };

    logger.info('Worker state changed', metadata);

    expect(defaultLogger.log).toHaveBeenCalledWith(
      'INFO',
      'Worker state changed',
      metadata,
    );
    expect(output).not.toHaveBeenCalled();
  });

  it('preserves a user workflow log whose message matches a lifecycle event', () => {
    const defaultLogger = {
      log: vi.fn(),
      trace: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const logger = createWorkflowCatalogExecutionLogger(defaultLogger);
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const metadata = { sdkComponent: 'workflow' };

    logger.info('Workflow started', metadata);

    expect(defaultLogger.log).toHaveBeenCalledWith(
      'INFO',
      'Workflow started',
      metadata,
    );
    expect(output).not.toHaveBeenCalled();
  });
});
