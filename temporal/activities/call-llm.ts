export default async function callLLM(
  prompt: string,
): Promise<Record<string, unknown>> {
  return {
    result: `Response to: ${prompt}`,
    _llm: {
      model: 'gpt-4o',
      promptTokens: 50,
      completionTokens: 30,
      totalTokens: 80,
      cost: 0.002,
    },
  };
}
