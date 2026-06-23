import * as workflow from '@temporalio/workflow';

import type * as activities from './activities';

const { classifyTicket, retrieveDocs, qualityCheck } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
});

const { draftResponse: draftResponseWithRetry } = workflow.proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 3 },
});

// Unwrap interceptor-wrapped results. The CompletionDetailsInterceptor wraps
// activity returns as { result, details } so the UI can read details.llm from
// the payload. Once the real proto exists, details move to
// ActivityTaskCompletedEventAttributes and this unwrap goes away.
function unwrap(val: unknown): unknown {
  if (
    val &&
    typeof val === 'object' &&
    'result' in (val as Record<string, unknown>)
  ) {
    return (val as Record<string, unknown>).result;
  }
  return val;
}

export async function TicketTriageWorkflow(
  ticketText: string,
): Promise<Record<string, unknown>> {
  const classificationJson = unwrap(await classifyTicket(ticketText)) as string;
  const classification = JSON.parse(classificationJson);

  const docs = unwrap(
    await retrieveDocs(classification.category as string),
  ) as string;

  const draftResult = await draftResponseWithRetry({
    ticketText,
    classification,
    docs,
  });
  const response = unwrap(draftResult) as string;
  const draftSpanId = (draftResult as Record<string, unknown>)?.details
    ? (
        (draftResult as Record<string, unknown>).details as Record<
          string,
          unknown
        >
      )?.llm
      ? ((
          (
            (draftResult as Record<string, unknown>).details as Record<
              string,
              unknown
            >
          ).llm as Record<string, unknown>
        )?.spanId as string | undefined)
      : undefined
    : undefined;

  const scoresJson = unwrap(
    await qualityCheck({ response, draftSpanId }),
  ) as string;
  const qualityScores = JSON.parse(scoresJson);

  return {
    classification,
    response,
    qualityScores,
  };
}
