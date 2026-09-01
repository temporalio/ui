import { defineScenario } from '../../definition';

export const definition = defineScenario({
  name: 'catalog-signals-and-timers',
  title: 'Catalog examples covering signals, timers, and pending work',
  summary:
    'Starts catalog examples that leave open workflows behind: a bounded signal wait, a signal collector, a long activity, and a timer-driven repetition. Each one is a catalog example, so the catalog page runs the same code and the review covers what ships.',
  server: {
    source: 'auto',
    dynamicConfig: {
      'frontend.enableUpdateWorkflowExecution': true,
      'frontend.enableUpdateWorkflowExecutionAsyncAccepted': true,
    },
    searchAttributes: {
      CustomKeywordField: 'Keyword',
      CustomIntField: 'Int',
    },
  },
  examples: [
    {
      id: 'signal-handlers',
      workflowId: 'catalog-signal-handlers',
      input: [300],
      role: 'signal wait',
      note: "Waits five minutes for 'test-signal', so it stays open for review.",
    },
    {
      id: 'signal-collector',
      workflowId: 'catalog-signal-collector',
      input: [{ timeoutSeconds: 300, maxItems: 3 }],
      role: 'signal collector',
      note: 'Collects up to three signaled items before it processes them.',
    },
    {
      id: 'long-activity',
      workflowId: 'catalog-long-activity',
      role: 'pending activity',
    },
    {
      id: 'timer-driven-repetition',
      workflowId: 'catalog-timer-repetition',
      role: 'timers',
    },
  ],
  preview: {
    notes: [
      "Open each workflow's Timeline tab. Every pending activity and timer must show a pending marker.",
      'Leave a history page open for a minute. Auto-refresh must pick up new events without a reload.',
      "Send 'test-signal' to catalog-signal-handlers and confirm the history records it.",
      'Open the catalog page and confirm each example reports a worker polling its task queue.',
    ],
  },
});
