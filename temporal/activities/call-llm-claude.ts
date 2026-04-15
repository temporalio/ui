export default async function callLLMClaude(
  prompt: string,
): Promise<Record<string, unknown>> {
  return {
    result: `I'll analyze the durability guarantees for "${prompt}":\n\nThe key insight is that Temporal separates the orchestration logic (workflow) from the side effects (activities). When a workflow calls an activity, Temporal records the command in the event history. If the worker crashes mid-execution, a new worker picks up the workflow and replays the history - but it doesn't re-execute completed activities. It reads their results from history instead.\n\nThis means:\n1. Activities are guaranteed to run at-least-once (with configurable retry policies)\n2. The workflow function itself is deterministic and can be replayed safely\n3. Long-running operations (hours, days, months) work naturally\n4. You get an audit trail of every decision and outcome for free\n\nFor AI agents specifically, this is powerful because LLM calls are expensive and non-deterministic. With Temporal, if your agent crashes at step 47 of a 75-step workflow, it resumes from step 47 - it doesn't re-run (and re-pay for) the first 46 LLM calls.\n\nThe tradeoff is that workflow code must be deterministic. You can't use random numbers, current time, or make network calls directly in workflow code. All I/O must go through activities.`,
    _details: {
      model: 'claude-3-5-sonnet',
      promptTokens: 200,
      completionTokens: 520,
      totalTokens: 720,
      cost: 0.018,
    },
  };
}
