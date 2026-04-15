export default async function callLLMGemini(
  prompt: string,
): Promise<Record<string, unknown>> {
  return {
    result: `Here's a comparison of orchestration approaches for "${prompt}":\n\n| Approach | Durability | Observability | Complexity |\n|----------|-----------|---------------|------------|\n| Temporal | Full replay-based recovery | Event history + UI | Medium - determinism constraints |\n| LangGraph | Checkpoint-based | LangSmith traces | Low - Python-native |\n| Custom (Redis + queues) | Manual implementation | Custom logging | High - build everything yourself |\n\nRecommendation: For production AI agents that need reliability, Temporal provides the strongest durability guarantees. LangGraph is easier to start with but hits scaling and reliability limits in production. Custom solutions should be avoided unless you have very specific requirements.\n\nNext steps:\n- Start with a simple Temporal workflow wrapping your agent loop\n- Use activities for all LLM calls and tool executions\n- Add observability via the _details convention for per-step visibility\n- Consider the TemporalAgent wrapper from Pydantic AI for a higher-level API`,
    _details: {
      model: 'gemini-1.5-pro',
      promptTokens: 175,
      completionTokens: 440,
      totalTokens: 615,
      cost: 0.009,
    },
  };
}
