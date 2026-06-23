import type {
  ActivityExecuteInput,
  ActivityInboundCallsInterceptor,
  Next,
} from '@temporalio/worker';

import {
  getCompletionDetails,
  runWithDetailsContext,
} from './completion-details';

// Temporary interceptor that attaches completion details to the activity
// result payload so the UI prototype can read them. Once the proto exists,
// the SDK will write details.llm to ActivityTaskCompletedEventAttributes
// directly and this interceptor goes away.
export class CompletionDetailsInterceptor implements ActivityInboundCallsInterceptor {
  async execute(
    input: ActivityExecuteInput,
    next: Next<ActivityInboundCallsInterceptor, 'execute'>,
  ): Promise<unknown> {
    return runWithDetailsContext(async () => {
      const result = await next(input);
      const details = getCompletionDetails();
      if (!details) return result;
      return { result, details };
    });
  }
}
