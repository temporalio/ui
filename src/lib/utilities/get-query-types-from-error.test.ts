import { describe, expect, it } from 'vitest';

import { getQueryTypesFromError } from './get-query-types-from-error';

const error = {
  code: 3,
  message:
    'unknown queryType @@temporal-internal__list. KnownQueryTypes=[__stack_trace __open_sessions]',
  details: [
    {
      typeUrl:
        'type.googleapis.com/temporal.api.errordetails.v1.QueryFailedFailure',
      value: null,
    },
  ],
};

const javaSDKError = {
  code: 3,
  message:
    'java.lang.IllegalArgumentException: Unknown query type: @@temporal-internal__list, knownTypes=[getLoan, getNextPaymentDue, getPaymentObligations, getNextPaymentObligation]\n\tat io.temporal.internal.sync.QueryDispatcher.handleQuery(QueryDispatcher.java:79)\n\tat io.temporal.internal.sync.SyncWorkflowContext.handleQuery(SyncWorkflowContext.java:277)\n\tat io.temporal.internal.sync.WorkflowExecuteRunnable.handleQuery(WorkflowExecuteRunnable.java:118)\n\tat io.temporal.internal.sync.SyncWorkflow.query(SyncWorkflow.java:187)\n\tat io.temporal.internal.replay.ReplayWorkflowExecutor.query(ReplayWorkflowExecutor.java:136)\n\tat io.temporal.internal.replay.ReplayWorkflowRunTaskHandler.handleQueryWorkflowTask(ReplayWorkflowRunTaskHandler.java:241)\n\tat io.temporal.internal.replay.ReplayWorkflowTaskHandler.handleWorkflowTaskWithQuery(ReplayWorkflowTaskHandler.java:117)\n\tat io.temporal.internal.replay.ReplayWorkflowTaskHandler.handleWorkflowTask(ReplayWorkflowTaskHandler.java:97)\n\tat io.temporal.internal.worker.WorkflowWorker$TaskHandlerImpl.handleTask(WorkflowWorker.java:277)\n\tat io.temporal.internal.worker.WorkflowWorker$TaskHandlerImpl.handle(WorkflowWorker.java:231)\n\tat io.temporal.internal.worker.WorkflowWorker$TaskHandlerImpl.handle(WorkflowWorker.java:173)\n\tat io.temporal.internal.worker.PollTaskExecutor.lambda$process$0(PollTaskExecutor.java:93)\n\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)\n\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)\n\tat java.lang.Thread.run(Thread.java:750)\n',
  details: [
    {
      typeUrl:
        'type.googleapis.com/temporal.api.errordetails.v1.QueryFailedFailure',
      value: null,
    },
  ],
};

describe('getQueryTypesFromError', () => {
  it('should return an array of query types', () => {
    const queryTypes = ['__open_sessions'];
    expect(getQueryTypesFromError(error.message)).toEqual(queryTypes);
  });

  it('should omit __stack_traces', () => {
    expect(getQueryTypesFromError(error.message)).not.toContain(
      '__stack_trace',
    );
  });

  it('should work with the Java SDK', () => {
    expect(getQueryTypesFromError(javaSDKError.message)).toEqual([
      'getLoan',
      'getNextPaymentDue',
      'getPaymentObligations',
      'getNextPaymentObligation',
    ]);
  });
});
