import type { Logger } from '@temporalio/common';
import { describe, expect, it, vi } from 'vitest';

import { createCatalogExecutionLogger } from './workflow-execution-logger.js';

const createFallbackLogger = (): Logger => ({
  log: vi.fn(),
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

describe('createCatalogExecutionLogger', () => {
  it('emits a whitelisted workflow execution event when a workflow starts', () => {
    const logger = createCatalogExecutionLogger(createFallbackLogger());
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
        component: 'catalog',
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

  it.each([
    ['Workflow completed', 'completed'],
    ['Workflow failed', 'failed'],
    ['Workflow completed as cancelled', 'cancelled'],
    ['Workflow continued as new', 'continued-as-new'],
  ] as const)('emits %s with status %s', (message, status) => {
    const logger = createCatalogExecutionLogger(createFallbackLogger());
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);

    logger.debug(message, {
      sdkComponent: 'worker',
      error: new Error('secret'),
    });

    expect(output).toHaveBeenCalledWith(
      JSON.stringify({
        component: 'catalog',
        event: 'workflow-execution',
        status,
      }),
    );
  });

  it('delegates ordinary SDK logs to the injected fallback logger', () => {
    const fallbackLogger = createFallbackLogger();
    const logger = createCatalogExecutionLogger(fallbackLogger);
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const metadata = { state: 'RUNNING' };

    logger.info('Worker state changed', metadata);

    expect(fallbackLogger.log).toHaveBeenCalledWith(
      'INFO',
      'Worker state changed',
      metadata,
    );
    expect(output).not.toHaveBeenCalled();
  });

  it('delegates matching user workflow logs to the injected fallback logger', () => {
    const fallbackLogger = createFallbackLogger();
    const logger = createCatalogExecutionLogger(fallbackLogger);
    const output = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const metadata = { sdkComponent: 'workflow' };

    logger.info('Workflow started', metadata);

    expect(fallbackLogger.log).toHaveBeenCalledWith(
      'INFO',
      'Workflow started',
      metadata,
    );
    expect(output).not.toHaveBeenCalled();
  });
});
