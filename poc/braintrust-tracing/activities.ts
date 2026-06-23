import { currentLogger, currentSpan, startSpan } from 'braintrust';

import { setCompletionDetails } from './completion-details';

async function getTraceUrl(): Promise<string | undefined> {
  try {
    const span = currentSpan();
    return await span.permalink();
  } catch {
    return undefined;
  }
}

function getSpanId(): string | undefined {
  try {
    return currentSpan().id;
  } catch {
    return undefined;
  }
}

// --- Activity 1: Classify the support ticket (simulated LLM) ---
export async function classifyTicket(_ticketText: string): Promise<string> {
  const classification = {
    intent: 'troubleshooting',
    urgency: 'high',
    category: 'activity-timeouts',
    confidence: 0.92,
  };

  const traceUrl = await getTraceUrl();

  setCompletionDetails({
    llm: {
      model: 'gpt-4o-mini',
      promptTokens: 185,
      completionTokens: 45,
      totalTokens: 230,
      cost: 0.0004,
      ...(traceUrl && { traceUrl }),
    },
  });

  return JSON.stringify(classification);
}

// --- Activity 2: Retrieve relevant docs (non-LLM) ---
export async function retrieveDocs(category: string): Promise<string> {
  const docMap: Record<string, string> = {
    'activity-timeouts': `## Activity Timeouts
StartToCloseTimeout: Max time for a single activity attempt.
ScheduleToCloseTimeout: Max time from scheduling to completion (including retries).
HeartbeatTimeout: Max time between heartbeats for long-running activities.

Best practice: Set StartToCloseTimeout to your expected max duration + buffer.
For external API calls, use HeartbeatTimeout to detect stuck activities early.`,
    'worker-issues': `## Worker Troubleshooting
Check worker logs for connection errors. Verify task queue name matches.
Use temporal workflow describe to check pending activities.`,
    general: `## General Temporal Support
Visit docs.temporal.io for comprehensive guides.
Join the Temporal community Slack for peer support.`,
  };

  const docs = docMap[category] || docMap['general'];

  startSpan({
    name: 'doc_lookup',
    type: 'tool',
    event: {
      input: { category },
      output: { docLength: docs.length, source: 'knowledge-base-v2' },
    },
  });

  return docs;
}

// --- Activity 3: Draft a customer response (simulated LLM) ---
export async function draftResponse(_input: {
  ticketText: string;
  classification: Record<string, unknown>;
  docs: string;
}): Promise<string> {
  const response = `Hi there,

Thank you for reaching out about the StartToCloseTimeout errors on your payment processing activities.

The issue is that your timeout (10s) is shorter than your external API's response time (30s+). Here's how to fix this while maintaining durability:

1. **Increase StartToCloseTimeout** to 60s (or your max acceptable wait time):
   \`\`\`python
   @workflow.defn
   class PaymentWorkflow:
       @workflow.run
       async def run(self, payment_id: str):
           result = await workflow.execute_activity(
               process_payment,
               payment_id,
               start_to_close_timeout=timedelta(seconds=60),
               heartbeat_timeout=timedelta(seconds=10),
           )
   \`\`\`

2. **Add HeartbeatTimeout** (10s recommended) so Temporal detects stuck activities faster than the full timeout window.

3. **Durability is preserved** - if your worker crashes mid-activity, Temporal will retry on another worker. The timeout just needs to be long enough for the external API to respond.

Let me know if you need further help!`;

  const traceUrl = await getTraceUrl();
  const spanId = getSpanId();

  setCompletionDetails({
    llm: {
      model: 'gpt-4o-mini',
      promptTokens: 520,
      completionTokens: 380,
      totalTokens: 900,
      cost: 0.0018,
      ...(traceUrl && { traceUrl }),
      ...(spanId && { spanId }),
    },
  });

  return response;
}

// --- Activity 4: Quality check the response (LLM-as-judge) ---
export async function qualityCheck(input: {
  response: string;
  draftSpanId?: string;
}): Promise<string> {
  const scores = {
    helpfulness: 5,
    accuracy: 4,
    tone: 5,
    verdict: 'pass',
    notes:
      'Response correctly identifies the timeout mismatch and provides actionable code example. Minor: could mention ScheduleToCloseTimeout as an alternative.',
  };

  // Score the draftResponse span in Braintrust (LLM-as-judge pattern)
  if (input.draftSpanId) {
    try {
      const logger = currentLogger();
      logger.logFeedback({
        id: input.draftSpanId,
        scores: {
          helpfulness: scores.helpfulness / 5,
          accuracy: scores.accuracy / 5,
          tone: scores.tone / 5,
        },
        comment: scores.notes,
        source: 'external',
      });
    } catch {
      // Scoring is best-effort
    }
  }

  const traceUrl = await getTraceUrl();

  setCompletionDetails({
    llm: {
      model: 'gpt-4o-mini',
      promptTokens: 420,
      completionTokens: 65,
      totalTokens: 485,
      cost: 0.0008,
      score: (scores.helpfulness + scores.accuracy + scores.tone) / 15,
      ...(traceUrl && { traceUrl }),
    },
  });

  return JSON.stringify(scores);
}
