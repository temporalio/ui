export default async function callLLMClaude(
  prompt: string,
): Promise<Record<string, unknown>> {
  return {
    result: `Claude response to: ${prompt}`,
    _llm: {
      model: 'claude-3-5-sonnet',
      promptTokens: 120,
      completionTokens: 80,
      totalTokens: 200,
      cost: 0.006,
    },
  };
}
