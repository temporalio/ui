export default async function callLLM(
  prompt: string,
): Promise<Record<string, unknown>> {
  return {
    result: `Based on the query "${prompt}", here's a comprehensive overview:\n\nTemporal is a durable execution platform that enables developers to build reliable distributed applications. At its core, Temporal provides fault-tolerant workflow orchestration - your code runs exactly once, survives failures, and can pick up where it left off after crashes, deploys, or infrastructure outages.\n\nKey concepts include:\n- **Workflows**: Long-running, deterministic functions that orchestrate your business logic\n- **Activities**: Individual units of work (API calls, DB writes, LLM calls) that can fail and retry independently\n- **Task Queues**: Named queues that route work to the right workers\n- **Signals & Updates**: Ways to interact with running workflows from the outside\n\nTemporal is used by companies like Netflix, Stripe, and Coinbase for mission-critical workflows including payment processing, order fulfillment, and increasingly, AI agent orchestration.`,
    _details: {
      model: 'gpt-4o',
      promptTokens: 150,
      completionTokens: 380,
      totalTokens: 530,
      cost: 0.012,
      temperature: 0.7,
      retrievalSource: 'knowledge-base-v3',
    },
  };
}
