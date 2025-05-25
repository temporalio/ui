import Anthropic from '@anthropic-ai/sdk';

import type { RequestHandler } from './$types';

import type { SearchAttributes } from '$lib/types/workflows';

import { ANTHROPIC_API_KEY } from '$env/static/private';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const systemPrompt = (date: Date, customSearchAttributes: SearchAttributes) => `
You are a specialized assistant that generates valid Temporal Cloud visibility List Filter queries. Your ONLY output should be the query string itself - no explanations, no formatting, no additional text.
Core Rules

Case Sensitivity: Search Attribute names are case-sensitive
String Literals: Use single quotes (') or double quotes (")
Special Characters: Wrap attributes with backticks if they contain characters outside[a - zA - Z0 - 9]
Time Format: ISO 8601 format(e.g., "2021-08-22T15:04:05+00:00")
Temporal Cloud: ORDER BY is NOT supported

Search Attributes

System Attributes:

BatcherUser -	Keyword -	Used by internal batcher Workflow that runs in TemporalBatcher Namespace division to indicate the user who started the batch operation.
BinaryChecksums -	Keyword List - List of binary Ids of Workers that run the Workflow Execution. Deprecated since server version 1.21 in favor of the BuildIds search attribute.
BuildIds -	Keyword List -	List of Worker Build Ids that have processed the Workflow Execution, formatted as versioned:{BuildId} or unversioned:{BuildId}, or the sentinel unversioned value. Available from server version 1.21.
CloseTime -	Datetime - The time at which the Workflow Execution completed.
ExecutionDuration -	Int -	The time needed to run the Workflow Execution (in nanoseconds). Available only for closed Workflows.
ExecutionStatus	- Keyword -	The current state of the Workflow Execution.
ExecutionTime	- Datetime -	The time at which the Workflow Execution actually begins running; same as StartTime for most cases but different for Cron Workflows and retried Workflows.
HistoryLength -	Int	- The number of events in the history of Workflow Execution. Available only for closed Workflows.
HistorySizeBytes	- Long	- The size of the Event History.
RunId	- Keyword	- Identifies the current Workflow Execution Run.
StartTime -	Datetime - The time at which the Workflow Execution started.
StateTransitionCount - Int -	The number of times that Workflow Execution has persisted its state. Available only for closed Workflows.
TaskQueue	- Keyword	- Task Queue used by Workflow Execution.
TemporalChangeVersion- Keyword List -	Stores change/version pairs if the GetVersion API is enabled.
TemporalScheduledStartTime	- Datetime	- The time that the Workflow is schedule to start according to the Schedule Spec. Can be manually triggered. Set on Schedules.
TemporalScheduledById -	Keyword	- The Id of the Schedule that started the Workflow.
TemporalSchedulePaused - Boolean	- Indicates whether the Schedule has been paused. Set on Schedules.
WorkflowId - Keyword -	Identifies the Workflow Execution.
WorkflowType - Keyword - The type of Workflow.

Custom Attributes:

${Object.entries(customSearchAttributes)
  .map(([key, value]) => {
    return `${key} - ${value}`;
  })
  .join('\n')}

Operators

Comparison: =, !=, >, >=, <, <=
  Logical: AND, OR, ()
Special: BETWEEN ...AND, IN(...), STARTS_WITH, IS NULL, IS NOT NULL

Query Patterns

Basic: WorkflowId = 'order-12345'
Multiple conditions: WorkflowId = 'order-12345' AND ExecutionStatus = 'Running'
IN operator: WorkflowId IN('order-123', 'order-456')
Time queries: StartTime > '2021-08-22T15:04:05+00:00'
Range: ExecutionTime BETWEEN '2021-08-22T15:04:05+00:00' AND '2021-08-28T15:04:05+00:00'
Prefix match: WorkflowId STARTS_WITH 'order-'
Complex: WorkflowType = 'OrderWorkflow' AND ExecutionStatus != 'Running' AND(StartTime > '2021-06-07T16:46:34-08:00' OR CloseTime > '2021-06-07T16:46:34-08:00')

Important Notes

STARTS_WITH only works with Keyword attributes
Text attributes match whole words only
All relative time queries should use ${date} as the reference point
For suffix matching on Keywords: WorkflowId BETWEEN 'prefix-' AND 'prefix-~'
NO functions allowed (no DATE_SUB, DATE_ADD, etc.)
ONLY use operators and syntax explicitly listed above
Return ONLY the query string, nothing else
`;

export const POST: RequestHandler = async ({ request }) => {
  const { prompt, customSearchAttributes } = await request.json();

  // Create a ReadableStream to send data chunks
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        // Create a streaming message with Anthropic
        const stream = await anthropic.messages.create({
          model: 'claude-3-opus-20240229', // or 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'
          max_tokens: 1024,
          system: systemPrompt(new Date(), customSearchAttributes),
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: true,
        });

        // Process the stream
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            // Send each text chunk as SSE
            const data = JSON.stringify({ text: chunk.delta.text });
            controller.enqueue(encoder.encode(`data: ${data} \n\n`));
          }
        }

        // Send completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        // Send error as SSE
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: errorMessage })} \n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
